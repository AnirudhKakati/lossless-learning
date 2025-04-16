import { Navigate, useLocation } from "react-router-dom"

// Checks for userId, otherwise send to login
export default function RequireAuth({ children }) {
  const userId = localStorage.getItem("user_id");
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
