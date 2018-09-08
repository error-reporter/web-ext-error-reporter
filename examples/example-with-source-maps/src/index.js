window.Weer.addGlobalHandler((errorType, errorEvent) => {

  console.log('Global handler caught:', errorType, errorEvent);
  window.lastErrorEvent = errorEvent;
});

window.Weer.installErrorReporter({
  toEmail: 'ilyaigpetrov+weer-test@gmail.com',
  sendReportsInLanguages: ['ru'],
});

console.log('Extension started.');

window.bar = function foo() {
  throw new Error('Err in BG');
};

console.log('Throwing error from bg! Notification is expected.');
window.bar();
