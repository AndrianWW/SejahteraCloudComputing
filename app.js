const express = require('express');
const bodyParser = require('body-parser');
const admin = require('./firebase');
const userRoutes = require('./routes/userRoute');

const app = express();

app.use(bodyParser.json());

app.use('/user', userRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
