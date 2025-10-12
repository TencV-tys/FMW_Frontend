import './styles/NavAuth.css';
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignIn,
  faDoorOpen
} from '@fortawesome/free-solid-svg-icons';
import Logo from '../assets/Logo2.jpg';
export default function NavAuth({disabled}){

    return(
     <header className='nav-con'>
        <nav className='navigation-auth'>
          <div>
            <Link to="/" className='Logo'>
            <img className='Logo-pic' src={Logo}/>
            FindMyWay</Link>      
            </div>
            <div className={`landing-btn ${disabled}`}>
                <Link to="/registration" className='nav-link'>
               Sign up
              <FontAwesomeIcon icon={faSignIn}/>
              </Link>
               <Link to="/login" className='nav-link'>
               Login
              <FontAwesomeIcon icon={faDoorOpen}/>
              </Link>
            </div>   
        </nav>
     </header>

    )
}