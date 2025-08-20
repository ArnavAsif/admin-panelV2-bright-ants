
import { Navigate, Outlet } from 'react-router';
import { useAuth } from './AuthProvider';


const ProtectedRoute = () => {
  const { isAuthenticated , loading} = useAuth();
  
  // Check localStorage in case of page refresh
  const storedAuth = localStorage.getItem('adminAuth');

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>; // or a spinner
  }
  
  if (!isAuthenticated && !storedAuth) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;