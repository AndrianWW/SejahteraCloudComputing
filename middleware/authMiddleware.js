const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authorization.split('Bearer ')[1];

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY || 'default-secret-key');
    
    req.user = { userId: decodedToken.userId };
    
    next();
  } catch (error) {
    console.error(error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized: Token has expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    } else {
      return res.status(401).json({ error: 'Unauthorized: Authentication failed' });
    }
  }
};
