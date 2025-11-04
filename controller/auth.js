import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const register = async (req, res) => {
  try {
    const { username, email, password, flatno, role } = req.body;

    if (!username || !email || !password || !flatno) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      flatno,
      role: role || "resident"
    });

    await newUser.save();

    console.log('✅ User registered:', email);
    return res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    console.log('✅ Token created for user:', user._id);
    console.log('🍪 Setting cookie with token...');
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, 
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000
    });

    console.log('✅ Login successful for:', email, 'Role:', user.role);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token, 
      role: user.role,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        flatno: user.flatno,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  try {
    console.log('👋 Logout request received');
    res.clearCookie("token");
    console.log('✅ Cookie cleared');
    return res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ✅ Make sure this function exists!
const getCurrentUser = async (req, res) => {
  try {
    console.log('👤 Get current user request, User ID:', req.user?.id);
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('❌ User not found for ID:', req.user.id);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log('✅ User found:', user.email);

    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        flatno: user.flatno,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

export { register, login, logout, getCurrentUser };