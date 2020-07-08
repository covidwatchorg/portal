var config = {
  client: {
    url: "http://localhost:3000/",
  },
  sendgrid: {
    key: process.env.SENDGRID_API_KEY,
  },
  verif_server: {
    url: "**url**",
    email: "**email**",
    key: "**key**",
    password: process.env.VERIF_SERVER_PASSWORD,
  },
};

module.exports = config;
