import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './styles/LogoutButton.css';
export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // remove token from storage
      localStorage.removeItem("token");

      // optional: call backend to log activity (not required for JWT)
     const res = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if(res.ok){
       toast.success("logged out successfully",{
        position:'top-center',
        autoClose:500
       });
       setTimeout(()=>navigate("/login"),1000);
      }
      // redirect to login
      
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
  
    <button onClick={handleLogout} className="logout-btn">
      <FontAwesomeIcon className="logout-icon" icon={faRightFromBracket}/>
      Logout
    </button>
   
  );
}


