// hooks/useWifiUrl.js
import { useMemo } from 'react'; // ✅ Add this import

export function useWifiUrl() {
  return useMemo(() => {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) return 'http://localhost:8000'; // Backend port 8000
    
    if (window.location.hostname.includes('10.129.')) {
      return 'http://10.129.103.2:8000'; // Backend port 8000
    } else if(window.location.hostname.includes('10.85.')){
       return 'http://10.85.180.2:8000';
    }else{
      return 'http://192.168.1.27:8000'; // Backend port 8000
    }
  }, []);
}