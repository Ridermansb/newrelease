/* eslint-disable no-undef */

/**
 * @see https://developers.google.com/web/ilt/pwa/lab-integrating-web-push
 */

self.addEventListener('push', (event) => {
  const notificationData = event.data.json();

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
  event.notification.close();

  let clickResponsePromise = Promise.resolve();
  if (event.notification.data && event.notification.data.html_url) {
    clickResponsePromise = clients.openWindow(event.notification.data.html_url);
  }

  event.waitUntil(
    Promise.all([clickResponsePromise]),
  );
});
