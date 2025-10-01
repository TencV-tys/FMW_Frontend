
import {Link} from 'react-router-dom'
import UserDashboardNav from '../UserComponents/UserDashboardNav';
import './styles/EditProfile.css';
export default function EditProfile(){

    return(
        <section className="edit-profile-page">
            <UserDashboardNav/>
             <main className="edit-profile-content">
                <div className='edit-profile-back'>
                            <button className='action-back'>
                                <Link to='/user/profile'>Go Back</Link>
                                </button>                   
                </div>
               <div className='edit-profile-form-container'>
                  
                  <form className='edit-profile-form'>
                    <div className='input-name-group'>
                         <div className='edit-profile-input-group'>
                             <input type='text'
                                    placeholder='First Name'/>
                         </div>
                          <div className='edit-profile-input-group'>
                             <input type='text'
                                    placeholder='Last Name'/>
                         </div>
                         </div>
                        
                         <div className='edit-profile-textarea-group'>
                             <textarea rows={4} 
                             placeholder='Contact Info'></textarea>
                         </div>
                         
                         <div className='edit-profile-input-group image-input'>
                             <input  type='file'
                                    accept='image/*'
                                 />
                         </div>
                         <div className='data-input-group'>
                          <div className='edit-profile-input-group'>
                             <input type='email'
                                    placeholder='Email'/>
                         </div>
                         <div className='edit-profile-input-group'>
                             <input  type='password'
                                    placeholder='Set new password'/>
                         </div>
                        </div>
                         <div className='edit-profile-actions'>
                         <button type='submit'>Save Changes</button>
                         </div>
                  </form>

               </div>
             </main>
        </section>
    )
}