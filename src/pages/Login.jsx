import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDoorOpen} from '@fortawesome/free-solid-svg-icons';
import NavAuth from "../components/NavAuth";
import {Link} from 'react-router-dom';
import './styles/Login.css';
export default function Login(){
    
    return(
      <div className='container'>
      <NavAuth disabled="Hide"/>
       <div className='login-form-container'>
           
           <form className='login-container'>
             <h2 className='login-form-title'>Login</h2>
              <div className='input-group'>
        
                <input type="email"
                       placeholder="Enter email"
                       />
              </div>
              <div className='input-group'>
        
                <input type="password"
                       placeholder="Enter password"/>
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
       </div>
    </div>
    )
}