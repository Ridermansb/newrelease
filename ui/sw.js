/* eslint-disable no-undef */

/**
 * @see https://developers.google.com/web/ilt/pwa/lab-integrating-web-push
 */

self.addEventListener('push', (event) => {
  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (e) {
    notificationData = {
      title: 'Default title',
      body: 'Default message',
      icon: '/favicon.png',
    };
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      tag: notificationData.tag,
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
    type: 'window',
  // eslint-disable-next-line consistent-return
  }).then((clientList) => {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url === '/' && 'focus' in client) {
        return client.focus();
      }
    }
    if (clients.openWindow) {
      return clients.openWindow('/');
    }
  }));
});
