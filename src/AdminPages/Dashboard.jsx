
import { useState } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import './styles/Dashboard.css';
export default function Dashboard(){
   
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);



    return (
    <section className='dashboard-container'>
     <AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen}/>
     <main className='dashboard-content' 
        style={{
        marginLeft: isSideBarOpen ? '200px' : '60px',
        transition: 'margin-left 0.4s ease'
     }}
     >
      <header className='admin-header'>
        <h1>Admin Dashboard</h1>
        <div className='admin-header-right'>
            <p>Welcome, Admin</p>
            <button>Logout</button>
        </div>
      </header>

    
      </main>
    </section>
    )
}