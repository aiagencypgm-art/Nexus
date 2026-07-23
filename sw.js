// NEXUS Service Worker v2
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){ e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function(e){
  var data = {};
  try{ data = e.data ? e.data.json() : {}; }catch(err){ data = {title:'NEXUS', body: e.data ? e.data.text() : ''}; }

  var options = {
    body: data.body || '',
    icon: '/Nexus/icon-192.png',
    badge: '/Nexus/icon-72.png',
    tag: data.tag || 'nexus-notif',
    data: data.data || {url:'/Nexus/'},
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false
  };

  e.waitUntil(self.registration.showNotification(data.title || 'NEXUS', options));
});

self.addEventListener('notificationclick', function(e){
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/Nexus/';
  e.waitUntil(
    self.clients.matchAll({type:'window', includeUncontrolled:true}).then(function(clients){
      for(var i=0;i<clients.length;i++){
        if(clients[i].url.includes('/Nexus/')&&'focus' in clients[i]) return clients[i].focus();
      }
      if(self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
