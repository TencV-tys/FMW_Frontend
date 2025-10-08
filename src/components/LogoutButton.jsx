import React from "react";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // remove token from storage
      localStorage.removeItem("token");

      // optional: call backend to log activity (not required for JWT)
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
       alert("logged out successfully");
      // redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="btn btn-danger">
      Logout
    </button>
  );
}

export default LogoutButton;
