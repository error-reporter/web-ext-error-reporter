/* eslint-disable no-console, strict */
'use strict';

window.Weer.addGlobalHandler((errorType, errorEvent) => {
  console.log('Global handler caught:', errorType, errorEvent);
});

window.Weer.installErrorReporter({
  toEmail: 'ilyaigpetrov+weer-test@gmail.com',
  reportLangs: ['ru'],
});

console.log('Extension started.');

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
window.bar();
