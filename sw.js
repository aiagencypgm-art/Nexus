// NEXUS Service Worker — Background Notifications
const SB = 'https://wusqkenwwxaglpifrhtf.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c3FrZW53d3hhZ2xwaWZyaHRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjE4NjYsImV4cCI6MjA5Nzc5Nzg2Nn0.PrzYWg_us2r4tnDE0bx6YrorcbrALUVI1-EnPhnjrlA';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(self.clients.claim());
});

// Check notifications periodically using sync (when supported) or fetch
self.addEventListener('periodicsync', function(e){
  if(e.tag === 'nexus-notifs'){
    e.waitUntil(checkAndNotify());
  }
});

// Also handle messages from the main app
self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'CHECK_NOTIFS'){
    checkAndNotify(e.data.userId, e.data.token);
  }
  if(e.data && e.data.type === 'STORE_SESSION'){
    // Store session for background checks
    self.userId = e.data.userId;
    self.token = e.data.token;
  }
});

async function checkAndNotify(userId, token){
  var uid = userId || self.userId;
  var tok = token || self.token;
  if(!uid || !tok) return;

  try{
    var r = await fetch(SB+'/rest/v1/notifications?to_user_id=eq.'+uid+'&read=eq.false&select=*&order=created_at.desc&limit=5', {
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer '+tok
      }
    });

    if(!r.ok) return;
    var notifs = await r.json();
    if(!notifs || !notifs.length) return;

    for(var i=0; i<notifs.length; i++){
      var n = notifs[i];
      var icons = {mission_complete:'⚡',xp_overtake:'👑',level_up:'🚀'};
      var icon = icons[n.type] || '🔔';

      await self.registration.showNotification('NEXUS', {
        body: n.message,
        icon: '/Nexus/icon-192.png',
        badge: '/Nexus/icon-72.png',
        tag: n.id,
        data: { url: '/Nexus/', notifId: n.id },
        vibrate: [100, 50, 100],
        requireInteraction: false
      });

      // Mark as read
      await fetch(SB+'/rest/v1/notifications?id=eq.'+n.id, {
        method: 'PATCH',
        headers: {
          'apikey': KEY,
          'Authorization': 'Bearer '+tok,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({read: true})
      });
    }
  } catch(e){
    console.log('SW notif check error:', e);
  }
}

// Handle notification click — open the app
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/Nexus/';
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clients){
      for(var i=0; i<clients.length; i++){
        if(clients[i].url.includes('/Nexus/') && 'focus' in clients[i]){
          return clients[i].focus();
        }
      }
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
