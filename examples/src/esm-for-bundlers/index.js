import * as Weer from 'weer';

console.log('Extension started.');
console.log('Weer is:', Weer);

Weer.Install();

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
