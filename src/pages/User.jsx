import { Outlet } from 'react-router-dom';
import UserDashboardNav from '../UserComponents/UserDashboardNav'; // Import the nav

export default function User() {
  return (
    <div className="user-page-container">
      <UserDashboardNav /> {/* Add the navigation */}
      <main className="content-container" style={{ marginTop: '60px' }}> {/* Add margin to account for fixed nav */}
        <Outlet/>
      </main>
    </div>
  );
}