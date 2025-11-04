import jwt from 'jsonwebtoken';
const isAuthenticated = async (req, res, next) => {
  try {
    console.log('🔍 Checking authentication...');
    console.log('🍪 Cookies:', req.cookies);
    
    const token = req.cookies.token;

    if (!token) {
      console.log('❌ No token found');
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - Please login first" 
      });
    }

    console.log('✅ Token found, verifying...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    
    console.log('✅ User authenticated, ID:', decoded.id);
    
    next();
  } catch (error) {
    console.error("❌ Auth Error:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Unauthorized - Invalid token" 
    });
  }
};

export default isAuthenticated;