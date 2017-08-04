'use strict';

console.log('Extension started.');

Weer.install(
/*
{
  errorReportingUrl: 'https://example.com/foo?title={{message}}&json={{json}}',
  extErrorIconUrl: 'https://example.com/img/ext-error-128.png',
  pacErrorIconUrl: 'https://example.com/img/pac-error-128.png',
  maskIconUrl: 'https://example.com/img/mask-128.png',
}
*/
);

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
bar();
