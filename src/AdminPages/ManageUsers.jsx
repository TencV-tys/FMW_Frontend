import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faTrash, 
  faBan, 
  faCheckCircle, 
  faRefresh,
  faUser,
  faUserShield,
  faUserSlash,
  faFilter,
  faList,
  faEnvelope,
  faVenusMars,
  faCalendar,
  faPauseCircle,
  faClock,
  faFlag,
  faExclamationTriangle,
  faTimes,
  faBell,
  faUndo,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';
import './styles/ManageUsers.css';

export default function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  
  // Modal states
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [suspensionDuration, setSuspensionDuration] = useState('7');
  const [customDays, setCustomDays] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // 🆕 FIXED: Single ref declarations
  const [highlightedUser, setHighlightedUser] = useState(null);
  const tableContainerRef = useRef(null);
  const highlightedRowRef = useRef(null);

  // Smart polling refs and warned users tracking
  const pollingIntervalRef = useRef(null);
  const isTabActiveRef = useRef(true);
  const [warnedUsers, setWarnedUsers] = useState(() => {
    const saved = localStorage.getItem('warnedUsers');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Report thresholds using BOTH monthly and total reports
  const REPORT_THRESHOLDS = {
    WARNING: {
      MONTHLY: 3,
      TOTAL: 10
    },
    CAN_SUSPEND: {
      MONTHLY: 5,
      TOTAL: 15
    },
    CAN_BAN: {
      MONTHLY: 8,
      TOTAL: 20
    },
    CAN_DELETE: {
      MONTHLY: 10,
      TOTAL: 25
    }
  };

  // 🆕 IMPROVED: Enhanced highlight scrolling with better positioning
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightUser = urlParams.get('highlightUser');
    
    if (highlightUser) {
      const userId = parseInt(highlightUser);
      setHighlightedUser(userId);
      
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        scrollToHighlightedUser(userId);
      }, 800);
    }
  }, []);

  // 🆕 IMPROVED: Scroll to highlighted user with proper centering
  const scrollToHighlightedUser = (userId) => {
    const element = document.querySelector(`[data-user-id="${userId}"]`);
    if (element && tableContainerRef.current) {
      const container = tableContainerRef.current;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const containerHeight = container.clientHeight;
      
      // Calculate scroll position to center the element
      const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2);
      
      container.scrollTo({
        top: Math.max(0, scrollTop), // Ensure we don't scroll to negative values
        behavior: 'smooth'
      });
      
      // Store ref for potential re-scrolling
      highlightedRowRef.current = element;
    }
  };

  // 🆕 IMPROVED: Re-scroll when users data loads and highlighted user exists
  useEffect(() => {
    if (highlightedUser && users.length > 0 && !loading) {
      setTimeout(() => {
        scrollToHighlightedUser(highlightedUser);
      }, 500);
    }
  }, [users, loading, highlightedUser]);

  // 🆕 ADDED: Auto-scroll when highlighted user changes
  useEffect(() => {
    if (highlightedUser) {
      setTimeout(() => {
        scrollToHighlightedUser(highlightedUser);
      }, 300);
    }
  }, [highlightedUser]);

  // 🆕 FIXED: Check for deleted users when navigating from notifications
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightUser = urlParams.get('highlightUser');
    
    if (highlightUser) {
      const userId = parseInt(highlightUser);
      setHighlightedUser(userId);
      
      if (users.length > 0) {
        const user = users.find(u => u.id === userId);
        
        if (!user) {
          showToast('This user has been deleted or does not exist', 'error');
        } else if (user.deleted_at) {
          showToast('This user has been deleted', 'warning');
        }
      }
    }
  }, [users]);

  // Save to localStorage whenever warnedUsers changes
  useEffect(() => {
    localStorage.setItem('warnedUsers', JSON.stringify([...warnedUsers]));
  }, [warnedUsers]);

  useEffect(() => {
    fetchUsers();

    const handleVisibilityChange = () => {
      isTabActiveRef.current = !document.hidden;
      if (isTabActiveRef.current) {
        fetchUsers();
        startPolling();
      } else {
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
    stopPolling();
    pollingIntervalRef.current = setInterval(() => {
      if (isTabActiveRef.current) {
        fetchUsers();
      }
    }, 60000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    showToast('Refreshing users...', 'success');
    await fetchUsers();
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/admin/users-with-reports', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache' 
        }
      });
      const data = await res.json();
      setUsers(data); 
      
      // Check for users that need automatic warnings
      checkForAutomaticWarnings(data);
    } catch (error) {
      console.log(`Error fetching users with reports: ${error.message}`);
      // Fallback to basic user data
      try {
        const fallbackRes = await fetch('http://localhost:8000/api/admin/users', {
          credentials: 'include'
        });
        const fallbackData = await fallbackRes.json();
        const usersWithDefaultStats = fallbackData.map(user => ({
          ...user,
          monthly_report_count: 0,
          total_report_count: 0,
          active_posts_with_reports: 0
        }));
        setUsers(usersWithDefaultStats);
      } catch (fallbackError) {
        console.log(`Fallback error: ${fallbackError.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // AUTOMATIC WARNING CHECK - BOTH MONTHLY AND TOTAL
  const checkForAutomaticWarnings = async (usersData) => {
    try {
      const usersNeedingWarning = usersData.filter(user => 
        user.status === 'active' && 
        user.role !== 'admin' &&
        !user.deleted_at &&
        (user.monthly_report_count === REPORT_THRESHOLDS.WARNING.MONTHLY || 
         user.total_report_count === REPORT_THRESHOLDS.WARNING.TOTAL) &&
        !warnedUsers.has(user.id)
      );

      if (usersNeedingWarning.length === 0) return;

      const newWarnedUsers = new Set(warnedUsers);
      let warningsSent = 0;
      
      for (const user of usersNeedingWarning) {
        const success = await sendAutomaticWarning(user);
        if (success) {
          newWarnedUsers.add(user.id);
          warningsSent++;
          console.log(`✅ Warning sent to user ${user.id} for ${user.monthly_report_count} monthly reports OR ${user.total_report_count} total reports`);
        }
      }
      
      if (warningsSent > 0) {
        setWarnedUsers(newWarnedUsers);
        showToast(`Automatic warnings sent to ${warningsSent} user(s)`, 'success');
      }
    } catch (error) {
      console.error('Error checking automatic warnings:', error);
    }
  };

  // SEND AUTOMATIC WARNING - ONLY USER ID (NO REPORT COUNTS)
  const sendAutomaticWarning = async (user) => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/send-user-warning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (response.ok) {
        console.log(`✅ Generic warning sent to user: ${user.first_name} ${user.last_name}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending automatic warning:', error);
      return false;
    }
  };

  // Handle user row click to navigate to user details or related content
  const handleUserClick = (user) => {
    navigate(`/admin/manage-posts?userId=${user.id}&userName=${encodeURIComponent(getUserName(user))}`);
  };

  // OPEN MODAL FUNCTIONS WITH VALIDATION
  const openSuspendModal = (user) => {
    if (user.role === 'admin') {
      showToast('Cannot suspend admin users', 'error');
      return;
    }

    if (!canSuspendUser(user)) {
      showToast(`User needs ${REPORT_THRESHOLDS.CAN_SUSPEND.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_SUSPEND.TOTAL}+ total reports to suspend`, 'error');
      return;
    }

    setSelectedUser(user);
    setSuspensionDuration('7');
    setCustomDays('');
    setSuspensionReason('');
    setShowSuspendModal(true);
  };

  const openBanModal = (user) => {
    if (user.role === 'admin') {
      showToast('Cannot ban admin users', 'error');
      return;
    }

    if (!canBanUser(user)) {
      showToast(`User needs ${REPORT_THRESHOLDS.CAN_BAN.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_BAN.TOTAL}+ total reports to ban`, 'error');
      return;
    }

    setSelectedUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const openDeleteModal = (user) => {
    if (user.role === 'admin') {
      showToast('Cannot delete admin users', 'error');
      return;
    }

    if (!canDeleteUser(user)) {
      showToast(`User needs ${REPORT_THRESHOLDS.CAN_DELETE.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_DELETE.TOTAL}+ total reports to delete`, 'error');
      return;
    }

    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openActivateModal = (user) => {
    setSelectedUser(user);
    setShowActivateModal(true);
  };

  // CLOSE ALL MODALS
  const closeAllModals = () => {
    setShowSuspendModal(false);
    setShowBanModal(false);
    setShowDeleteModal(false);
    setShowActivateModal(false);
    setSelectedUser(null);
    setIsProcessing(false);
  };

  // DELETE USER
  const handleDelete = async () => {
    if (!selectedUser) return;
    
    if (selectedUser.role === 'admin') {
      showToast('Cannot delete admin users', 'error');
      closeAllModals();
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      if (res.ok) {
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        showToast('User deleted successfully!', 'success');
        closeAllModals();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to delete user', 'error');
      }
    } catch (error) { 
      console.log(`Delete error: ${error.message}`);
      showToast('Error deleting user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUSPEND USER
  const handleSuspend = async () => {
    if (!selectedUser) return;
    
    if (!suspensionReason.trim()) {
      showToast('Please provide a reason for suspension.', 'error');
      return;
    }

    if (suspensionDuration === 'custom' && (!customDays || customDays < 1)) {
      showToast('Please enter a valid number of days for custom suspension.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const suspendData = {
        status: 'suspended',
        reason: suspensionReason,
        duration: suspensionDuration,
        sendNotification: true
      };

      if (suspensionDuration === 'custom') {
        suspendData.customDays = customDays;
      }

      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(suspendData)
      });
      
      if (res.ok) {
        const result = await res.json();
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { 
            ...user, 
            status: 'suspended',
            suspended_until: result.data.suspended_until
          } : user
        ));
        showToast(`User "${getUserName(selectedUser)}" suspended for ${result.data.duration} day(s)!`, 'success');
        closeAllModals();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to suspend user', 'error');
      }
    } catch (error) {
      console.log(`Suspend error: ${error.message}`);
      showToast('Error suspending user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // BAN USER
  const handleBan = async () => {
    if (!selectedUser) return;
    
    if (!banReason.trim()) {
      showToast('Please provide a reason for banning.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'banned',
          reason: banReason.trim(),
          sendNotification: true
        })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, status: 'banned' } : user
        ));
        showToast(`User "${getUserName(selectedUser)}" banned successfully!`, 'success');
        closeAllModals();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to ban user', 'error');
      }
    } catch (error) {
      console.log(`Ban error: ${error.message}`);
      showToast('Error banning user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ACTIVATE USER
  const handleActivate = async () => {
    if (!selectedUser) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/users/${selectedUser.id}/status`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'active',
          sendNotification: true
        })
      });
      
      if (res.ok) {
        setUsers(users.map(user => 
          user.id === selectedUser.id ? { ...user, status: 'active', suspended_until: null } : user
        ));
        showToast(`User "${getUserName(selectedUser)}" activated successfully!`, 'success');
        closeAllModals();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Failed to activate user', 'error');
      }
    } catch (error) {
      console.log(`Activate error: ${error.message}`);
      showToast('Error activating user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // RESTORE USER FUNCTION
  const handleRestore = async (user) => {
    if (!user || !user.deleted_at) {
      showToast('User is not deleted or cannot be restored', 'error');
      return;
    }
    
    setIsProcessing(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/users/${user.id}/restore`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const responseData = await res.json();
      console.log('Backend response:', responseData);
      
      if (res.ok) {
        setUsers(users.map(u => 
          u.id === user.id ? { 
            ...u, 
            status: 'active', 
            deleted_at: null 
          } : u
        ));
        showToast(`User "${getUserName(user)}" restored successfully!`, 'success');
      } else {
        console.log('Backend error:', responseData);
        showToast(responseData.error || 'Failed to restore user', 'error');
      }
    } catch (error) {
      console.log(`Restore error: ${error.message}`);
      showToast('Error restoring user', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // CHECK IF USER CAN BE SUSPENDED - BOTH MONTHLY AND TOTAL
  const canSuspendUser = (user) => {
    return user.role !== 'admin' && 
           user.status === 'active' && 
           !user.deleted_at &&
           (user.monthly_report_count >= REPORT_THRESHOLDS.CAN_SUSPEND.MONTHLY || 
            user.total_report_count >= REPORT_THRESHOLDS.CAN_SUSPEND.TOTAL);
  };

  // CHECK IF USER CAN BE BANNED - BOTH MONTHLY AND TOTAL
  const canBanUser = (user) => {
    return user.role !== 'admin' && 
           user.status === 'active' && 
           !user.deleted_at &&
           (user.monthly_report_count >= REPORT_THRESHOLDS.CAN_BAN.MONTHLY || 
            user.total_report_count >= REPORT_THRESHOLDS.CAN_BAN.TOTAL);
  };

  // CHECK IF USER CAN BE DELETED - BOTH MONTHLY AND TOTAL
  const canDeleteUser = (user) => {
    return user.role !== 'admin' && 
           !user.deleted_at &&
           (user.monthly_report_count >= REPORT_THRESHOLDS.CAN_DELETE.MONTHLY || 
            user.total_report_count >= REPORT_THRESHOLDS.CAN_DELETE.TOTAL);
  };

  // Handle stat card click for filtering
  const handleStatCardClick = (filterType, value) => {
    if (filterType === 'status') {
      setStatusFilter(value === 'all' ? 'all' : value);
    } else if (filterType === 'role') {
      setRoleFilter(value === 'all' ? 'all' : value);
    } else if (filterType === 'all') {
      setStatusFilter('all');
      setRoleFilter('all');
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'deleted' ? user.deleted_at : 
                          statusFilter === 'active' ? user.status === 'active' && !user.deleted_at :
                          statusFilter === 'suspended' ? user.status === 'suspended' && !user.deleted_at :
                          statusFilter === 'banned' ? user.status === 'banned' && !user.deleted_at :
                          user.status === statusFilter && !user.deleted_at);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Stats calculation
  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' && !u.deleted_at).length,
    suspended: users.filter(u => u.status === 'suspended' && !u.deleted_at).length,
    banned: users.filter(u => u.status === 'banned' && !u.deleted_at).length,
    deleted: users.filter(u => u.deleted_at).length
  };

  // Get status badge class
  const getStatusClass = (status) => {
    const statusMap = {
      active: 'manage-users-status-active',
      suspended: 'manage-users-status-suspended',
      banned: 'manage-users-status-banned'
    };
    return statusMap[status] || 'manage-users-status-active';
  };

  // Get status display text
  const getStatusDisplayText = (user) => {
    if (user.deleted_at) {
      return 'Deleted';
    }

    if (user.status === 'suspended' && user.suspended_until) {
      const untilDate = new Date(user.suspended_until);
      const now = new Date();
      const diffTime = untilDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        return `Suspended (${diffDays} day${diffDays !== 1 ? 's' : ''} left)`;
      }
    }
    
    const statusMap = {
      active: 'Active',
      suspended: 'Suspended',
      banned: 'Banned'
    };
    return statusMap[user.status] || 'Active';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const iconMap = {
      active: faCheckCircle,
      suspended: faPauseCircle,
      banned: faUserSlash
    };
    return iconMap[status] || faCheckCircle;
  };

  // Get role badge class
  const getRoleClass = (role) => {
    return role === 'admin' ? 'manage-users-role-admin' : 'manage-users-role-user';
  };

  // Get user full name
  const getUserName = (user) => {
    return `${user.first_name} ${user.last_name}`;
  };

  // Check if any filter is active
  const isFilterActive = () => {
    return statusFilter !== 'all' || roleFilter !== 'all' || searchTerm !== '';
  };

  // Clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setRoleFilter('all');
    setSearchTerm('');
  };

  // GET ACTION BUTTONS WITH RESTORE FUNCTIONALITY
  const getActionButtons = (user) => {
    if (user.deleted_at) {
      return (
        <>
          <button
            className="manage-users-action-btn restore"
            onClick={() => handleRestore(user)}
            title="Restore User"
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={faUndo} />
          </button>
          <button
            className="manage-users-action-btn delete permanent"
            onClick={() => openDeleteModal(user)}
            title="Permanently Delete User"
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    }

    if (user.status === 'active') {
      return (
        <>
          <button
            className={`manage-users-action-btn suspend ${!canSuspendUser(user) ? 'disabled' : ''}`}
            onClick={() => canSuspendUser(user) && openSuspendModal(user)}
            title={!canSuspendUser(user) ? 
              (user.role === 'admin' ? 'Cannot suspend admin users' : 
               `Need ${REPORT_THRESHOLDS.CAN_SUSPEND.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_SUSPEND.TOTAL}+ total reports to suspend`) 
              : "Suspend User"}
            disabled={!canSuspendUser(user) || isProcessing}
          >
            <FontAwesomeIcon icon={faPauseCircle} />
          </button>
          <button
            className={`manage-users-action-btn ban ${!canBanUser(user) ? 'disabled' : ''}`}
            onClick={() => canBanUser(user) && openBanModal(user)}
            title={!canBanUser(user) ? 
              (user.role === 'admin' ? 'Cannot ban admin users' : 
               `Need ${REPORT_THRESHOLDS.CAN_BAN.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_BAN.TOTAL}+ total reports to ban`) 
              : "Ban User"}
            disabled={!canBanUser(user) || isProcessing}
          >
            <FontAwesomeIcon icon={faUserSlash} />
          </button>
          <button
            className={`manage-users-action-btn delete ${!canDeleteUser(user) ? 'disabled' : ''}`}
            onClick={() => canDeleteUser(user) && openDeleteModal(user)}
            title={!canDeleteUser(user) ? 
              (user.role === 'admin' ? 'Cannot delete admin users' : 
               `Need ${REPORT_THRESHOLDS.CAN_DELETE.MONTHLY}+ monthly OR ${REPORT_THRESHOLDS.CAN_DELETE.TOTAL}+ total reports to delete`) 
              : "Delete User"}
            disabled={!canDeleteUser(user) || isProcessing}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="manage-users-action-btn activate"
            onClick={() => openActivateModal(user)}
            title="Activate User"
            disabled={isProcessing}
          >
            <FontAwesomeIcon icon={faCheckCircle} />
          </button>
          <button
            className={`manage-users-action-btn delete ${!canDeleteUser(user) ? 'disabled' : ''}`}
            onClick={() => canDeleteUser(user) && openDeleteModal(user)}
            title={!canDeleteUser(user) ? 'Cannot delete admin users' : "Delete User"}
            disabled={!canDeleteUser(user) || isProcessing}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </>
      );
    }
  };

  // Report severity indicator with BOTH monthly and total
  const getReportSeverity = (user) => {
    if (user.deleted_at) return 'deleted';
    
    const monthlyReports = user.monthly_report_count || 0;
    const totalReports = user.total_report_count || 0;
    
    // Check DELETE threshold
    if (monthlyReports >= REPORT_THRESHOLDS.CAN_DELETE.MONTHLY || totalReports >= REPORT_THRESHOLDS.CAN_DELETE.TOTAL) 
      return 'high';
    
    // Check BAN threshold
    if (monthlyReports >= REPORT_THRESHOLDS.CAN_BAN.MONTHLY || totalReports >= REPORT_THRESHOLDS.CAN_BAN.TOTAL) 
      return 'medium';
    
    // Check SUSPEND threshold
    if (monthlyReports >= REPORT_THRESHOLDS.CAN_SUSPEND.MONTHLY || totalReports >= REPORT_THRESHOLDS.CAN_SUSPEND.TOTAL) 
      return 'low';
    
    // Check WARNING threshold
    if (monthlyReports >= REPORT_THRESHOLDS.WARNING.MONTHLY || totalReports >= REPORT_THRESHOLDS.WARNING.TOTAL) 
      return 'warning';
    
    return 'none';
  };

  // Report severity badge with BOTH monthly and total
  const ReportSeverityBadge = ({ user }) => {
    const severity = getReportSeverity(user);
    
    const severityConfig = {
      high: { 
        class: 'manage-users-report-high', 
        text: 'High Risk - Can Delete', 
        icon: faExclamationTriangle 
      },
      medium: { 
        class: 'manage-users-report-medium', 
        text: 'Medium Risk - Can Ban', 
        icon: faFlag 
      },
      low: { 
        class: 'manage-users-report-low', 
        text: 'Low Risk - Can Suspend', 
        icon: faFlag 
      },
      warning: { 
        class: 'manage-users-report-warning', 
        text: 'Warning Level', 
        icon: faBell 
      },
      none: { 
        class: 'manage-users-report-none', 
        text: 'No Risk', 
        icon: faCheckCircle 
      },
      deleted: { 
        class: 'manage-users-report-deleted', 
        text: 'User Deleted', 
        icon: faUserSlash 
      }
    };

    const config = severityConfig[severity];

    return (
      <span className={`manage-users-report-severity-badge ${config.class}`}>
        <FontAwesomeIcon icon={config.icon} />
        {config.text}
      </span>
    );
  };

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => (
    <div 
      className={`manage-users-mobile-card ${highlightedUser === user.id ? 'manage-users-highlighted' : ''}`}
      data-user-id={user.id}
    >
      <div className="manage-users-mobile-header">
        <div className="manage-users-mobile-title">
          <h3>
            {user.first_name} {user.last_name}
            <FontAwesomeIcon 
              icon={faExternalLinkAlt} 
              className="manage-users-external-link-icon"
              title="Click to view user posts"
            />
          </h3>
          <div className="manage-users-mobile-id">ID: #{user.id}</div>
        </div>
        <div className="manage-users-mobile-badges">
          <span className={`manage-users-mobile-status ${getStatusClass(user.status)} ${user.deleted_at ? 'manage-users-status-deleted' : ''}`}>
            <FontAwesomeIcon icon={user.deleted_at ? faUserSlash : getStatusIcon(user.status)} />
            {getStatusDisplayText(user)}
          </span>
          <span className={`manage-users-mobile-role ${getRoleClass(user.role)}`}>
            <FontAwesomeIcon icon={user.role === 'admin' ? faUserShield : faUser} />
            {user.role}
          </span>
        </div>
      </div>
      
      <div className="manage-users-mobile-details">
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faEnvelope} />
          <span>{user.email}</span>
        </div>
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faVenusMars} />
          <span>{user.gender || 'Not specified'}</span>
        </div>
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faCalendar} />
          <span>{new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</span>
        </div>
        
        {/* Report Statistics */}
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faFlag} />
          <span>Monthly Reports: {user.monthly_report_count || 0}</span>
        </div>
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faFlag} />
          <span>Total Reports: {user.total_report_count || 0}</span>
        </div>
        <div className="manage-users-mobile-detail">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>Problem Posts: {user.active_posts_with_reports || 0}</span>
        </div>

        {user.status === 'suspended' && user.suspended_until && (
          <div className="manage-users-mobile-detail">
            <FontAwesomeIcon icon={faClock} />
            <span>Until: {new Date(user.suspended_until).toLocaleDateString()}</span>
          </div>
        )}

        {user.deleted_at && (
          <div className="manage-users-mobile-detail">
            <FontAwesomeIcon icon={faCalendar} />
            <span>Deleted: {new Date(user.deleted_at).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Report Severity Indicator */}
      <div className="manage-users-mobile-report-severity">
        <ReportSeverityBadge user={user} />
      </div>
      
      <div className="manage-users-mobile-actions">
        {getActionButtons(user)}
      </div>
    </div>
  );

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`manage-users-toast manage-users-toast-${toast.type}`}>
          <div className="manage-users-toast-content">
            <FontAwesomeIcon 
              icon={toast.type === 'success' ? faCheckCircle : faExclamationTriangle} 
              className="manage-users-toast-icon" 
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="manage-users-header">
        <div className="manage-users-header-content">
          <p>Admin panel for user management and moderation</p>
        </div>
        <button 
          className="manage-users-refresh-btn"
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faRefresh} spin={loading} />
          Refresh
        </button>
      </div> 

      {/* Stats Summary */}
      <div className="manage-users-stats">
        <div 
          className={`manage-users-stat-card ${!isFilterActive() ? 'manage-users-stat-active' : ''}`}
          onClick={() => handleStatCardClick('all', 'all')}
          style={{ cursor: 'pointer' }}
          title="Show all users"
        >
          <span className="manage-users-stat-number">{userStats.total}</span>
          <span className="manage-users-stat-label">Total Users</span>
        </div>
        <div 
          className={`manage-users-stat-card ${statusFilter === 'active' ? 'manage-users-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'active')}
          style={{ cursor: 'pointer' }}
          title="Filter by Active status"
        >
          <span className="manage-users-stat-number">{userStats.active}</span>
          <span className="manage-users-stat-label">Active Users</span>
        </div>
        <div 
          className={`manage-users-stat-card ${statusFilter === 'suspended' ? 'manage-users-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'suspended')}
          style={{ cursor: 'pointer' }}
          title="Filter by Suspended status"
        >
          <span className="manage-users-stat-number">{userStats.suspended}</span>
          <span className="manage-users-stat-label">Suspended Users</span>
        </div>
        <div 
          className={`manage-users-stat-card ${statusFilter === 'banned' ? 'manage-users-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'banned')}
          style={{ cursor: 'pointer' }}
          title="Filter by Banned status"
        >
          <span className="manage-users-stat-number">{userStats.banned}</span>
          <span className="manage-users-stat-label">Banned Users</span>
        </div>
        <div 
          className={`manage-users-stat-card ${statusFilter === 'deleted' ? 'manage-users-stat-active' : ''}`}
          onClick={() => handleStatCardClick('status', 'deleted')}
          style={{ cursor: 'pointer' }}
          title="Filter by Deleted status"
        >
          <span className="manage-users-stat-number">{userStats.deleted}</span>
          <span className="manage-users-stat-label">Deleted Users</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="manage-users-filters">
        <div className="manage-users-search-box">
          <FontAwesomeIcon icon={faSearch} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="manage-users-filter-group">
          <FontAwesomeIcon icon={faFilter} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>

        <div className="manage-users-filter-group">
          <FontAwesomeIcon icon={faUser} />
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="manage-users-filter-group">
          <FontAwesomeIcon icon={faList} />
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
          >
            <option value="table">Table View</option>
            <option value="card">Card View</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {isFilterActive() && (
          <button  
            className="manage-users-clear-filters-btn"
            onClick={clearAllFilters}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div> 

      {/* Report Thresholds Info */}
      <div className="manage-users-thresholds-info">
        <h3>Report Thresholds (Monthly OR Total):</h3>
        <div className="manage-users-thresholds-grid">
          <div className="manage-users-threshold-item">
            <span className="manage-users-threshold-badge manage-users-threshold-warning">⚠️</span>
            <span className="manage-users-threshold-text">
              <strong>{REPORT_THRESHOLDS.WARNING.MONTHLY}+ Monthly OR {REPORT_THRESHOLDS.WARNING.TOTAL}+ Total Reports:</strong> Automatic warning sent
            </span>
          </div>
          <div className="manage-users-threshold-item">
            <span className="manage-users-threshold-badge manage-users-threshold-suspend">⏸️</span>
            <span className="manage-users-threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_SUSPEND.MONTHLY}+ Monthly OR {REPORT_THRESHOLDS.CAN_SUSPEND.TOTAL}+ Total Reports:</strong> Can suspend user
            </span>
          </div>
          <div className="manage-users-threshold-item">
            <span className="manage-users-threshold-badge manage-users-threshold-ban">🚫</span>
            <span className="manage-users-threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_BAN.MONTHLY}+ Monthly OR {REPORT_THRESHOLDS.CAN_BAN.TOTAL}+ Total Reports:</strong> Can ban user
            </span>
          </div>
          <div className="manage-users-threshold-item">
            <span className="manage-users-threshold-badge manage-users-threshold-delete">🗑️</span>
            <span className="manage-users-threshold-text">
              <strong>{REPORT_THRESHOLDS.CAN_DELETE.MONTHLY}+ Monthly OR {REPORT_THRESHOLDS.CAN_DELETE.TOTAL}+ Total Reports:</strong> Can delete user
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='manage-users-table-container' ref={tableContainerRef}>
        <div className='manage-users-table-inner'>
          <div className='manage-users-table-content'>
            <div className='manage-users-table-header'>
              <h2>Users Management</h2>
              <div className="manage-users-header-info">
                <span className="manage-users-count">
                  {filteredUsers.length} of {users.length} user{filteredUsers.length !== 1 ? 's' : ''}
                  {isFilterActive() && ' (Filtered)'}
                </span>
              </div>
            </div>

            {loading ? (
              <div className="manage-users-loading-state">
                <div className="manage-users-loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="manage-users-empty-state">
                <p>
                  {users.length === 0 
                    ? "No users have been registered yet." 
                    : "No users match your search criteria."
                  }
                </p>
                {isFilterActive() && (
                  <button 
                    className="manage-users-retry-btn" 
                    onClick={clearAllFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : ( 
              <>
                {/* Desktop Table View */}
                <div className="manage-users-table-wrapper" style={{ display: viewMode === 'table' ? 'block' : 'none' }}>
                  <table className='manage-users-table'>
                    <thead>
                      <tr>
                        <th>User Info</th>
                        <th>Contact</th>
                        <th>Gender</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Monthly Reports</th>
                        <th>Total Reports</th>
                        <th>Problem Posts</th>
                        <th>Risk Level</th>
                        <th>Joined Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`${highlightedUser === user.id ? 'manage-users-highlighted' : ''} manage-users-clickable-row`}
                          data-user-id={user.id}
                          onClick={() => handleUserClick(user)}
                        >
                          <td>
                            <div className="manage-users-user-info">
                              <strong>
                                {user.first_name} {user.last_name}
                                <FontAwesomeIcon 
                                  icon={faExternalLinkAlt} 
                                  className="manage-users-external-link-icon"
                                  title="Click to view user posts"
                                />
                              </strong>
                              <small>ID: #{user.id}</small>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.gender || '-'}</td>
                          <td>
                            <span className={`manage-users-role-badge ${getRoleClass(user.role)}`}>
                              <FontAwesomeIcon icon={user.role === 'admin' ? faUserShield : faUser} />
                              {user.role}
                            </span>
                          </td>
                          <td>
                            <span className={`manage-users-status-badge ${getStatusClass(user.status)} ${user.deleted_at ? 'manage-users-status-deleted' : ''}`}>
                              <FontAwesomeIcon icon={user.deleted_at ? faUserSlash : getStatusIcon(user.status)} />
                              {getStatusDisplayText(user)}
                            </span>
                          </td>
                          <td>
                            <span className="manage-users-report-count">
                              {user.monthly_report_count || 0}
                            </span>
                          </td>
                          <td>
                            <span className="manage-users-report-count">
                              {user.total_report_count || 0}
                            </span>
                          </td>
                          <td>
                            <span className="manage-users-problem-posts">
                              {user.active_posts_with_reports || 0}
                            </span>
                          </td>
                          <td>
                            <ReportSeverityBadge user={user} />
                          </td>
                          <td>
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td>
                            <div className='manage-users-actions' onClick={(e) => e.stopPropagation()}>
                              {getActionButtons(user)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="manage-users-mobile-cards" style={{ display: viewMode === 'card' ? 'flex' : 'none' }}>
                  {filteredUsers.map(user => (
                    <MobileUserCard key={user.id} user={user} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Suspend User Modal */}
      {showSuspendModal && selectedUser && (
        <div className="manage-users-modal-overlay">
          <div className="manage-users-modal-content">
            <div className="manage-users-modal-header">
              <h3>Suspend User</h3>
              <button 
                className="manage-users-modal-close"
                onClick={closeAllModals}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-users-modal-body">
              <p>You are about to suspend <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="manage-users-user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="manage-users-report-stats-grid">
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Monthly Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Total Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Problem Posts:</span>
                    <span className="manage-users-stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="manage-users-form-group">
                <label htmlFor="suspensionReason">Reason for Suspension *</label>
                <textarea
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter the reason for suspension..."
                  rows="3"
                  required
                />
              </div>

              <div className="manage-users-form-group">
                <label htmlFor="suspensionDuration">Suspension Duration *</label>
                <select
                  id="suspensionDuration"
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(e.target.value)}
                >
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="custom">Custom duration</option>
                </select>
              </div>

              {suspensionDuration === 'custom' && (
                <div className="manage-users-form-group">
                  <label htmlFor="customDays">Number of Days *</label>
                  <input
                    type="number"
                    id="customDays"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    placeholder="Enter number of days"
                    min="1"
                    max="365"
                    required
                  />
                </div>
              )}

              <div className="manage-users-suspension-preview">
                <p><strong>Preview:</strong> User will be suspended for {
                  suspensionDuration === 'custom' ? `${customDays} day(s)` : `${suspensionDuration} day(s)`
                }</p>
              </div>
            </div>
            <div className="manage-users-modal-footer">
              <button 
                className="manage-users-btn-secondary"
                onClick={closeAllModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="manage-users-btn-primary suspend"
                onClick={handleSuspend}
                disabled={!suspensionReason.trim() || (suspensionDuration === 'custom' && !customDays) || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Suspension'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban User Modal */}
      {showBanModal && selectedUser && (
        <div className="manage-users-modal-overlay">
          <div className="manage-users-modal-content">
            <div className="manage-users-modal-header">
              <h3>Ban User</h3>
              <button 
                className="manage-users-modal-close"
                onClick={closeAllModals}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-users-modal-body">
              <div className="manage-users-warning-banner">
                <FontAwesomeIcon icon={faBan} />
                <strong>Warning: This action is permanent!</strong>
              </div>
              <p>You are about to <strong>permanently ban</strong> <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="manage-users-user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="manage-users-report-stats-grid">
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Monthly Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Total Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Problem Posts:</span>
                    <span className="manage-users-stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="manage-users-ban-consequences">
                <h4>Consequences of Banning:</h4>
                <ul>
                  <li>User will be permanently blocked from the platform</li>
                  <li>All their posts and content will be removed</li>
                  <li>They will not be able to create a new account with the same email</li>
                  <li>This action cannot be undone</li>
                </ul>
              </div>

              <div className="manage-users-form-group">
                <label htmlFor="banReason">Reason for Ban *</label>
                <textarea
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter the reason for permanent ban..."
                  rows="3"
                  required
                />
              </div>
            </div>
            <div className="manage-users-modal-footer">
              <button 
                className="manage-users-btn-secondary"
                onClick={closeAllModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="manage-users-btn-primary ban"
                onClick={handleBan}
                disabled={!banReason.trim() || isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Permanent Ban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="manage-users-modal-overlay">
          <div className="manage-users-modal-content">
            <div className="manage-users-modal-header">
              <h3>Delete User</h3>
              <button 
                className="manage-users-modal-close"
                onClick={closeAllModals}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-users-modal-body">
              <div className="manage-users-warning-banner">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <strong>Warning: This action cannot be undone!</strong>
              </div>
              <p>You are about to <strong>permanently delete</strong> user <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              {/* Report Statistics in Modal */}
              <div className="manage-users-user-report-stats">
                <h4>User Report Statistics:</h4>
                <div className="manage-users-report-stats-grid">
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Monthly Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.monthly_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Total Reports:</span>
                    <span className="manage-users-stat-value">{selectedUser.total_report_count || 0}</span>
                  </div>
                  <div className="manage-users-report-stat">
                    <span className="manage-users-stat-label">Problem Posts:</span>
                    <span className="manage-users-stat-value">{selectedUser.active_posts_with_reports || 0}</span>
                  </div>
                </div>
              </div>

              <div className="manage-users-deletion-consequences">
                <h4>Consequences of Deletion:</h4>
                <ul>
                  <li>All user data will be permanently removed</li>
                  <li>All their posts and content will be deleted</li>
                  <li>This action cannot be undone</li>
                  <li>User will receive notification about account deletion</li>
                </ul>
              </div>
            </div>
            <div className="manage-users-modal-footer">
              <button 
                className="manage-users-btn-secondary"
                onClick={closeAllModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="manage-users-btn-primary delete"
                onClick={handleDelete}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate User Modal */}
      {showActivateModal && selectedUser && (
        <div className="manage-users-modal-overlay">
          <div className="manage-users-modal-content">
            <div className="manage-users-modal-header">
              <h3>Activate User</h3>
              <button 
                className="manage-users-modal-close"
                onClick={closeAllModals}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="manage-users-modal-body">
              <div className="manage-users-success-banner">
                <FontAwesomeIcon icon={faCheckCircle} />
                <strong>Activate User Account</strong>
              </div>
              <p>You are about to activate user <strong>{getUserName(selectedUser)}</strong> ({selectedUser.email})</p>
              
              <p>This will restore their access to the platform and allow them to login again.</p>

              <div className="manage-users-activation-details">
                <h4>Current Status: <span className={`manage-users-status-badge ${getStatusClass(selectedUser.status)}`}>
                  {selectedUser.status}
                </span></h4>
                
                {selectedUser.suspended_until && (
                  <p><strong>Suspended until:</strong> {new Date(selectedUser.suspended_until).toLocaleDateString()}</p>
                )}
                {selectedUser.suspension_reason && (
                  <p><strong>Previous reason:</strong> {selectedUser.suspension_reason}</p>
                )}
              </div>
            </div>
            <div className="manage-users-modal-footer">
              <button 
                className="manage-users-btn-secondary"
                onClick={closeAllModals}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="manage-users-btn-primary activate"
                onClick={handleActivate}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Activation'}
              </button>
            </div>
          </div>
        </div> 
      )}
    </> 
  );
}