/* eslint-disable no-console */
const Weer = window.Weer;

console.log('Extension started.');
console.log('Weer is:', Weer);

Weer.installErrorReporter({
  toEmail: 'homerjsimpson@example.com',
  sendReportsInLanguages: ['en', 'ru'],
});

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
window.bar();
