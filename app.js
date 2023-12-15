const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const userRoutes = require('./routes/userRoute');

const app = express();

const serviceAccount = require('./sejahtera-capstone-project-firebase-adminsdk-s17ng-5ad53221b7.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sejahtera-capstone-project.firebaseio.com',
});

app.use(bodyParser.json());

app.use('/user', userRoutes);

const port = 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
