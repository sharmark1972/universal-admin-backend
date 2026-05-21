'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

export function useAuth() {
  const { data: session, status } = useSession();

  const isLoading = status === 'loading';
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]) => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const isAdmin = () => hasRole(UserRole.ADMIN);
  const isStudent = () => hasRole(UserRole.STUDENT);
  const isReviewer = () => hasRole(UserRole.REVIEWER);
  const isAuthor = () => hasRole(UserRole.AUTHOR);

  const canSubmitPaper = () => {
    return hasAnyRole([UserRole.STUDENT, UserRole.AUTHOR]);
  };

  const canReviewPaper = () => {
    return hasAnyRole([UserRole.REVIEWER, UserRole.ADMIN]);
  };

  const canManageUsers = () => {
    return hasRole(UserRole.ADMIN);
  };

  const canAccessAdminPanel = () => {
    return hasRole(UserRole.ADMIN) && !user?.banned;
  };

  const isBanned = () => {
    return user?.banned === true;
  };

  const hasWarning = () => {
    return user?.warning === true;
  };

  const canPerformAction = () => {
    return isAuthenticated && !isBanned();
  };

  const getBannedReason = () => {
    return user?.bannedReason || 'No reason provided';
  };

  const getWarningMessage = () => {
    return user?.warningMessage || 'No message provided';
  };

  return {
    user,
    isLoading,
    loading: isLoading, // Add loading alias for backward compatibility
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isStudent,
    isReviewer,
    isAuthor,
    canSubmitPaper: () => canSubmitPaper() && !isBanned(),
    canReviewPaper: () => canReviewPaper() && !isBanned(),
    canManageUsers,
    canAccessAdminPanel,
    isBanned,
    hasWarning,
    canPerformAction,
    getBannedReason,
    getWarningMessage,
  };
}