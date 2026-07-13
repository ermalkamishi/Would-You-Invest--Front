import { Flame, Trophy, Briefcase, PlusCircle, User, Info } from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/', label: 'Feed', icon: Flame, authRequired: false },
  { to: '/leaderboard', label: 'Board', icon: Trophy, authRequired: false },
  { to: '/about', label: 'About', icon: Info, authRequired: false },
  // Founder-only
  { to: '/create', label: 'Pitch', icon: PlusCircle, authRequired: true, founderOnly: true },
  // Investor-only
  { to: '/portfolio', label: 'Portfolio', icon: Briefcase, authRequired: true, investorOnly: true },
  // All authenticated users
  { to: '/profile', label: 'Profile', icon: User, authRequired: true },
  // Admin-only
  { to: '/admin', label: 'Admin', icon: User, authRequired: true, adminOnly: true },
];
