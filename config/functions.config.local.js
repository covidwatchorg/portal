var config = {
  client: {
    url: "http://localhost:3000/",
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
