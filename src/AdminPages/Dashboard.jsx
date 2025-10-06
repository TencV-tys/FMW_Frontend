
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
      <section className="dashboard-cards">
        <div className='cards'>
         <h2>120</h2>
         <p>Total Users</p>
        </div>
          <div className='cards'>
         <h2>540</h2>
         <p>Total Posts</p>
        </div>
         <div className='cards'>
         <h2>8</h2>
         <p>Pending Reports</p>
        </div>
         <div className='cards'>
         <h2>0</h2>
         <p>Active Posts</p>
        </div>
      </section>
    <section className='recent-activities'>
      <h2>Recent Activities</h2>
      <div className='recent-activities-data'>
           <p>User <strong>Vincent</strong> created a new post.</p>
          <p>Admin approved <strong>Post #102</strong>.</p>
          <p>User <strong>Maria</strong> reported a post.</p>
      </div>
    </section>
      </main>
    </section>
    )
}