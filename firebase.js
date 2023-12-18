const admin = require('firebase-admin');

const serviceAccount = require('./sejahtera-capstone-project-firebase-adminsdk-s17ng-5ad53221b7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sejahtera-capstone-project.firebaseio.com',
});

module.exports = admin;
