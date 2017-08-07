'use strict';

console.log('Extension started.');

Weer.install({
  sendReportsToEmail: 'your@email.com',
});

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
