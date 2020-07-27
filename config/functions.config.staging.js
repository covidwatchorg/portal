var config = {
  client: {
    url: "https://staging-permissions.covidwatch.org/",
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
  verification_server: {
    url: process.env.VERIFICATION_SERVER_URL,
    key: process.env.VERIFICATION_SERVER_API_KEY,
  },
};

module.exports = config;
