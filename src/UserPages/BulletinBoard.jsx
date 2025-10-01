
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import UserNav from '../UserComponents/UserDashboardNav.jsx';
import Logo2 from '../assets/Logo2.jpg'
import './styles/BulletinBoard.css'
export default function BulletinBoard(){


return(
    <div className="bulletin-page-container">
       <UserNav/>
      <main className="bulletin-container">

        <div className='bulletin-board-container-darkbrown'>
             
             <div className='bulletin-board-container-lightbrown'>
                  
                  <div className='bulletin-board-content'>
                   <div className='bulletin-board-title'>
                        <h1>Lost & Found</h1>
                   </div>
                   <div className='search-input-container'>
                      <div className='search-bar'>
                        <input className='search-bar-input' type='text'
                                  placeholder='Search...'  />
                        <FontAwesomeIcon icon={faMagnifyingGlass}/>
                       </div>
                   </div>
                   <div className='lost-found-container'>
                       <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2 className='lost-found-category'>Lost Animals</h2>
                            <div className='lost-found-contents'>
                            <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                       <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                            <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                       <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                              <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                       <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                             <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                         <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                             <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                         <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                             <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                         <div className='lost-found-cards'>
                            <span className='pin'></span>
                            <h2>Lost Animals</h2>
                            <div className='lost-found-contents'>
                             <img src={Logo2} alt='preview'/>
                            <div className='lost-found-details'>
                                 <h4>Lost Dog</h4>
                                 <p>Black labrador last seen hear central park</p>
                            </div>
                            </div>
                       </div>
                   </div>

                   </div>
             </div>
        </div>

      </main>

    </div>
)




}