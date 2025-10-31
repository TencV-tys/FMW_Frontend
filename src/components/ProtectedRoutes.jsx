import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ allowedRole, children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
             // ✅ Simple detection based on current URL
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const wifi = isLocalhost 
  ? 'http://localhost:8000' 
  : 'http://192.168.1.27:8000';
        const res = await fetch(`${wifi}/auth/me`, {
          credentials: 'include', // include cookies
        });

        if (!res.ok) {
          throw new Error('Not authorized');
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Authorization failed:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  // ✅ Role-based protection
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
