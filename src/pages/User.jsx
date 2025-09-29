

import { Outlet } from 'react-router-dom';
export default function User(){


return(
    <div className="user-page-container">
    
      <main className="content-container">
           <Outlet/>
      </main>

    </div>
)




}