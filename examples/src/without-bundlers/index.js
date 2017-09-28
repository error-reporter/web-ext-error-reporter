/* eslint-disable no-console, strict */

'use strict';

console.log('Extension started.');

window.Weer.install({
  sendReports: {
    toEmail: 'your@email.com',
    inLanguages: ['ru', 'en'],
  },
});

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
window.bar();
