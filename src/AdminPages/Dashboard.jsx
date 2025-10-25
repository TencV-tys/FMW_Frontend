import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    lostPosts: 0,
    foundPosts: 0,
    activePosts: 0,
    resolvedPosts: 0,
    recentActivities: []
  });
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    fetchNotificationCount();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users stats
      const usersResponse = await fetch('http://localhost:8000/api/users/stats', {
        credentials: 'include'
      });
      
      // Fetch posts stats
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
          lostPosts: posts.filter(post => post.type === 'Lost' || post.type === 'lost').length,
          foundPosts: posts.filter(post => post.type === 'Found' || post.type === 'found').length,
          activePosts: posts.filter(post => post.status === 'Active' || post.status === 'active').length,
          resolvedPosts: posts.filter(post => post.status === 'Resolved' || post.status === 'resolved').length,
          recentActivities: generateRecentActivities(posts)
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/notifications/stats', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.stats?.unread || 0);
      } else {
        console.error('Failed to fetch notification stats');
        // Fallback to user notifications if admin endpoint fails
        fetchUserNotificationCount();
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      // Fallback to user notifications
      fetchUserNotificationCount();
    }
  };

  const fetchUserNotificationCount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/notifications/unread-count', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching user notification count:', error);
    }
  };

const generateRecentActivities = (posts) => {
  const recentPosts = posts.slice(0, 5); // Get 5 most recent posts
  return recentPosts.map(post => ({
    id: post.id,
    message: `${post.first_name} ${post.last_name} ${(post.type === 'Lost' || post.type === 'lost') ? 'reported a lost' : 'found a'} ${post.category_name}: "${post.title}"`,
    time: new Date(post.created_at).toLocaleDateString(),
    type: post.type
  }));
};

  const handleNotificationClick = () => {
    navigate('/admin/notifications');
  };

  // 🎯 Handle stat card clicks
  const handleStatClick = (type) => {
    switch(type) {
      case 'users':
        navigate('/admin/manage-users');
        break;
      case 'posts':
        navigate('/admin/manage-posts');
        break;
      case 'lost':
        navigate('/admin/manage-posts?type=lost');
        break;
      case 'found':
        navigate('/admin/manage-posts?type=found');
        break;
      case 'active':
        navigate('/admin/manage-posts?status=active');
        break;
      case 'resolved':
        navigate('/admin/manage-posts?status=resolved');
        break;
      default:
        break;
    }
  };

  const StatCard = ({ icon, value, label, color, change, type }) => (
    <div 
      className='stat-card clickable-stat' 
      onClick={() => handleStatClick(type)}
      title={`Click to view ${label}`}
    >
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
          icon={(activity.type === 'Lost' || activity.type === 'lost') ? faExclamationTriangle : faSearch} 
          className={(activity.type === 'Lost' || activity.type === 'lost') ? 'activity-lost' : 'activity-found'}
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
   <>
        {/* Header */}
        <header className='dashboard-header'>
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Overview of platform statistics and activities</p>
          </div>
          <div className='dashboard-header-right'>
            <button 
              className={`notification-btn ${notificationCount > 0 ? 'has-notifications' : ''}`}
              onClick={handleNotificationClick}
              title="View Notifications"
            >
              <FontAwesomeIcon className='notif-icon' icon={faBell}/>
              {notificationCount > 0 && (
                <span className='notif-badge'>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
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
            type="users"
          />
          <StatCard 
            icon={faNewspaper} 
            value={stats.totalPosts} 
            label="Total Posts" 
            color="#8b5cf6"
            type="posts"
          />
          <StatCard 
            icon={faExclamationTriangle} 
            value={stats.lostPosts} 
            label="Lost Items" 
            color="#ef4444"
            type="lost"
          />
          <StatCard 
            icon={faSearch} 
            value={stats.foundPosts} 
            label="Found Items" 
            color="#10b981"
            type="found"
          />
          <StatCard 
            icon={faEye} 
            value={stats.activePosts} 
            label="Active Posts" 
            color="#f59e0b"
            type="active"
          />
          <StatCard 
            icon={faCheckCircle} 
            value={stats.resolvedPosts} 
            label="Resolved Cases" 
            color="#06b6d4"
            type="resolved"
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
     </>
  );
}