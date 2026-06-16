import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { encode, decode } from 'next-auth/jwt';
import { getSiteConfig } from '@/config/sites';

export type ExtendedUserRole = UserRole | 'SUPER_ADMIN';

export function getAuthOptions(prisma: PrismaClient, siteSlug: string): NextAuthOptions {
  const siteConfig = getSiteConfig(siteSlug);
  const secret = siteConfig
    ? (process.env[siteConfig.nextauthSecretEnvVar] ?? process.env.NEXTAUTH_SECRET ?? '')
    : (process.env.NEXTAUTH_SECRET ?? '');

  return {
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
            if (!credentials?.email || !credentials?.password) return null;

            // Super-admin — no DB needed, env-based credentials
            const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
            const superAdminHash = process.env.SUPER_ADMIN_PASS_HASH;
            if (superAdminEmail && superAdminHash && credentials.email === superAdminEmail) {
              const valid = await bcrypt.compare(credentials.password, superAdminHash);
              if (!valid) return null;
              return {
                id: 'super-admin',
                email: superAdminEmail,
                name: 'Super Admin',
                role: 'SUPER_ADMIN' as ExtendedUserRole,
                firstName: 'Super',
                lastName: 'Admin',
                banned: false,
                siteSlug: 'super',
              };
            }

            // Per-site user
            const user = await prisma.user.findUnique({
              where: { email: credentials.email },
            });

            if (!user || !user.passwordHash) return null;

            const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isPasswordValid) return null;

            if (!user.isVerified) {
              throw new Error('Please verify your email before logging in.');
            }

            return {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role as ExtendedUserRole,
              institution: user.institution || undefined,
              firstName: user.firstName,
              lastName: user.lastName,
              banned: user.isBanned,
              bannedReason: user.banReason || undefined,
              warning: user.warningMessage ? true : false,
              warningMessage: user.warningMessage || undefined,
              siteSlug,
            };
          } catch (error) {
            console.error('NextAuth: Authorization error:', error);
            throw error;
          }
        },
      }),
    ],
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      generateSessionToken: () => crypto.randomUUID(),
    },
    jwt: {
      maxAge: 30 * 24 * 60 * 60,
      encode: async ({ token, secret: s }) => {
        return encode({ token, secret: s });
      },
      decode: async ({ token, secret: s }) => {
        try {
          return await decode({ token, secret: s });
        } catch {
          return null;
        }
      },
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role as ExtendedUserRole;
          token.institution = user.institution;
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          token.banned = user.banned;
          token.bannedReason = user.bannedReason;
          token.warning = user.warning;
          token.warningMessage = user.warningMessage;
          token.siteSlug = (user as { siteSlug?: string }).siteSlug ?? siteSlug;
        }
        if (!token.sub && user?.id) token.sub = user.id;
        return token;
      },
      session: async ({ session, token }) => {
        if (token && session.user) {
          session.user.id = token.sub as string;
          session.user.role = token.role as ExtendedUserRole;
          session.user.banned = token.banned as boolean;
          session.user.bannedReason = (token.bannedReason as string | null) || undefined;
          session.user.email = token.email as string;
          session.user.siteSlug = token.siteSlug as string;
        }
        return session;
      },
    },
    pages: { signIn: '/auth/login' },
    secret,
    debug: process.env.NODE_ENV === 'development',
    logger: {
      error(code, metadata) { console.error('NextAuth Error:', code, metadata); },
      warn(code) { console.warn('NextAuth Warning:', code); },
      debug(code, metadata) {
        if (process.env.NODE_ENV === 'development') console.log('NextAuth Debug:', code, metadata);
      },
    },
  };
}
