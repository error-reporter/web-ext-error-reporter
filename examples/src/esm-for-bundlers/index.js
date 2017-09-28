/* eslint-disable no-console */
// There is no "dist" folder in Travis:
import Weer from '../../../dist/esm'; // eslint-disable-line

console.log('Extension started.');
console.log('Weer is:', Weer);

Weer.install({
  sendReports: {
    toEmail: 'your@email.com',
    inLanguages: ['ru', 'en'],
  },
});

window.Weer = Weer;

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
window.bar();
