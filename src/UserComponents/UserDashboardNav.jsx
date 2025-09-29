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
                  <Link to='/user' className='user-nav-link'>Bulletin Board</Link>
                </div>
               <div className='user-link-container'>
                  <Link to='/user/myposts' className='user-nav-link'>My Posts</Link>
                </div>
                <div className='user-link-container'>
                  <Link to='/user/create' className='user-nav-link'>Create Post</Link>
                </div>
           </div>

             <div className='user-profile-container'>
              <div className='user-profile-sub'>
                <p>Username</p>
              <img src={Profile} 
                  className='Profile'
                  title='Profile'/>
              </div>
              </div>    
           </nav>
         </header>


)


}