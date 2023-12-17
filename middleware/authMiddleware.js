const admin = require('firebase-admin');

module.exports = async function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authorization.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Menambahkan informasi pengguna ke objek request
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
