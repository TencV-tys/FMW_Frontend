import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDoorOpen} from '@fortawesome/free-solid-svg-icons';
import NavAuth from "../components/NavAuth";
import {Link, useNavigate} from 'react-router-dom';
import './styles/Login.css';
import { useState } from 'react';
export default function Login(){
    
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ error, setError ] = useState('');
    const nav = useNavigate(); 

   const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try{
      const res = await fetch('http://localhost:8000/auth/login',{
        method:"POST",
        credentials:'include',
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email,password})
      });
     const data = await res.json();

     if(res.ok){
        alert(data.message||'Login successfully');

       if(data.user.role === 'admin'){
        setTimeout(()=>nav('/admin'),1000);
       }else{
         setTimeout(()=>nav('/user'),1000);
       }

     }else{
       setError(data.message||'Login failed');
     }

    }catch(error){
    setError('Network Error'+error.message);

    }

   }



    return(
      <div className='container'>
      <NavAuth disabled="Hide"/>
       <div className='login-form-container'>
           
           <form className='login-container' onSubmit={handleLogin}>
             <h2 className='login-form-title'>Login</h2>
              <div className='input-group'>
        
                <input type="email"
                       placeholder="Enter email"
                       value={email}
                       onChange={(e)=> setEmail(e.target.value)}
                       />
              </div>
              <div className='input-group'>
        
                <input type="password"
                       placeholder="Enter password"
                       value={password}
                       onChange={(e)=>setPassword(e.target.value)}
                       />
              </div >
              <div className='checkbox-container'>
                <div className='checkbox'><input type="checkbox"/><p>Remember me</p></div>
                <Link href="#" className='Forgot-password'>Forgot password</Link>
              </div>
              <div className='login-btn'>
                <button type="submit">Login</button>
                <FontAwesomeIcon icon={faDoorOpen}/>
              </div>
              <div className='register-btn-container'><p>Don't have an account yet?</p>
              <Link to="/registration" className='register-btn'>Sign up</Link>
              </div>

           </form>
           {error && <p>{error}</p>}
       </div>
    </div>
    )
}