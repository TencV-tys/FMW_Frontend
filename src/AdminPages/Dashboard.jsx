import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import AdminNav from '../AdminComponents/AdminNav';
import AdminLogo from '../assets/Admin.png';
import { 
  faBell, 
  faEye, 
  faSearch, 
  faUser, 
  faNewspaper, 
  faCheckCircle,
  faChartLine,
  faExclamationTriangle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import './styles/Dashboard.css';

export default function Dashboard() {
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    lostPosts: 0,
    foundPosts: 0,
    activePosts: 0,
    resolvedPosts: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users stats
      const usersResponse = await fetch('http://localhost:8000/api/users/stats', {
        credentials: 'include'
      });
      
      // Fetch posts stats - you might need to create this endpoint
      const postsResponse = await fetch('http://localhost:8000/api/admin/posts', {
        credentials: 'include'
      });

      if (usersResponse.ok && postsResponse.ok) {
        const usersData = await usersResponse.json();
        const postsData = await postsResponse.json();
        
        const posts = postsData.posts || [];
        
        setStats({
          totalUsers: usersData.stats?.totalUsers || 0,
          totalPosts: posts.length,
          lostPosts: posts.filter(post => post.type === 'Lost').length,
          foundPosts: posts.filter(post => post.type === 'Found').length,
          activePosts: posts.filter(post => post.status === 'Active').length,
          resolvedPosts: posts.filter(post => post.status === 'Resolved').length,
          recentActivities: generateRecentActivities(posts)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (posts) => {
    const recentPosts = posts.slice(0, 5); // Get 5 most recent posts
    return recentPosts.map(post => ({
      id: post.id,
      message: `${post.first_name} ${post.last_name} ${post.type === 'lost' ? 'reported a lost item' : 'found an item'}: "${post.title}"`,
      time: new Date(post.created_at).toLocaleDateString(),
      type: post.type
    }));
  };

  const StatCard = ({ icon, value, label, color, change }) => (
    <div className='stat-card'>
      
      <div className='stat-content'>
        <div className='stat-icon' style={{ backgroundColor: color }}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className='stat-info'>
          <h3>{loading ? '...' : value}</h3>
          <p>{label}</p>
          {change && <span className='stat-change'>{change}</span>}
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className='activity-item'>
      <div className='activity-icon'>
        <FontAwesomeIcon 
          icon={activity.type === 'lost' ? faExclamationTriangle : faSearch} 
          className={activity.type === 'lost' ? 'activity-lost' : 'activity-found'}
        />
      </div>
      <div className='activity-content'>
        <p>{activity.message}</p>
        <span className='activity-time'>
          <FontAwesomeIcon icon={faClock} />
          {activity.time}
        </span>
      </div>
    </div>
  );

  return (
    <section className='dashboard-container'>
      <AdminNav isOpen={isSideBarOpen} setIsOpen={setIsSideBarOpen}/>
      
      <main className='dashboard-content' 
        style={{
          marginLeft: isSideBarOpen ? '200px' : '70px',
          transition: 'margin-left 0.4s ease',
          padding: '20px'
        }}
      >
        {/* Header */}
        <header className='dashboard-header'>
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Overview of platform statistics and activities</p>
          </div>
          <div className='dashboard-header-right'>
            <button className='notification-btn'>
              <FontAwesomeIcon className='notif-icon' icon={faBell}/>
              <span className='notif-badge'>3</span>
            </button>
            <img className='admin-profile' src={AdminLogo} alt="Admin Profile" />
          </div>
        </header>

        {/* Statistics Cards */}
        <section className="dashboard-stats">
          <StatCard 
            icon={faUser} 
            value={stats.totalUsers} 
            label="Total Users" 
            color="#3b82f6"
          />
          <StatCard 
            icon={faNewspaper} 
            value={stats.totalPosts} 
            label="Total Posts" 
            color="#8b5cf6"
          />
          <StatCard 
            icon={faExclamationTriangle} 
            value={stats.lostPosts} 
            label="Lost Items" 
            color="#ef4444"
          />
          <StatCard 
            icon={faSearch} 
            value={stats.foundPosts} 
            label="Found Items" 
            color="#10b981"
          />
          <StatCard 
            icon={faEye} 
            value={stats.activePosts} 
            label="Active Posts" 
            color="#f59e0b"
          />
          <StatCard 
            icon={faCheckCircle} 
            value={stats.resolvedPosts} 
            label="Resolved Cases" 
            color="#06b6d4"
          />
        </section>

        {/* Recent Activities & Quick Stats */}
        <section className='dashboard-main-content'>
          <div className='recent-activities-section'>
            <div className='section-container-darkbrown'>
              <div className='section-container-lightbrown'>
                <div className='section-content'>
                  <div className='section-title'>
                    <h2>
                      <FontAwesomeIcon icon={faClock} />
                      Recent Activities
                    </h2>
                  </div>
                  <div className='activities-list'>
                    {loading ? (
                      <div className="loading-state">
                        <p>Loading activities...</p>
                      </div>
                    ) : stats.recentActivities.length > 0 ? (
                      stats.recentActivities.map(activity => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>No recent activities</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className='quick-stats-section'>
            <div className='section-container-darkbrown'>
              <div className='section-container-lightbrown'>
                <div className='section-content'>
                  <div className='section-title'>
                    <h2>
                      <FontAwesomeIcon icon={faChartLine} />
                      Quick Stats
                    </h2>
                  </div>
                  <div className='quick-stats'>
                    <div className='quick-stat-item'>
                      <span className='stat-label'>Resolution Rate</span>
                      <span className='stat-value'>
                        {stats.totalPosts > 0 
                          ? `${Math.round((stats.resolvedPosts / stats.totalPosts) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className='quick-stat-item'>
                      <span className='stat-label'>Active Rate</span>
                      <span className='stat-value'>
                        {stats.totalPosts > 0 
                          ? `${Math.round((stats.activePosts / stats.totalPosts) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className='quick-stat-item'>
                      <span className='stat-label'>Lost vs Found</span>
                      <span className='stat-value'>
                        {stats.lostPosts}:{stats.foundPosts}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}