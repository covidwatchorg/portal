const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
// const morgan = require('morgan');
const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(express.json());

app.use('/build', express.static(path.join(__dirname, '../build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// const port = process.env.PORT;
app.listen(3000);
