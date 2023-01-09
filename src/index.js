const router = require('./router');
const express = require('express');

const app = express();

app.use(express.json());

app.use(router);

app.listen(3000);