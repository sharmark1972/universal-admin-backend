import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getAdminStoreStorageKey } from '@/lib/admin-site';

// --- Types ---

interface AdminStats {
  overview: {
    totalUsers: number;
    totalPapers: number;
    totalReviews: number;
    totalConferences: number;
    totalDownloads: number;
    activeUsers: number;
    bannedUsers: number;
    warnedUsers: number;
    averageRating: number;
  };
  usersByRole: Record<string, number>;
  papersByStatus: Record<string, number>;
  conferencesByStatus: Record<string, number>;
  recentActivity: any[];
  systemHealth: any;
}

interface UsersData {
  users: any[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

interface PapersData {
  papers: any[];
  totalPapers: number;
  totalPages: number;
  currentPage: number;
}

interface ConferencesData {
  conferences: any[];
  totalConferences: number;
  totalPages: number;
  currentPage: number;
}

interface EbooksData {
  ebooks: any[];
  totalEbooks: number;
  totalPages: number;
  currentPage: number;
}

// --- Store ---

interface AdminStore {
  // Dashboard
  stats: AdminStats | null;
  statsLoaded: boolean;
  setStats: (data: AdminStats) => void;
  invalidateStats: () => void;

  // Users
  usersData: UsersData | null;
  usersLoaded: boolean;
  setUsersData: (data: UsersData) => void;
  invalidateUsers: () => void;

  // Papers
  papersData: PapersData | null;
  papersLoaded: boolean;
  issues: any[];
  issuesLoaded: boolean;
  setPapersData: (data: PapersData) => void;
  setIssues: (data: any[]) => void;
  invalidatePapers: () => void;

  // Conferences
  conferencesData: ConferencesData | null;
  conferencesLoaded: boolean;
  setConferencesData: (data: ConferencesData) => void;
  invalidateConferences: () => void;

  // Ebooks
  ebooksData: EbooksData | null;
  ebooksLoaded: boolean;
  setEbooksData: (data: EbooksData) => void;
  invalidateEbooks: () => void;

  // Certificates
  certificates: any[];
  certificatesLoaded: boolean;
  setCertificates: (data: any[]) => void;
  invalidateCertificates: () => void;

  // Journals
  journals: any[];
  journalsLoaded: boolean;
  setJournals: (data: any[]) => void;
  invalidateJournals: () => void;

  // Team Members
  teamMembers: any[];
  teamMembersLoaded: boolean;
  setTeamMembers: (data: any[]) => void;
  invalidateTeamMembers: () => void;

  // Editorial Board
  editorialMembers: any[];
  editorialLoaded: boolean;
  setEditorialMembers: (data: any[]) => void;
  invalidateEditorial: () => void;

  // Archives
  archives: any[];
  archivesLoaded: boolean;
  setArchives: (data: any[]) => void;
  invalidateArchives: () => void;

  // Analytics
  analyticsData: any | null;
  analyticsLoaded: boolean;
  analyticsRange: string;
  setAnalyticsData: (data: any, range: string) => void;
  invalidateAnalytics: () => void;

  // Settings
  settings: any | null;
  settingsLoaded: boolean;
  setSettings: (data: any) => void;
  invalidateSettings: () => void;

  // Advisory Board
  advisoryMembers: any[];
  advisoryLoaded: boolean;
  setAdvisoryMembers: (data: any[]) => void;
  invalidateAdvisory: () => void;

  // Reviewer Board
  reviewerMembers: any[];
  reviewerLoaded: boolean;
  setReviewerMembers: (data: any[]) => void;
  invalidateReviewer: () => void;

  // Publication Fees
  fees: any | null;
  feesLoaded: boolean;
  setFees: (data: any) => void;
  invalidateFees: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      // Dashboard
      stats: null,
      statsLoaded: false,
      setStats: (data) => set({ stats: data, statsLoaded: true }),
      invalidateStats: () => set({ stats: null, statsLoaded: false }),

      // Users
      usersData: null,
      usersLoaded: false,
      setUsersData: (data) => set({ usersData: data, usersLoaded: true }),
      invalidateUsers: () => set({ usersData: null, usersLoaded: false }),

      // Papers
      papersData: null,
      papersLoaded: false,
      issues: [],
      issuesLoaded: false,
      setPapersData: (data) => set({ papersData: data, papersLoaded: true }),
      setIssues: (data) => set({ issues: data, issuesLoaded: true }),
      invalidatePapers: () => set({ papersData: null, papersLoaded: false }),

      // Conferences
      conferencesData: null,
      conferencesLoaded: false,
      setConferencesData: (data) => set({ conferencesData: data, conferencesLoaded: true }),
      invalidateConferences: () => set({ conferencesData: null, conferencesLoaded: false }),

      // Ebooks
      ebooksData: null,
      ebooksLoaded: false,
      setEbooksData: (data) => set({ ebooksData: data, ebooksLoaded: true }),
      invalidateEbooks: () => set({ ebooksData: null, ebooksLoaded: false }),

      // Certificates
      certificates: [],
      certificatesLoaded: false,
      setCertificates: (data) => set({ certificates: data, certificatesLoaded: true }),
      invalidateCertificates: () => set({ certificates: [], certificatesLoaded: false }),

      // Journals
      journals: [],
      journalsLoaded: false,
      setJournals: (data) => set({ journals: data, journalsLoaded: true }),
      invalidateJournals: () => set({ journals: [], journalsLoaded: false }),

      // Team Members
      teamMembers: [],
      teamMembersLoaded: false,
      setTeamMembers: (data) => set({ teamMembers: data, teamMembersLoaded: true }),
      invalidateTeamMembers: () => set({ teamMembers: [], teamMembersLoaded: false }),

      // Editorial Board
      editorialMembers: [],
      editorialLoaded: false,
      setEditorialMembers: (data) => set({ editorialMembers: data, editorialLoaded: true }),
      invalidateEditorial: () => set({ editorialMembers: [], editorialLoaded: false }),

      // Archives
      archives: [],
      archivesLoaded: false,
      setArchives: (data) => set({ archives: data, archivesLoaded: true }),
      invalidateArchives: () => set({ archives: [], archivesLoaded: false }),

      // Analytics
      analyticsData: null,
      analyticsLoaded: false,
      analyticsRange: '30',
      setAnalyticsData: (data, range) => set({ analyticsData: data, analyticsLoaded: true, analyticsRange: range }),
      invalidateAnalytics: () => set({ analyticsData: null, analyticsLoaded: false }),

      // Settings
      settings: null,
      settingsLoaded: false,
      setSettings: (data) => set({ settings: data, settingsLoaded: true }),
      invalidateSettings: () => set({ settings: null, settingsLoaded: false }),

      // Advisory Board
      advisoryMembers: [],
      advisoryLoaded: false,
      setAdvisoryMembers: (data) => set({ advisoryMembers: data, advisoryLoaded: true }),
      invalidateAdvisory: () => set({ advisoryMembers: [], advisoryLoaded: false }),

      // Reviewer Board
      reviewerMembers: [],
      reviewerLoaded: false,
      setReviewerMembers: (data) => set({ reviewerMembers: data, reviewerLoaded: true }),
      invalidateReviewer: () => set({ reviewerMembers: [], reviewerLoaded: false }),

      // Publication Fees
      fees: null,
      feesLoaded: false,
      setFees: (data) => set({ fees: data, feesLoaded: true }),
      invalidateFees: () => set({ fees: null, feesLoaded: false }),
    }),
    {
      name: 'admin-store',
      storage: createJSONStorage(() => ({
        getItem: (name: string) => sessionStorage.getItem(getAdminStoreStorageKey(name)),
        setItem: (name: string, value: string) => sessionStorage.setItem(getAdminStoreStorageKey(name), value),
        removeItem: (name: string) => sessionStorage.removeItem(getAdminStoreStorageKey(name)),
      })),
    }
  )
);
