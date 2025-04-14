import { Navigate, useLocation } from "react-router-dom"

export default function RequireAuth({ children }) {
  const userId = localStorage.getItem("user_id");
  const location = useLocation();

  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
