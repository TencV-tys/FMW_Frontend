import {Link} from 'react-router-dom'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'
export default function MyPosts(){


return(
    <div className="myposts-container">
        <UserNav/>
        <main className="myposts-content">
      <div className='myposts-content-darkbrown'>
        <div className='myposts-content-lightbrown'>
            <div className='myposts-content-container'>
            <div className='myposts-content-title'>
                <h2>My Posts</h2>
            </div>
        <div className='myposts-list'>
            <div className='mypost-cards'>
                <div className='mypost-details-container'>
                <div className='mypost-details'> 
                <h1>post.title</h1>
              <p>post.content</p>
              <p>Category: post.category</p>
              <p>Contact: post.contact_info</p>
               </div>
               <div className='mypost-image'>
              <img src={Logo1} alt="image" />
               </div>
               </div>
              <div className='mypost-actions'>
                      <Link to=''>Edit</Link>
                      <button>Delete</button>
              </div>
                
             </div>
           </div>
        </div>
     </div>
    </div>
        </main>

    </div>
)

}