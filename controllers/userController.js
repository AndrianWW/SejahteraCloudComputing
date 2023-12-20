const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const modelPredictions = require('../models/modelPredictions');

class UserController {
  async register(req, res) {
    const { nama, nip, email, password } = req.body;
    console.log('Received request body:', req.body);

    if (!nama || !nip || !email || !password) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
      const existingNIP = await userModel.findByNIP(nip);
      if (existingNIP) {
        return res.status(400).json({ error: 'Nomor induk pegawai sudah terdaftar' });
      }

      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await userModel.addUser({
        nama,
        nip,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY || 'default-secret-key');
      res.json({ message: 'Registrasi berhasil', userId, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
      const user = await userModel.findByEmail(email);

      if (!user) {
        return res.status(404).json({ error: 'Email tidak terdaftar' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ error: 'Password salah' });
      }

      const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET_KEY || 'default-secret-key');      
      res.json({ message: 'Login berhasil', userData: user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
  }

  async getProfile(req, res) {
    const userId = req.params.userId;
    try {
      const user = await userModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      res.json({ userData: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil profil' });
    }
  }

  async updateProfile(req, res) {
    const userId = req.params.userId; 
    const { nama, nip } = req.body;

    if (!nama || !nip) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
      const currentUser = await userModel.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      
      await userModel.updateUser(userId, {
        nama,
        nip,
      });

      res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil' });
    }
  }

  async makePrediction(req, res) {
    const modelName = req.params.modelName;
    const instances = req.body.instances;

    try {
      const predictions = await modelPredictions.predictModel(instances, modelName);

      res.json({ modelName, predictions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error making prediction' });
    }
  }
}

module.exports = new UserController();
