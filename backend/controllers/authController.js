import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TokenBlacklist from "../models/TokenBlacklist.js";

// =======================
// SIGNUP
// =======================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    // 1. Validation
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: role || "student",
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// LOGIN
// =======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // 5. Check for stale queue if staff (Auto-close after 12h inactivity)
    if (user.role === 'staff' && user.department) {
       try {
         const queueModule = await import("../models/Queue.js");
         const Queue = queueModule.default;
         const queue = await Queue.findOne({ department: user.department });
         
         if (queue && queue.isOpen) {
            const lastUpdate = new Date(queue.updatedAt);
            const now = new Date();
            const hoursDiff = Math.abs(now - lastUpdate) / 36e5;
            
            if (hoursDiff > 12) {
               queue.isOpen = false;
               queue.emergencyActive = false;
               queue.currentTicket = null;
               await queue.save();
               console.log(`✅ Stale queue reset for staff ${user.email}`);
            }
         }
       } catch (err) {
         console.error("Queue reset error:", err);
       }
    }

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("🔴 LOGOUT TOKEN:", token); 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // --- NEW: Reset Queue on Logout ---
    const user = await User.findById(decoded.id);
    if (user && user.role === "staff" && user.department) {
       await import("../models/Queue.js").then(async (module) => {
         const Queue = module.default;
         const queue = await Queue.findOne({ department: user.department });
         if (queue) {
           queue.isOpen = false;
           queue.emergencyActive = false;
           queue.currentTicket = null;
           await queue.save();
           console.log(`✅ Queue reset for staff ${user.email}`);
         }
       });
    }
    // ----------------------------------

    await TokenBlacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    console.log("✅ TOKEN BLACKLISTED"); 

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ LOGOUT ERROR:", error.message);
    res.status(500).json({ message: "Logout failed" });
  }
};
