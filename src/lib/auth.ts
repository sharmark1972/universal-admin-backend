// Backward-compat bridge — use getAuthOptions(prisma, siteSlug) from auth-factory instead.
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { UserRole } from '@prisma/client';
import { encode, decode } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          console.log('NextAuth: Starting authorization for:', credentials?.email);
          
          if (!credentials?.email || !credentials?.password) {
            console.log('NextAuth: Missing credentials');
            return null;
          }

          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user || !user.passwordHash) {
            console.log('NextAuth: User not found or no password hash');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) {
            console.log('NextAuth: Invalid password');
            return null;
          }

          if (!user.isVerified) {
            console.log('NextAuth: User not verified');
            throw new Error('Please verify your email before logging in.');
          }

          console.log('NextAuth: Authorization successful for user:', user.email);
          
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            institution: user.institution || undefined,
            firstName: user.firstName,
            lastName: user.lastName,
            banned: user.isBanned,
            bannedReason: user.banReason || undefined,
            warning: user.warningMessage ? true : false,
            warningMessage: user.warningMessage || undefined,
          };
        } catch (error) {
          console.error('NextAuth: Authorization error:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
    generateSessionToken: () => {
      return crypto.randomUUID();
    },
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    encode: async ({ token, secret }) => {
      console.log('JWT: Encoding token for user:', token?.sub);
      return encode({ token, secret });
    },
    decode: async ({ token, secret }) => {
      try {
        const decoded = await decode({ token, secret });
        console.log('JWT: Successfully decoded token for user:', decoded?.sub);
        return decoded;
      } catch (error) {
        console.error('JWT: Failed to decode token:', error);
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      try {
        console.log('NextAuth JWT callback - trigger:', trigger, 'user:', !!user, 'token.sub:', token.sub);
        
        if (user) {
          console.log('NextAuth: Adding user data to JWT token');
          token.role = user.role;
          token.institution = user.institution;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.banned = user.banned;
          token.bannedReason = user.bannedReason;
          token.warning = user.warning;
          token.warningMessage = user.warningMessage;
        }
        
        // Ensure token has required fields
        if (!token.sub && user?.id) {
          token.sub = user.id;
        }
        
        console.log('NextAuth: JWT token processed successfully');
        return token;
      } catch (error) {
        console.error('NextAuth: JWT callback error:', error);
        return token;
      }
    },
    session: async ({ session, token }) => {
      console.log('Session callback - token:', token);
      console.log('Session callback - session before:', session);
      
      try {
        if (token && session.user) {
          // Ensure all required fields are present
          session.user.id = token.sub as string;
          session.user.role = token.role as UserRole;
          session.user.banned = token.banned as boolean;
          session.user.bannedReason = (token.bannedReason as string | null) || undefined;
          session.user.email = token.email as string;
          
          // Validate session integrity
          if (!session.user.id || !session.user.email || !session.user.role) {
            console.error('Session callback - Missing required user fields:', {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role
            });
            throw new Error('Invalid session data');
          }
          
          console.log('Session callback - session successfully created for user:', session.user.id);
        } else {
          console.warn('Session callback - Missing token or session.user');
        }
        
        console.log('Session callback - session after:', session);
        return session;
      } catch (error) {
        console.error('Session callback - Error creating session:', error);
        // Return a minimal session to prevent complete failure
        return {
          ...session,
          user: session.user || null
        };
      }
    },
  },
  pages: {
    signIn: '/auth/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    },
  },
};