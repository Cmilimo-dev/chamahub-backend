// Centralized API configuration for mobile and web access

// Get the computer's IP address (you'll need to update this to your actual IP)
const LOCAL_IP = '192.168.100.43';

// Function to determine the API base URL based on environment
export const getApiBaseUrl = () => {
  // Check if running in mobile app (Capacitor)
  // Capacitor apps have window.location.hostname as 'localhost' and specific user agents
  const isCapacitor = window.location.protocol === 'capacitor:' || 
                      window.location.protocol === 'file:' ||
                      (window.location.hostname === 'localhost' && 
                       navigator.userAgent.includes('Mobile'));
  
  if (isCapacitor) {
    // For Android emulator, use 10.0.2.2 to reach host machine
    return 'http://10.0.2.2:4000/api';
  }
  
  // Check if accessing from mobile browser on same network
  if (window.location.hostname === LOCAL_IP) {
    return `http://${LOCAL_IP}:4000/api`;
  }
  
  // For web app on localhost, use localhost
  return 'http://localhost:4000/api';
};

// Fallback API URLs for connection testing
export const getApiUrls = () => {
  const primary = getApiBaseUrl();
  const fallbacks = [];
  
  // Check if running in mobile app (Capacitor)
  const isCapacitor = window.location.protocol === 'capacitor:' || 
                      window.location.protocol === 'file:' ||
                      (window.location.hostname === 'localhost' && 
                       navigator.userAgent.includes('Mobile'));
  
  if (isCapacitor) {
    // Primary: 10.0.2.2, Fallback: actual IP
    fallbacks.push(`http://${LOCAL_IP}:4000/api`);
  } else {
    // Primary: localhost/IP, Fallback: localhost
    fallbacks.push('http://localhost:4000/api');
    fallbacks.push(`http://${LOCAL_IP}:4000/api`);
  }
  
  return { primary, fallbacks };
};

export const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('API Configuration:');
console.log('- API_BASE_URL:', API_BASE_URL);
console.log('- Window location:', window.location);
console.log('- User agent:', navigator.userAgent);
console.log('- Local IP:', LOCAL_IP);

export default {
  API_BASE_URL,
  LOCAL_IP,
  getApiBaseUrl
};
