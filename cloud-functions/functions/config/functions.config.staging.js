var config = {
  client: {
    url: 'https://staging-portal.covidwatch.org/',
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
  verification_server: {
    url: 'https://dev.adminapi.verification.covidwatch.org',
    key: process.env.VERIFICATION_SERVER_API_KEY,
  },
};

module.exports = config;
