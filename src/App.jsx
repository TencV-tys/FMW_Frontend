 import React from 'react';
 import { BrowserRouter, Routes, Route } from 'react-router-dom';
 import Login from './pages/Login'; 
 import Landing from './pages/Landing';
 import Registration from './pages/Registration'; 
 import User from './pages/User';
 import Admin from './pages/Admin';
 import './index.css';

 function App() {
   return (
     <BrowserRouter>
        <Routes>
           <Route path='/' element={<Landing/>}/>
           <Route path='/registration' element={<Registration/>}/>
           <Route path='/login' element={<Login/>}/>
           <Route path='/user' element={<User/>}/>
           <Route path='/admin' element={<Admin/>}/>
        </Routes>
     </BrowserRouter>
   )
 }
 
 export default App
 