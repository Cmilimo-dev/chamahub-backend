// Service Worker for Web Push Notifications
// This handles push notifications when the web app is not in focus

const CACHE_NAME = 'chamahub-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Default notification body',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: 'chamahub-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/placeholder.svg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (e) {
      console.error('Error parsing notification data:', e);
      notificationData = { title: 'ChamaHub', body: event.data.text() };
    }
  }

  const notificationOptions = {
    ...options,
    ...notificationData,
    data: notificationData.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || 'ChamaHub',
      notificationOptions
    )
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Handle notification click based on type
  let urlToOpen = '/';
  
  if (notificationData.type === 'contribution_reminder') {
    urlToOpen = '/';
  } else if (notificationData.type === 'meeting_reminder') {
    urlToOpen = '/';
  } else if (notificationData.type === 'loan_update') {
    urlToOpen = '/loans';
  }
  
  // Open the app or focus existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If app is not open, open it
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync for sending notifications when online
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'send-notifications') {
    event.waitUntil(
      // Handle queued notifications
      sendQueuedNotifications()
    );
  }
});

async function sendQueuedNotifications() {
  // This would typically read from IndexedDB and send queued notifications
  console.log('Sending queued notifications...');
}
