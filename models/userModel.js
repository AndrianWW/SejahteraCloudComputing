const admin = require('firebase-admin');

class UserModel {
  constructor() {
    this.collection = admin.firestore().collection('users');
  }

  async findByNIP(NIP) {
    const query = await this.collection.where('nip', '==', NIP).limit(1).get();
    return query.docs[0] ? query.docs[0].data() : null;
  }

  async findByEmail(email) {
    const query = await this.collection.where('email', '==', email).limit(1).get();
    return query.docs[0] ? query.docs[0].data() : null;
  }
  
  async getUserById(userId) {
    const document = await this.collection.doc(userId).get();
    return document.exists ? document.data() : null;
  }

  async updateUser(userId, newData) {
    await this.collection.doc(userId).update(newData);
  }

  async addUser(user) {
    const newUser = await this.collection.add(user);
    return newUser.id;
  }
}

module.exports = new UserModel();
