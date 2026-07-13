import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import FeedPage from '../pages/FeedPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import CreatePitchPage from '../pages/CreatePitchPage';
import PortfolioPage from '../pages/PortfolioPage';
import ProfilePage from '../pages/ProfilePage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import AboutPage from '../pages/AboutPage';
import AdminPanelDashboard from '../pages/AdminPanelDashboard';
import ScrollToTop from '../components/layout/ScrollToTop';
import AdminRoute from './AdminRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/create" element={<CreatePitchPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanelDashboard />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
