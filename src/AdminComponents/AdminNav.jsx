import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faGauge,
    faUsers,
    faNewspaper,
    faChartBar,
    faBell,
    faComments,
    faUserLock,
    faFlag,
    faTrash
} from '@fortawesome/free-solid-svg-icons';

import './AdminStyles/AdminNav.css';
import Logo from '../assets/Admin.png';
import { useState, useEffect, useRef } from 'react';

export default function AdminNav({ isOpen, setIsOpen }) {
    const [notificationCounts, setNotificationCounts] = useState({
        notifications: 0,
        reports: 0,
        feedback: 0,
        deletionRequests: 0
    });
    const pollingIntervalRef = useRef(null);
    const location = useLocation();

    // Smart polling with 30-second intervals
    useEffect(() => {
        fetchAllCounts();
        
        pollingIntervalRef.current = setInterval(fetchAllCounts, 30000);
        
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []); 

    const fetchAllCounts = async () => {
        try {
            // Fetch all counts in parallel
            const [notificationsCount, reportsCount, feedbackCount, deletionCount] = await Promise.all([
                fetchNotificationCount(),
                fetchReportsCount(),
                fetchFeedbackCount(),
                fetchDeletionRequestsCount()
            ]);

            setNotificationCounts({
                notifications: notificationsCount,
                reports: reportsCount,
                feedback: feedbackCount,
                deletionRequests: deletionCount
            });
        } catch (error) {
            console.error('Error fetching all counts:', error);
        }
    };

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/notifications/stats', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.stats?.unread || 0;
            } else {
                const userResponse = await fetch('http://localhost:8000/api/notifications/unread-count', {
                    credentials: 'include'
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    return userData.count || 0;
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error);
        }
        return 0;
    };

    const fetchReportsCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/reports', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.reports?.length || data.total || 0;
            }
        } catch (error) {
            console.error('Error fetching reports count:', error);
        }
        return 0;
    };

    const fetchFeedbackCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/feedback/stats', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.stats?.total || data.total || 0;
            }
        } catch (error) {
            console.error('Error fetching feedback count:', error);
        }
        return 0;
    };

    const fetchDeletionRequestsCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/deletion-requests', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.requests?.length || data.pendingRequests || 0;
            }
        } catch (error) {
            console.error('Error fetching deletion requests count:', error);
        }
        return 0;
    };

    // Check if a link is active
    const isActiveLink = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <header className={`admin-nav-main ${isOpen ? "admin-nav-open" : "admin-nav-closed"}`}>
            <nav className='admin-nav-inner'>
                {/* Toggle Button */}
                <div className='admin-nav-toggle'>
                    <button 
                        className='admin-toggle-btn' 
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        <FontAwesomeIcon 
                            className='admin-toggle-icon' 
                            icon={isOpen ? faChevronLeft : faChevronRight} 
                        />
                    </button>
                </div>

                {/* Logo and Profile - Only show when open */}
                {isOpen && (
                    <Link to='/admin' className='admin-profile-main'>
                        <div className='admin-logo-main'>
                            <img className='admin-logo-img' src={Logo} alt="Admin Dashboard Logo" />
                        </div>
                        <div className='admin-profile-info'>
                            <p className='admin-welcome-text'>Welcome!</p>
                            <p className='admin-role-text'>Admin</p>
                        </div>
                    </Link>
                )}

                {/* Navigation Links */}
                <div className='admin-nav-links-wrapper'>
                    {/* Dashboard - No count */}
                    <Link 
                        to='/admin' 
                        className={`admin-nav-link-item ${isActiveLink('/admin') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <FontAwesomeIcon icon={faGauge} className='admin-nav-icon' />
                            {isOpen && <span className='admin-nav-text'>Dashboard</span>}
                        </div>
                    </Link>
                    
                    {/* Manage Users - No count */}
                    <Link 
                        to='/admin/manage-users' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/manage-users') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <FontAwesomeIcon icon={faUsers} className='admin-nav-icon' />
                            {isOpen && <span className='admin-nav-text'>Manage Users</span>}
                        </div>
                    </Link>
                    
                    {/* Manage Posts - No count */}
                    <Link 
                        to='/admin/manage-posts' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/manage-posts') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <FontAwesomeIcon icon={faNewspaper} className='admin-nav-icon' />
                            {isOpen && <span className='admin-nav-text'>Manage Posts</span>}
                        </div>
                    </Link>
                    
                    {/* Reports - WITH COUNT */}
                    <Link 
                        to='/admin/reports' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/reports') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <div className='admin-notification-item'>
                                <FontAwesomeIcon icon={faFlag} className='admin-nav-icon' />
                                {isOpen && <span className='admin-nav-text'>Reports</span>}
                                {notificationCounts.reports > 0 && (
                                    <span 
                                        className='admin-nav-badge admin-nav-badge-reports'
                                        aria-label={`${notificationCounts.reports} pending reports`}
                                    >
                                        {notificationCounts.reports > 99 ? '99+' : notificationCounts.reports}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    
                    {/* Feedback - WITH COUNT */}
                    <Link 
                        to='/admin/feedback' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/feedback') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <div className='admin-notification-item'>
                                <FontAwesomeIcon icon={faComments} className='admin-nav-icon' />
                                {isOpen && <span className='admin-nav-text'>Feedback</span>}
                                {notificationCounts.feedback > 0 && (
                                    <span 
                                        className='admin-nav-badge admin-nav-badge-feedback'
                                        aria-label={`${notificationCounts.feedback} pending feedback`}
                                    >
                                        {notificationCounts.feedback > 99 ? '99+' : notificationCounts.feedback}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    
                    {/* Deletion Requests - WITH COUNT */}
                    <Link 
                        to='/admin/deletion-requests' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/deletion-requests') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <div className='admin-notification-item'>
                                <FontAwesomeIcon icon={faTrash} className='admin-nav-icon' />
                                {isOpen && <span className='admin-nav-text'>Deletion Requests</span>}
                                {notificationCounts.deletionRequests > 0 && (
                                    <span 
                                        className='admin-nav-badge admin-nav-badge-deletion'
                                        aria-label={`${notificationCounts.deletionRequests} pending deletion requests`}
                                    >
                                        {notificationCounts.deletionRequests > 99 ? '99+' : notificationCounts.deletionRequests}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                    
                    {/* Notifications - WITH COUNT */}
                    <Link 
                        to='/admin/notifications' 
                        className={`admin-nav-link-item ${isActiveLink('/admin/notifications') ? 'admin-nav-active' : ''}`}
                    >
                        <div className='admin-nav-link-content'>
                            <div className='admin-notification-item'>
                                <FontAwesomeIcon icon={faBell} className='admin-nav-icon' />
                                {isOpen && <span className='admin-nav-text'>Notifications</span>}
                                {notificationCounts.notifications > 0 && (
                                    <span 
                                        className='admin-nav-badge admin-nav-badge-notifications'
                                        aria-label={`${notificationCounts.notifications} unread notifications`}
                                    >
                                        {notificationCounts.notifications > 99 ? '99+' : notificationCounts.notifications}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
            </nav>
        </header>
    );
}