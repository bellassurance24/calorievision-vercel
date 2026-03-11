import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null; // wait for auth state to settle
  if (!user || !isAdmin) return <Navigate to="/auth" replace />;

  return <Outlet />;
};

export default AdminRoute;
