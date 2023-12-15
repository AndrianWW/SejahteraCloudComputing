const admin = require('firebase-admin');

class UserModel {
  constructor() {
    this.collection = admin.firestore().collection('users');
  }

  async findByNomorInduk(nomorInduk) {
    const query = await this.collection.where('nomor_induk', '==', nomorInduk).limit(1).get();
    return query.docs[0] ? query.docs[0].data() : null;
  }

  async findByEmail(email) {
    const query = await this.collection.where('email', '==', email).limit(1).get();
    return query.docs[0] ? query.docs[0].data() : null;
  }

  async addUser(user) {
    const newUser = await this.collection.add(user);
    return newUser.id;
  }
}

module.exports = new UserModel();
