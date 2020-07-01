var config = {
    "client": {
        "url": "http://localhost:8080/"
    },
    "sendgrid": {
        "key": process.env.SENDGRID_API_KEY
    },
    "verif_server": {
        "url": "**url**",
        "email": "**email**",
        "password": process.env.VERIF_SERVER_PASSWORD,
        "key": process.env.VERIF_SEVER_FIREBASE_API_KEY
    }
}

module.exports = config
