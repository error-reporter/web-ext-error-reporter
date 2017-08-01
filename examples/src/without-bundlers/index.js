'use strict';

console.log('Extension started.');

Weer.Install();

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
