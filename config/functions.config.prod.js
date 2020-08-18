var config = {
  client: {
    url: "https://portal.covidwatch.org/",
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
  verification_server: {
    url: "test",
    key: process.env.VERIFICATION_SERVER_API_KEY,
  },
};

module.exports = config;
