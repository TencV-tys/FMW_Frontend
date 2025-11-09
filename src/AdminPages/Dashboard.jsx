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
  faRefresh,
  faFlag,
  faComment,
  faTrash,
  faBell
} from '@fortawesome/free-solid-svg-icons';
import './styles/Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    totalFeedback: 0,
    totalDeletionRequests: 0,
    totalUnreadNotifications: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });
  const navigate = useNavigate();

  // Smart polling refs
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);

  useEffect(() => {
    fetchDashboardData();

    // Smart polling setup (60 seconds)
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

  // Smart polling functions (60 seconds)
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

  // Manual refresh with toast
  const handleManualRefresh = async () => {
    showToast('Refreshing dashboard data...', 'success');
    await fetchDashboardData();
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all stats in parallel for better performance
      const [
        usersResponse,
        postsResponse,
        reportsResponse,
        feedbackResponse,
        deletionRequestsResponse,
        notificationsResponse
      ] = await Promise.all([
        fetch('http://localhost:8000/api/admin/users/stats', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('http://localhost:8000/api/admin/posts', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache', 
            'Pragma': 'no-cache'
          }
        }),
        fetch('http://localhost:8000/api/admin/reports', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('http://localhost:8000/api/admin/feedback/stats', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('http://localhost:8000/api/admin/deletion-requests', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }),
        fetch('http://localhost:8000/api/admin/notifications/stats', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
      ]);

      // Process responses
      let totalUsers = 0;
      let totalPosts = 0;
      let totalReports = 0;
      let totalFeedback = 0;
      let totalDeletionRequests = 0;
      let totalUnreadNotifications = 0;
      let recentActivities = [];

      // Users
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.stats?.totalUsers || usersData.totalUsers || 0;
      }

      // Posts
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        totalPosts = postsData.posts?.length || postsData.totalPosts || 0;
        recentActivities = generateRecentActivities(postsData.posts || []);
      }

      // Reports - FIXED: Properly extract reports count
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        totalReports = reportsData.reports?.length || reportsData.total || 0;
      }

      // Feedback - FIXED: Properly extract feedback count
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        totalFeedback = feedbackData.stats?.total || feedbackData.total || 0;
      }

      // Deletion Requests - FIXED: Properly extract pending requests
      if (deletionRequestsResponse.ok) {
        const deletionData = await deletionRequestsResponse.json();
        totalDeletionRequests = deletionData.requests?.length || deletionData.pendingRequests || 0;
      }

      // Notifications - FIXED: Properly extract unread count
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        totalUnreadNotifications = notificationsData.stats?.unread || notificationsData.unread || 0;
      }

      setStats({
        totalUsers,
        totalPosts,
        totalReports,
        totalFeedback,
        totalDeletionRequests,
        totalUnreadNotifications,
        recentActivities
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (posts) => {
    if (!posts || posts.length === 0) return [];
    
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
      case 'reports':
        navigate('/admin/reports');
        break;
      case 'feedback':
        navigate('/admin/feedback');
        break;
      case 'deletion-requests': 
        navigate('/admin/deletion-requests');
        break;
      case 'notifications':
        navigate('/admin/notifications');
        break;
      default:
        break;
    }
  };

  // StatCard component with better structure
  const StatCard = ({ icon, value, label, color, type }) => (
    <div 
      className='dashboard-stat-card clickable-stat' 
      onClick={() => handleStatClick(type)}
      title={`Click to view ${label}`}
    >
      <div className='dashboard-stat-content'>
        <div className='dashboard-stat-icon' style={{ backgroundColor: color }}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className='dashboard-stat-info'>
          <h3>{loading ? '...' : value.toLocaleString()}</h3>
          <p>{label}</p>
        </div>
      </div>
    </div>
  );

  // ActivityItem with better structure
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
      {/* Toast Notification */}
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
        {/* Header with Refresh Button */}
        <div className="dashboard-header">
          <div className="dashboard-header-content">
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
            icon={faFlag} 
            value={stats.totalReports} 
            label="Total Reports" 
            color="#ef4444"
            type="reports"
          />
          <StatCard 
            icon={faComment} 
            value={stats.totalFeedback} 
            label="Total Feedback" 
            color="#10b981"
            type="feedback"
          />
          <StatCard 
            icon={faTrash} 
            value={stats.totalDeletionRequests} 
            label="Deletion Requests" 
            color="#f59e0b"
            type="deletion-requests"
          />
          <StatCard 
            icon={faBell} 
            value={stats.totalUnreadNotifications} 
            label="Unread Notifications" 
            color="#06b6d4"
            type="notifications"
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
                      <span className='stat-label'>Report Rate</span>
                      <span className='stat-value'>
                        {stats.totalUsers > 0 
                          ? `${Math.round((stats.totalReports / stats.totalUsers) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className='quick-stat-item'>
                      <span className='stat-label'>Feedback Rate</span>
                      <span className='stat-value'>
                        {stats.totalUsers > 0 
                          ? `${Math.round((stats.totalFeedback / stats.totalUsers) * 100)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                    <div className='quick-stat-item'>
                      <span className='stat-label'>Pending Actions</span>
                      <span className='stat-value'>
                        {stats.totalDeletionRequests + stats.totalUnreadNotifications}
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