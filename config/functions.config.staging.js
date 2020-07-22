var config = {
  client: {
    url: "https://staging-permissions.covidwatch.org/",
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
  verif_server: {
    url: "https://verification.covidwatch.org/",
    email: "john@covidwatch.org",
    key: "AIzaSyCQFrBAHQ1AJ5ayDYah7LPF-OgoUxqFZTs",
    password: process.env.VERIF_SERVER_PASSWORD,
  },
};

module.exports = config;
