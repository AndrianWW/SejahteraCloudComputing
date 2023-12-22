const bcrypt = require('bcrypt');
const { admin } = require('../firebase');
const { firebaseAuth } = require('../firebase');
const userModel = require('../models/userModel');
const modelPredictions = require('../models/modelPredictions');
const { refreshToken } = require('firebase-admin/app');

class UserController {
  async register(req, res) {
    const { email, password, nama, nip, ...rest } = req.body;

    // Validasi input    
    if (!email || !password || !nama || !nip) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid' });
    }

    // Validasi panjang password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Panjang password minimal 8 karakter' });
    }

    try {
      // Check if nip is already registered
      const existingUserByNIP = await userModel.findByNIP(nip);
      if (existingUserByNIP) {
        return res.status(400).json({ error: 'NIP sudah terdaftar' });
      } 

      // Generate hash for the password
      const hashedPassword = await bcrypt.hash(password, 10); 

      // Create user in Firebase Authentication
      const userRecord = await firebaseAuth.createUser({
        email,
        password: hashedPassword,
        ...rest,
      });

      // Save additional user data to Firestore
      await userModel.addUser({
        userId: userRecord.uid,
        nama,
        nip,
        email,
        password: hashedPassword, // Save the hashed password to Firestore
        ...rest,
      });

      res.json({ message: 'Registrasi berhasil', userId: userRecord.uid });
    } catch (error) {
      console.error(error);

      // Handle authentication errors
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {     
      const userRecord = await firebaseAuth.getUserByEmail(email);

      // Validate the provided password
      // const isPasswordValid = await validatePassword(password, userRecord);

      // if (!isPasswordValid) {
      //   res.status(401).json({ error: 'password salah' });
      //   return;
      // }      

      // const passwordMatch = await bcrypt.compare(password, userRecord.password);

      // if (!passwordMatch) {
      //   return res.status(401).json({ error: 'Password salah' });
      // }

      // Sign in the user with email and password
      // const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, password);

      // Extract the user record from the userCredential
      // const userRecord = userCredential.user;

      // const token = await userRecord.getIdToken(refreshToken);
      // const idToken = await userRecord.getIdToken();
      res.json({ message: 'Login berhasil', userId: userRecord.uid });
      // res.json({ message: 'Login berhasil', userId: userRecord.uid, token });
    } catch (error) {
      console.error(error);

      // Handle authentication errors
      if (error.code === 'auth/user-not-found') {
        return res.status(401).json({ error: 'Email tidak terdaftar' });
      } else if (error.code === 'auth/invalid-email') {
        return res.status(401).json({ error: 'Format email salah' });
      } else if (error.code === 'auth/wrong-password') {
        return res.status(401).json({ error: 'Password salah' });
      }

      res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
  }

  async getProfile(req, res) {
    const userId = req.params.userId;

    try {
      const userProfile = await userModel.getProfile(userId);
      if (userProfile.error) {
        return res.status(404).json({ error: userProfile.error });
      }

      res.json({ message: 'User profile retrieved successfully', userProfile });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error getting user profile' });
    }
  }

  async updateProfile(req, res) {
    const userId = req.params.userId;
    const newData = req.body;

    // Validasi input
    if (!userId || typeof userId !== 'string' || Object.keys(newData).length === 0) {
      return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
      const updateResult = await userModel.updateProfile(userId, newData);
      if (updateResult.error) {
        return res.status(400).json({ error: updateResult.error });
      }

      res.json({ message: 'User profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user profile' });
    }
  }

  async makePrediction(req, res) {
    const modelName = req.params.modelName;
    const instances = req.body.instances;

    // Logging token
    const token = req.headers.authorization;
    console.log('Bearer Token:', token);


    try {
      // Mendapatkan token dari header permintaan
      const token = req.headers.authorization.split('Bearer ')[1];

      const predictions = await modelPredictions.predictModel(instances, modelName, token);

      res.json({
        modelName,
        predictions,
        message: 'Prediction successful',
      });
    } catch (error) {
      console.error(error);

      if (error.response) {
        // Jika terdapat respons dari server
        const { status, data } = error.response;
        res.status(status).json({
          error: `server Error making prediction: ${data.error || data}`,
        });
      } else if (error.request) {
        // Jika permintaan dilakukan tetapi tidak ada respons dari server
        res.status(500).json({
          error: 'Error making prediction: No response received from the server',
        });
      } else {
        // Jika terjadi kesalahan lainnya
        res.status(500).json({
          error: `Error making prediction: ${error.message}`,
        });
      }
    }
  }

  // async makePrediction(req, res) {
  //   const { modelName } = req.params;
  //   const { data } = req.body;

  //   try {
  //     const accessToken = await getAccessToken();

  //     // Ganti URL model dengan URL model yang sesuai
  //     const modelUrls = {
  //       bpnt_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/bpnt_model:predict',
  //       bpum_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/bpum_model:predict',
  //       bst_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/bst_model:predict',
  //       kur_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/kur_model:predict',
  //       pkh_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/pkh_model:predict',
  //       prakerja_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/prakerja_model:predict',
  //       sembako_model: 'https://asia-southeast2-ml.googleapis.com/v1/projects/sejahtera-capstone-project/models/sembako_model:predict',
  //     };

  //     const modelUrl = modelUrls[modelName];

  //     if (!modelUrl) {
  //       return res.status(400).json({ error: 'Model not found' });
  //     }

  //     const response = await axios.post(
  //       modelUrl,
  //       {
  //         instances: [data],
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${accessToken}`,
  //         },
  //       }
  //     );

  //     const predictions = response.data.predictions;
  //     res.json({ modelName, predictions });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'Error making predictions' });
  //   }
  // }
}

module.exports = new UserController();