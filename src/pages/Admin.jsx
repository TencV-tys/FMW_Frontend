import { Outlet } from "react-router-dom";
import AdminNav from "../AdminComponents/AdminNav";
import AdminHeader from "../AdminComponents/AdminHeader";
import { useState } from 'react';
import './styles/Admin.css';

export default function Admin() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);

  return (
    <div className="admin-container">
      <AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen} />
      <main 
        className="admin-content"
        style={{
          marginLeft: isSideBarOpen ? '200px' : '70px',
          transition: 'margin-left 0.4s ease',
        }}
      >
        <AdminHeader />
        <div className="admin-page-content">
          <Outlet/>
        </div>
      </main>
    </div>
  );
}