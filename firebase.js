const admin = require('firebase-admin');

const serviceAccount = require('./sejahtera-capstone-project-firebase-adminsdk-s17ng-4277d4fbc9.json');
// const serviceAccount = require('./google-services.json');

// const firebaseConfig = {
//   apiKey: 'AIzaSyAuEO30fm7hQpgI7mYuLWObwaCsKv8g864',
//   authDomain: 'sejahtera-capstone-project.firebaseapp.com',
//   projectId: 'sejahtera-capstone-project',
//   storageBucket: 'sejahtera-capstone-project.appspot.com',
//   messagingSenderId: '977062649998',
//   appId: '1:977062649998:android:6f3647f68e638e40e7a9df',
// };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sejahtera-capstone-project.firebaseio.com',
});

const firebaseAuth = admin.auth();
const firestore = admin.firestore();

module.exports = { admin, firebaseAuth, firestore };

// const db = admin.firestore();
// const firebaseAuth = admin.auth();

// module.exports = { admin, db, firebaseAuth, firebaseConfig };
