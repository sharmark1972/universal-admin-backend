import { UserRole } from '@prisma/client';
import { DefaultSession } from 'next-auth';

export type ExtendedUserRole = UserRole | 'SUPER_ADMIN';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: ExtendedUserRole;
      institution?: string;
      firstName?: string;
      lastName?: string;
      banned?: boolean;
      bannedReason?: string;
      warning?: boolean;
      warningMessage?: string;
      siteSlug?: string;
      activeSiteSlug?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: ExtendedUserRole;
    institution?: string;
    firstName?: string;
    lastName?: string;
    banned?: boolean;
    bannedReason?: string;
    warning?: boolean;
    warningMessage?: string;
    siteSlug?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: ExtendedUserRole;
    institution?: string;
    firstName?: string;
    lastName?: string;
    banned?: boolean;
    bannedReason?: string;
    warning?: boolean;
    warningMessage?: string;
    siteSlug?: string;
    activeSiteSlug?: string;
  }
}