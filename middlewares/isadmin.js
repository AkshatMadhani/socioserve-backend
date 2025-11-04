import jwt from "jsonwebtoken";
import User from "../models/user.js";

const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only"
      });
    }

    console.log("Admin access granted to:", user.email);
    req.user = user; 
    next();

  } catch (error) {
    console.error("Auth error:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default isAdmin;
