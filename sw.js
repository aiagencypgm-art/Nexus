// NEXUS Service Worker
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

// Handle incoming push notifications from server
self.addEventListener('push', function(e){
  if(!e.data) return;
  var data;
  try{ data = e.data.json(); }
  catch(err){ data = {title:'NEXUS', body: e.data.text()}; }

  e.waitUntil(
    self.registration.showNotification(data.title||'NEXUS', {
      body: data.body || '',
      icon: '/Nexus/icon-192.png',
      badge: '/Nexus/icon-72.png',
      tag: data.tag || 'nexus',
      data: data.data || {},
      vibrate: [100,50,100],
      requireInteraction: false
    })
  );
});

// Handle notification click — open the app
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/Nexus/';
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clients){
      for(var i=0;i<clients.length;i++){
        if(clients[i].url.includes('/Nexus/')&&'focus' in clients[i]){
          return clients[i].focus();
        }
      }
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
