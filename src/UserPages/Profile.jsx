import { Link } from 'react-router-dom';
import UserNav from '../UserComponents/UserDashboardNav';
import Logo2 from '../assets/Logo2.jpg';
import './styles/Profile.css';
export default function Profile(){




    return(
        <section className="profile-page">
            <UserNav/>
            <main className="profile-content">
                <div className='profile-action'>
                    <h2></h2>
                    <button className='profile-edit-btn'>
                        <Link to='/user/edit-profile'>Edit Profile</Link>
                        </button>
                </div>
             <div className='profile-data-container-darkbrown'>   
              <div className='profile-data-container-lightbrown'>  
               <div className='profile-data-container'>
                     
                     <div className='profile-data'>
                        <div className='profile-data-title'>
                            <h2>Profile</h2>
                        </div>
                             <div className='profile-container'>
                                <span className='profile-pin'></span>
                                   <div className='profile-pic'>
                                        <img src={Logo2} alt='preview'/>
                                   </div>
                                   <div className='profile-details'>
                                          <p>First Name: Vincent</p>
                                          <p>Last Name: Tayros</p>
                                          <p>Email: example@example.com</p>
                                   </div>
                             </div>
                     </div>
               </div>
              </div>
            </div>   
            </main>

        </section>
    )
}