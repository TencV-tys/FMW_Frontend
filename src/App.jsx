import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './index.css';

import Login from './pages/Login'; 
import Landing from './pages/Landing';
import Registration from './pages/Registration'; 
import User from './pages/User';
import Admin from './pages/Admin';
import UserAgreement from './pages/UserAgreement';
import About from './pages/About';

import Dashboard from './AdminPages/Dashboard';
import ManageUsers from './AdminPages/ManageUsers';
import ManagePosts from './AdminPages/ManagePosts';
import Notifications from './AdminPages/Notifications';
import Reports from './AdminPages/Reports';
import AdminFeedBack from './AdminPages/AdminFeedback';

import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoutes';

import BulletinBoard from './UserPages/BulletinBoard';
import CreatePost from './UserPages/CreatePost';
import MyPosts from './UserPages/MyPosts';
import EditProfile from './UserPages/EditProfile';
import Profile from './UserPages/Profile';
import EditPost from './UserPages/EditPost';
import MyReports from './UserPages/MyReports';
import UserNotifications from './UserPages/UserNotifications';
import Feedback from './UserPages/Feedback';


import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/registration' element={<Registration/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/user-agreement' element={<UserAgreement/>}/>
        <Route path='/about' element={<About/>}/>

        
        <Route path='/forgot-password' element={<ForgotPassword/>}/>
        <Route path='/reset-password' element={<ResetPassword/>}/>

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
          <Route path='user-notification' element={<UserNotifications/> } />
          <Route path='my-reports' element={<MyReports/>} />
          <Route path='edit-post/:id' element={<EditPost/>} />
          <Route path='feedback' element={<Feedback />} />
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
          <Route path='reports' element={<Reports/> } />
          <Route path='feedback' element={<AdminFeedBack/> } />
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

export default App;