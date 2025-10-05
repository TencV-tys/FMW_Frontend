import { Outlet } from "react-router-dom";


export default function Admin(){


return(
  <div className="admin-container">
     
    <main className="admin-content">
      <Outlet/>
    </main>


  </div>
)

}