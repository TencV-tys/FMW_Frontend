 import React from 'react';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import { ToastContainer } from 'react-toastify';
 import './index.css';

import Login from './pages/Login'; 
import Landing from './pages/Landing';
import Registration from './pages/Registration'; 
import User from './pages/User';
import Admin from './pages/Admin';
import BulletinBoard from './UserPages/BulletinBoard';
import CreatePost from './UserPages/CreatePost';
import MyPosts from './UserPages/MyPosts';
import EditProfile from './UserPages/EditProfile';
import Profile from './UserPages/Profile';
import Dashboard from './AdminPages/Dashboard';
import ManageUsers from './AdminPages/ManageUsers';
import ManagePosts from './AdminPages/ManagePosts';
import Notifications from './AdminPages/Notifications';
import ProtectedRoute from './components/ProtectedRoutes';
import EditPost from './UserPages/EditPost';
import NotFound from './components/NotFound';
import MyReports from './UserPages/MyReports';
 function App() {
   return (
     <BrowserRouter>
        <Routes>
           <Route path='/' element={<Landing/>}/>
           <Route path='/registration' element={<Registration/>}/>
           <Route path='/login' element={<Login/>}/>

           <Route 
            path='/user' element={
            <ProtectedRoute allowedRole='user'>
               <User/>
            </ProtectedRoute>
            }>
            <Route index element={<BulletinBoard/>} />
            <Route path='create'  element={<CreatePost/>} />
            <Route path='myposts' element={<MyPosts/>} />
            <Route path='profile' element={<Profile/>} />
            <Route path='edit-profile' element={<EditProfile/>} /> 
            <Route path='my-reports' element={<MyReports/>} />
            <Route path='edit-post/:id' element={<EditPost/>} />
           </Route>

           
           <Route path='/admin' element={
            <ProtectedRoute allowedRole='admin'>
               <Admin/>
            </ProtectedRoute>
            }>
              <Route index element={<Dashboard/>} /> 
              <Route path='manage-users' element={<ManageUsers/>} />
               <Route path='manage-posts' element={<ManagePosts/>} />
               <Route path='notifications' element={<Notifications/>} />
           </Route>

           <Route path='*' element={<NotFound/>} />
        </Routes>

        <ToastContainer
          position='top-right'
          autoClose={1000}
          theme='colored'
          newestOnTop={true}
        />
     </BrowserRouter>
   )
 }
 
 export default App
 