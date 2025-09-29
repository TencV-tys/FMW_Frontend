import NavAuth from "../components/NavAuth";
import {Link} from 'react-router-dom';
import './styles/Registration.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignIn } from "@fortawesome/free-solid-svg-icons";
export default function Registration(){

  return(
    <>
    <NavAuth disabled="Hide"/>
    <div className="register-form-container">
     
        <form className="register-container"> 
          <div className="register-form-title">
            <h2 className="create">Create Account</h2>
            </div>  
          <div className="input-group">
            <div className="input-first">
            <input type="text"
            className="inputs"
                   placeholder="First Name"/>
                   </div>
                   <div className="input-last">
                   <input type="text"
                   className="inputs"
                   placeholder="Last Name"/>
                 </div>            
          </div>    
          <div className="input-group">
            <input className="inputs" type="email"
                   placeholder="Email"/>
          </div>
          <div className="input-group">
            <input className="inputs" type="password"
                   placeholder="Password"/>
          </div>
          <div className="input-group">
            <input className="inputs" type="password"
                   placeholder="Confirm password"/>
          </div>
          <div className="sign-in-btn">
            <button type="submit">Sign in</button>
            <FontAwesomeIcon icon={faSignIn}/>
          </div>
          <div className="log-in-link"><p>Already have an account?</p>
          <Link to="/login" className="Login-link">Login</Link>
          </div>
       </form>
    </div>
   </>
  )
}