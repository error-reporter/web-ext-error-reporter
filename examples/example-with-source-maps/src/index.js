window.Weer.addGlobalHandler((errorType, errorEvent) => {

  console.log('Global handler caught:', errorType, errorEvent);
  window.lastErrorEvent = errorEvent;
});

window.Weer.installErrorSubmissionHandler(
  async (...args) => {

    console.log('RECEIVED SUBMISSION:', ...args);
    // throw new Error('BOOM');
  },
);

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
