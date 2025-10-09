import { useState, useEffect} from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import { Link } from 'react-router-dom';
import './styles/ManageUsers.css';
export default function ManageUsers(){
 const [isSideBarOpen, setIsSideBarOpen] = useState(true);
 const [ users, setUsers ] = useState([]);
  const [ loading, setLoading ] = useState(true);
 
 
 
   useEffect(()=>{
      const fetchUsers = async()=>{
          try{
              const res = await fetch('http://localhost:8000/api/users',{
                  credentials:'include'
              });
              const data = await res.json();
              setUsers(data); 
          }catch(error){
             console.log(`Error fetching ${error.message}`);
          }finally{
             setLoading(false);
          }

      }
      fetchUsers();
   },[])
  
   const handleDelete = async(id) => {
      if(!window.confirm("Are you sure you want to delete this user?")) return;
       
      try{
        const res = await fetch(`http://localhost:8000/api/users/${id}`,{
         method:"DELETE",
         credentials:'include'
        });
        if(res.ok){
          setUsers(users.filter((user)=> user.id !== id));
          alert('User deleted successfully!');
        }else{
          alert('Failed to delete user');
        }
      }catch(error){
        console.log(`Delete error: ${error.message}`);
      }
   }



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

       {loading ? (
            <p>Loading users...</p>
       ) : (
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
               { users.length > 0 ? (
                  users.map((user) => (
                 <tr key={user.id}>
                 <td>{user.first_name}</td>
                 <td>{user.last_name}</td>
                 <td>{user.email}</td>
                 <td>{user.gender || '-'}</td>
                <td>{user.role}</td>
                <td>
                   <div className='users-table-actions'>
                        <button onClick={()=>handleDelete(user.id)}>Delete</button>
                   </div>
                </td>
             </tr>
                  ))
               ) :(
                  <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                          No users found
                        </td>
                  </tr>
               )}
            </tbody>
            </table>
       )}

      </div>

    </div>

   </div>
 </main>

</section>
)
}