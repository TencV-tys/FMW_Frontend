import { useState } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import { Link } from 'react-router-dom';
import './styles/ManageUsers.css';
export default function ManageUsers(){
 const [isSideBarOpen, setIsSideBarOpen] = useState(true);


return(
<section className="manage-users-container">
<AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen}/>
    
<main className='manage-users-content'
 style={{
        marginLeft: isSideBarOpen ? '200px' : '60px',
        transition: 'margin-left 0.4s ease',
        padding: '20px'
     }}
>
<div className='manage-users-table-darkbrown'>
   <div className='manage-users-table-lightbrown'>
      <div className='manage-users-table-content'>
            <div className='manage-users-table-title'>
               <h2>Manage Users</h2>
            </div>
            <table className='users-table'>
                <thead>
             <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Gender</th>
                <th>Role</th>
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
             <td><div className='users-table-actions'>
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