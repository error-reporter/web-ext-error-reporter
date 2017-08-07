import Weer from '../dist/esm';

console.log('Extension started.');
console.log('Weer is:', Weer);

Weer.install({
  sendReportsToEmail: 'your@email.com',
});

window.Weer = Weer;

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
