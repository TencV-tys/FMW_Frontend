import NavAuth from "../components/NavAuth";
import {Link, useNavigate} from 'react-router-dom';
import {useState} from 'react';
import './styles/Registration.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignIn } from "@fortawesome/free-solid-svg-icons";
export default function Registration(){
   
   const [formData, setFormData] = useState({
    first_name:"",
    last_name:"",
    email:"",
    gender:"",
    password:"",
    password_confirmation:""
  });
   const [ message, setMessage ] = useState('');
   const nav = useNavigate();
   const handleChange = (e) => {
    setFormData({...formData,[e.target.name]: e.target.value });
   }

   const handleSubmit = async (e)=> {
     e.preventDefault();
     
     try{
      const response = await fetch("http://localhost:8000/api/register",{
        method:"POST",
        headers:{ "Content-Type": "application/json",
        },
        credentials:'include',
        body:JSON.stringify(formData)
      });
      
      const data = await response.json();

      if(response.ok){
        setMessage(data.message);
        setFormData({
          first_name:"",
          last_name:"",
          email:"",
          gender:"",
          password:"",
          password_confirmation:""
        });
        setTimeout(()=>nav('/login'),2000);
      }else{
        setMessage(`${data.message || "Registration failed"}`);
        console.log(`Failed registartion through:${data.message}`);
      }

     }catch(error){
         setMessage("Network error:"+error.message);
         console.log(`possible errors:${error.message}`);
     }

   }



  return(
    <>
    <NavAuth disabled="Hide"/>
    <div className="register-form-container">
     
        <form className="register-container" onSubmit={handleSubmit}> 
          <div className="register-form-title">
            <h2 className="create">Create Account</h2>
            </div>  
          <div className="input-group">
            <div className="input-first">
            <input type="text"
                   className="inputs"
                   placeholder="First Name"
                   name="first_name"
                   value={formData.first_name}
                   onChange={handleChange}
                   
                   />
                   </div>
                   <div className="input-last">
                   <input type="text"
                   className="inputs"
                   placeholder="Last Name"
                   name="last_name"
                   value={formData.last_name}
                   onChange={handleChange}
                  
                   />
                 </div>            
          </div>    
          <div className="input-group">
            <input className="inputs" 
                   type="email"
                   placeholder="Email"
                   name="email"
                   value={formData.email}
                   onChange={handleChange}
                  
                   />
          </div>
           <div className="input-group">
           <select 
           name="gender" 
           className="gender-select-container"
           
           value={formData.gender}
           onChange={handleChange}
          
           >
            <option value="">Select gender</option>
           <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            </select>

          </div>
          <div className="input-group">
            <input className="inputs" 
                   type="password"
                   placeholder="Password"
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   
                   />
          </div>
          <div className="input-group">
            <input className="inputs" 
                   type="password"
                   placeholder="Confirm password"
                   name="password_confirmation"
                   value={formData.password_confirmation}
                   onChange={handleChange}

                   />
          </div>
          <div className="sign-in-btn">
            <button type="submit">Sign in</button>
            <FontAwesomeIcon icon={faSignIn}/>
          </div>
          <div className="log-in-link"><p>Already have an account?</p>
          <Link to="/login" className="Login-link">Login</Link>
          </div>
       </form>
       {
        message && <p>{message}</p>
       }
    </div>
   </>
  )
}