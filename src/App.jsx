 import React from 'react';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import Login from './pages/Login'; 
 import Landing from './pages/Landing';
 import Registration from './pages/Registration'; 
 import User from './pages/User';
 import Admin from './pages/Admin';
 import './index.css';
import BulletinBoard from './UserPages/BulletinBoard';
import CreatePost from './UserPages/CreatePost';
import MyPosts from './UserPages/MyPosts';
import EditProfile from './UserPages/EditProfile';
import Profile from './UserPages/Profile';
 function App() {
   return (
     <BrowserRouter>
        <Routes>
           <Route path='/' element={<Landing/>}/>
           <Route path='/registration' element={<Registration/>}/>
           <Route path='/login' element={<Login/>}/>

           <Route path='/user' element={<User/>}>
            <Route index element={<BulletinBoard/>} />
            <Route path='create'  element={<CreatePost/>} />
            <Route path='myposts' element={<MyPosts/>} />
            <Route path='profile' element={<Profile/>} />
            <Route path='edit-profile' element={<EditProfile/>} /> 
           </Route>

           
           <Route path='/admin' element={<Admin/>}/>
        </Routes>
     </BrowserRouter>
   )
 }
 
 export default App
 