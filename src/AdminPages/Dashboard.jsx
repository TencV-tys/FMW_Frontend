import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  faUser, 
  faNewspaper, 
  faExclamationTriangle, 
  faSearch, 
  faEye, 
  faCheckCircle,
  faChartLine,
  faClock,
  faRefresh
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
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const navigate = useNavigate();

  // 🆕 ADDED: Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  useEffect(() => {
    fetchDashboardData();

    // 🆕 ADDED: Smart polling setup (60 seconds)
    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        // Tab became active, fetch immediately
        fetchDashboardData();
        startPolling();
      } else {
        // Tab hidden, stop polling
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 🆕 ADDED: Smart polling functions (60 seconds)
  const startPolling = () => {
    stopPolling(); // Clear any existing interval
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchDashboardData();
      }
    }, 60000); // 60 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // 🆕 ADDED: Manual refresh with toast
  const handleManualRefresh = async () => {
    showToast('Refreshing dashboard data...', 'success');
    await fetchDashboardData();
  };

  // 🆕 ADDED: Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const usersResponse = await fetch('http://localhost:8000/api/users/stats', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const postsResponse = await fetch('http://localhost:8000/api/admin/posts', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache', 
          'Pragma': 'no-cache'
        }
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
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (posts) => {
    const recentPosts = posts.slice(0, 5);
    return recentPosts.map(post => ({
      id: post.id,
      message: `${post.first_name} ${post.last_name} ${(post.type === 'Lost' || post.type === 'lost') ? 'reported a lost' : 'found a'} ${post.category_name}: "${post.title}"`,
      time: new Date(post.created_at).toLocaleDateString(),
      type: post.type
    }));
  };

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

  // 🆕 UPDATED: StatCard component with better structure
  const StatCard = ({ icon, value, label, color, type }) => (
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
          <h3>{loading ? '...' : value.toLocaleString()}</h3>
          <p>{label}</p>
        </div>
      </div>
    </div>
  );

  // 🆕 UPDATED: ActivityItem with better structure
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
      {/* 🆕 ADDED: Toast Notification */}
      {toast.show && (
        <div className={`dashboard-toast dashboard-toast-${toast.type}`}>
          <div className="dashboard-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="dashboard-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        {/* 🆕 UPDATED: Header with Refresh Button */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Admin Dashboard</h1>
            <p>Overview of platform statistics and recent activities</p>
          </div>
          <div className="dashboard-header-right">
            <button 
              className="refresh-btn"
              onClick={handleManualRefresh}
              disabled={loading}
              title="Refresh dashboard data"
            >
              <FontAwesomeIcon icon={faRefresh} spin={loading} />
              Refresh
            </button>
          </div>
        </div>

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
      </div>
    </>
  );
}