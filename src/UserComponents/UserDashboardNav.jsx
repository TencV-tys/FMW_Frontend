import './styles/UserDashboardNav.css';
import { Link } from 'react-router-dom';
import React from 'react';
import Logo from '../assets/Logo2.jpg';
import Profile from '../assets/download.png';
export default function UserDashboardNav(){
  
   

  

return(
  <header className="nav-container">
        <nav className='user-nav'>
            <div className='user-links'>
               <div className='user-page-logo-container'>
                <img  src={Logo} className='user-page-Logo'></img>
               </div>
               <div className='user-link-container'>
                  <Link to='' className='user-nav-link'>Bulletin board</Link>
                </div>
               <div className='user-link-container'>
                  <Link to='' className='user-nav-link'>My Posts</Link>
                </div>
                <div className='user-link-container'>
                  <Link to='' className='user-nav-link'>Post</Link>
                </div>
           </div>

             <div className='user-profile-container'>
              <img src={Profile} className='Profile'/>
              </div>    
           </nav>
         </header>


)


}