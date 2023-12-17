const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

class UserController {
  async register(req, res) {
    const { nama, nomor_induk, email, password } = req.body;

    if (!nama || !nomor_induk || !email || !password) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
      const existingNomorInduk = await userModel.findByNomorInduk(nomor_induk);
      if (existingNomorInduk) {
        return res.status(400).json({ error: 'Nomor induk sudah terdaftar' });
      }

      const existingEmail = await userModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await userModel.addUser({
        nama,
        nomor_induk,
        email,
        password: hashedPassword,
      });

      res.json({ message: 'Registrasi berhasil', userId });
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

      res.json({ message: 'Login berhasil', userData: user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat login' });
    }
  }

  async getProfile(req, res) {
    const userId = req.userId;

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
    const userId = req.userId; 
    const { nama, nomor_induk } = req.body;

    if (!nama || !nomor_induk) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    try {
      const currentUser = await userModel.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({ error: 'User tidak ditemukan' });
      }

      
      await userModel.updateUser(userId, {
        nama,
        nomor_induk,
      });

      res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui profil' });
    }
  }
}

module.exports = new UserController();
