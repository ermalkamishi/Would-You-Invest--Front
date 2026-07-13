import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // If not logged in or not an admin, boot them back to the landing page
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; // Allows access to child admin pages
};

export default AdminRoute;
