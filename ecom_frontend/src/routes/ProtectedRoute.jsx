import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // direct token

  //  agar token nahi hai → login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //  agar token hai → allow
  return children ? children : <Outlet />;
};
