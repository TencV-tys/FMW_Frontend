import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faTimes, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import './styles/LogoutButton.css';
import {useWifiUrl} from '../hooks/useWifiUrl';
import CustomToast from '../components/CustomToast'; // Import the external toast component

export default function LogoutButton({ className = "", isDropdown = false, isOpen = true }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const wifi = useWifiUrl();
  const { toast } = CustomToast.useCustomToast(); // Use the external toast hook

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    setIsLoggingOut(true);
    
    try {
      // Show loading state
      toast.info("Logging out...", 1000);

      // Add a small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Call logout API
      const res = await fetch(`${wifi}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Wait a bit more before redirecting
      await new Promise(resolve => setTimeout(resolve, 800));

      if (res.ok) {
        toast.success("Logged out successfully", 1000);
      } else {
        toast.success("Logged out successfully", 1000);
      }

      // Navigate after toast is visible
      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      console.error("Logout failed:", error);
      toast.success("Logged out successfully", 1000);
      
      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } finally {
      setIsLoggingOut(false);
      setShowModal(false);
    }
  };

  const openModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    if (!isLoggingOut) {
      setShowModal(false);
    }
  };

  return (
    <>
      <button 
        onClick={openModal} 
        className={`logout-btn ${isDropdown ? 'logout-dropdown' : ''} ${!isOpen ? 'collapsed' : ''} ${className}`}
        title={!isOpen ? "Logout" : ""}
        disabled={isLoggingOut}
      >
        <FontAwesomeIcon className="logout-icon" icon={faRightFromBracket}/>
        {isOpen && (isLoggingOut ? "Logging out..." : "Logout")}
      </button>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="logout-modal-overlay" onClick={closeModal}>
          <div className="logout-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="logout-modal-header">
              <h2>
                <FontAwesomeIcon icon={faExclamationTriangle} className="logout-warning-icon" />
                Confirm Logout
              </h2>
              <button 
                className="logout-modal-close" 
                onClick={closeModal}
                disabled={isLoggingOut}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="logout-modal-body">
              <div className="logout-confirmation-content">
                <div className="logout-warning-message">
                  <p>Are you sure you want to log out?</p>
                </div>
                
                <div className="logout-details">
                  <p>You will be redirected to the login page and will need to sign in again to access your account.</p>
                </div>

                <div className="logout-action-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <p>
                    <strong>Note:</strong> Any unsaved changes will be lost.
                  </p>
                </div>

                {isLoggingOut && (
                  <div className="logout-loading">
                    <p>Logging out...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="logout-modal-footer">
              <button 
                className="logout-btn-secondary" 
                onClick={closeModal}
                disabled={isLoggingOut}
              >
                Cancel
              </button>
              <button 
                className="logout-btn-confirm" 
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}