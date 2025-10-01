import React,{useState} from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo2.jpg';
import Profile from '../assets/download.png';
import './styles/UserDashboardNav.css';
export default function UserDashboardNav(){
  
   const [ open , setOpen ] = useState(false);

  

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
              <div className='user-profile-sub' onClick={()=>setOpen(!open)}>
                <p>Vincent</p>
              <img src={Profile} 
                  className='Profile'
                  title='Profile'/>
              </div>

              { open && (
               <div className='profile-dropdown-menu'>
                <div className='dropdown-link-container'>
                <Link to='/user/profile' className='dropdown-link'>Profile</Link>
                </div>
                 <div className='dropdown-link-container'>
                <Link to='' className='dropdown-link'>Logout</Link>
                 </div>
               </div>
              )}
              </div>    
           </nav>
         </header>


)


}