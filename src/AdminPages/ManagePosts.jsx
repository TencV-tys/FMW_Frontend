import { useState, useEffect } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import { Link } from 'react-router-dom';
import './styles/ManagePosts.css';
export default function ManageUsers(){
 const [isSideBarOpen, setIsSideBarOpen] = useState(true);
 


return(
<section className="manage-posts-container">
<AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen}/>
    
<main className='manage-posts-content'
 style={{
        marginLeft: isSideBarOpen ? '200px' : '60px',
        transition: 'margin-left 0.4s ease',
        padding: '20px'
     }}
>
<div className='manage-posts-table-darkbrown'>
   <div className='manage-posts-table-lightbrown'>
      <div className='manage-posts-table-content'>
            <div className='manage-posts-table-title'>
               <h2>Manage Posts</h2>
            </div>
            <table className='posts-table'>
                <thead>
             <tr>
                <th>Post Id</th>
                <th>Title</th>
                <th>Color</th>
                <th>Category</th>
                <th>Date Posted</th>
                <th>Status</th>
                <th>Actions</th>
             </tr>
            </thead>
            <tbody>
             <tr>
             <td>Mark</td>
             <td>Montero</td>
             <td>Mark@gmail.com</td>
             <td>Mark</td>
             <td>Mark</td>
             <td>Pending</td>
             <td><div className='posts-table-actions'>
                <Link>Edit</Link>
                <Link>Delete</Link>
                </div></td>
             </tr>

            </tbody>
            </table>

      </div>




   </div>

</div>





</main>



</section>
)


}