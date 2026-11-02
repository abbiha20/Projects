import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Check if header exists and starts with 'Bearer'
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use your secret
    req.user = decoded; // Attach user data to request
    next(); // Continue to controller
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};
