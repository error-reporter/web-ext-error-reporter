import Weer from 'weer';

console.log('Extension started.');
console.log('Weer is:', Weer);

Weer.Install(
/*
{
  errorReportingUrl: 'https://example.com/foo?title={{message}}&json={{json}}',
  extErrorIconUrl: 'https://example.com/img/ext-error-128.png',
  pacErrorIconUrl: 'https://example.com/img/pac-error-128.png',
  maskIconUrl: 'https://example.com/img/mask-128.png',
}
*/
);
window.Weer = Weer;

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
