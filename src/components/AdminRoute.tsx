import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to={`/auth?returnTo=${encodeURIComponent(window.location.pathname)}`} replace />;
  if (!isAdmin) return null;

  return <Outlet />;
};

export default AdminRoute;