import {Link, useNavigate} from 'react-router-dom'
import { useState, useEffect } from 'react'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import UserNav from '../UserComponents/UserDashboardNav'
import Logo1 from '../assets/Logo.jpg'
import './styles/MyPosts.css'

import { toast } from 'react-toastify'
export default function MyPosts(){
     const [ posts, setPosts ] = useState([]);
     const [ loading, setLoading ] = useState(true);
     const [ error, setError ] = useState(null);
     const nav = useNavigate();

     useEffect(()=>{
      fetchMyPosts();
     },[]);
   
     const fetchMyPosts = async () =>{
        try{
           setLoading(true);
           setError(null);

     const response = await fetch('http://localhost:8000/api/posts/my-posts', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
          if(!response.ok) throw new Error(`Failed to fetch posts: ${response.status}`);

          const result = await response.json();

          if(result.success){
            setPosts(result.posts || []);
          }else{
            throw new Error(result.error || 'Failed to laod posts');
          }

        }catch(error){
          console.error(`Error fetching posts: ${error.message}`);
            setError(error.message);
            toast.error(`Failed to load yor posts`);
        }finally{
            setLoading(false);
        }

     };

  
 const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
// 🎯 Get status badge color
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Active': { class: 'status-active', text: 'Active' },
      'Resolved': { class: 'status-resolved', text: 'Resolved' },
      'Removed': { class: 'status-removed', text: 'Removed' }
    };
    
    return statusConfig[status] || { class: 'status-default', text: status };
  };

  // 🎯 Loading state
  if (loading) {
    return (
      <div className="myposts-container">
        <UserNav />
        <main className="myposts-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your posts...</p>
          </div>
        </main>
      </div>
    );
  }


 // 🎯 Error state
  if (error) {
    return (
      <div className="myposts-container">
        <UserNav />
        <main className="myposts-content">
          <div className="error-container">
            <h3>Something went wrong</h3>
            <p>{error}</p>
            <button onClick={fetchMyPosts} className="retry-btn">
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }



return(
    <div className="myposts-container">
        <UserNav />
        <main className="myposts-content">
      <div className='myposts-content-darkbrown'>
        <div className='myposts-content-lightbrown'>
            <div className='myposts-content-container'>


           
            <div className='myposts-content-title'>
                <h1>My Posts</h1>
            </div>
           {
             posts.length === 0 ?(
                 <div className="empty-state">
                  <h3>No posts yet</h3>
                  <p>You haven't created any posts. Start by creating your first lost or found item post!</p>
                  <Link to="/user/create" className="create-first-post-btn">
                    Create Your First Post
                  </Link>
                </div>
             ):(
                //Posts List
               <div className='myposts-list'>
             { posts.map((post)=>{

                    const status = getStatusBadge(post.status);

                  return (  
             <div key={post.id} className='mypost-cards'>
                      <div className='lost-type'>
                          <div className={`status-badge ${status.class}`}>
                            {status.text}
                          </div>
                        <h1>{post.type} {post.category_name}</h1>
                <div className='mypost-actions'>
                      <Link to=''>
                      <FontAwesomeIcon icon={faEdit}/>
                      </Link>
                      <button className='mypost-delete-btn'>
                        <FontAwesomeIcon className='delete-icon' icon={faTrash}/>
                      </button>
                </div>
                        </div>
                <div className='mypost-details-container'>
                    <span className='myposts-pins'></span>
                <div className='mypost-details'> 
                <h1>{post.title}</h1>
              <p>{post.description}</p>
              <p>Category: {post.category_name}</p>
              <p>{post.type} at {post.barangay_name}</p>
              <p>Contact: {post.contact_info}</p>
              <p>Posted: {formatDate(post.created_at)}</p>
               </div>
               <div className='mypost-image'>
              <img src={post.photo ? `http://localhost:8000/uploads/${post.photo}`: Logo1 } 
              alt={post.title}
              onError={(e)=>{
                e.target.src = Logo1; // Fallback image
              }}
              />
               </div>
               </div>
   
                
             </div>
             
                  )
                }
               )
             }
          </div> 
             )
           }

        </div>
     </div>
    </div>
  </main>
 </div>
)

}