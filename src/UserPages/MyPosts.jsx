import {Link} from 'react-router-dom'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'
export default function MyPosts(){


return(
    <div className="myposts-container">
        <UserNav/>
        <main className="myposts-content">
       <h2>MyPosts</h2>
        <div className='myposts-list'>

            <div className='mypost-cards'>
                <div className='mypost-details-container'>
                <div className='mypost-details'> 
                <h3>post.title</h3>
              <p>post.content</p>
              <small>Category: post.category</small>
              <small>Contact: post.contact_info</small>
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
        </main>

    </div>
)

}