// const admin = require('firebase-admin');
const { admin } = require('../firebase');

class UserModel {
  constructor() {
    this.auth = admin.auth();
    this.db = admin.firestore();
  }

  async findByNIP(NIP) {
    const query = await this.db.collection('users').where('nip', '==', NIP).limit(1).get();
    return query.docs[0] ? query.docs[0].data() : null;
  }

  // async findByEmail(email) {
  //   try {
  //     const userRecord = await this.auth.getUserByEmail(email);
  //     return userRecord.toJSON();
  //   } catch (error) {
  //     if (error.code === 'auth/user-not-found') {
  //       return { error: 'User not found' };
  //     } else {
  //       console.error(error);
  //       return { error: 'Error finding user by email' };
  //     }
  //   }
  // }

  
  // async findByNIP(nip) {
  //   try {
  //     // Gunakan Firestore untuk memeriksa apakah NIP sudah terdaftar
  //     const query = await this.db.collection('users').where('nip', '==', nip).limit(1).get();
  //     return query.docs[0] ? query.docs[0].data() : null;
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error('Error finding user by NIP');
  //   }
  // }

  async getUserById(userId) {
    try {
      const userRecord = await this.auth.getUser(userId);
      return userRecord.toJSON();
    } catch (error) {
      return null;
    }
  }

  async updateUser(userId, newData) {
    try {
      await this.auth.updateUser(userId, newData);
    } catch (error) {
      console.error(error);
      throw new Error('Error updating user');
    }
  }

  async getProfile(userId) {
    try {
      // Dapatkan data profil pengguna dari Firestore
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data();
      } else {
        return { error: 'User profile not found' };
      }
    } catch (error) {
      console.error(error);
      return { error: 'Error getting user profile' };
    }
  }

  async updateProfile(userId, newData) {
    try {
      // Perbarui data pengguna di Firestore
      await this.db.collection('users').doc(userId).update(newData);

      // Perbarui custom claims (jika diperlukan) di Firebase Authentication
      if (newData.customClaims) {
        await this.auth.setCustomUserClaims(userId, newData.customClaims);
      }

      return { message: 'User profile updated successfully' };
    } catch (error) {
      console.error(error);
      return { error: 'Error updating user profile' };
    }
  }

  async addUser(user) {
    const newUser = await this.db.collection('users').add(user);
    return newUser.id;
  }  

  // async addUser(userData) {
  //   const { email, password, nama, nip, ...rest } = userData;

  //   try {
  //     // Create user in Firebase Authentication
  //     const userRecord = await this.auth.createUser({
  //       email,
  //       password,
  //       ...rest,
  //     });

  //     // Save additional user data to Firestore
  //     await this.db.collection('users').doc(userRecord.uid).set({
  //       userId: userRecord.uid,
  //       nama,
  //       nip,
  //       email,
  //       ...rest,
  //     });

  //     return userRecord.uid;
  //   } catch (error) {
  //     console.error(error);
  //     throw new Error('Error creating user');
  //   }
  // }
}

module.exports = new UserModel();
