import Emergency from "../models/Emergency.js";
import Queue from "../models/Queue.js";
import User from "../models/User.js";
import { io } from "../server.js";

/* ==============================
   GET PENDING EMERGENCIES (OPTIONAL)
============================== */
export const getPendingEmergencies = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff?.department) {
      return res.status(400).json({ message: "Staff not assigned" });
    }

    const emergencies = await Emergency.find({
      department: staff.department,
      status: "pending",
    }).populate("student", "name email");

    res.json(emergencies);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch emergencies" });
  }
};


/* ==============================
   🚨 START EMERGENCY (STAFF)
============================== */
export const startEmergency = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const { emergencyId, note } = req.body;

    const staff = await User.findById(req.user.id);
    if (!staff?.department) {
      return res.status(400).json({ message: "Staff not assigned to department" });
    }

    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({ department: departmentId });
    if (!queue) return res.status(404).json({ message: "Queue not found" });

    if (queue.emergencyActive) {
      return res.status(409).json({ message: "Emergency already active" });
    }

    // 👉 PICK SPECIFIC OR NEXT PENDING EMERGENCY
    let emergency;
    if (emergencyId) {
       emergency = await Emergency.findOne({ _id: emergencyId, department: departmentId, status: "approved" });
       if (!emergency) return res.status(404).json({ message: "Specified emergency not found" });
    } else {
       emergency = await Emergency.findOne({
          department: departmentId,
          status: "approved",
       }).sort({ createdAt: 1 });
    }

    if (!emergency) {
      return res.status(404).json({
        message: "No approved emergencies available",
      });
    }

    emergency.status = "active";
    await emergency.save();

    queue.emergencyActive = true;
    queue.emergencyReason = note || "Emergency in progress";
    await queue.save();

    // 🔔 DEPARTMENT NOTIFY
    io.to(`department_${departmentId}`).emit("emergency_started", {
      studentId: emergency.student.toString(),
      note: queue.emergencyReason,
    });

    // 🔔 STUDENT-SPECIFIC NOTIFY
    io.to(`user_${emergency.student}`).emit("emergency_your_turn");

    res.json({ message: "Emergency started", emergencyId: emergency._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to start emergency" });
  }
};


/* ==============================
   ✅ END EMERGENCY (STAFF)
============================== */
export const endEmergency = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff?.department) {
      return res.status(400).json({ message: "Staff not assigned to department" });
    }

    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({ department: departmentId });
    if (!queue || !queue.emergencyActive) {
      return res.status(400).json({ message: "No active emergency" });
    }

    // 👉 FIND ACTIVE EMERGENCY
    const emergency = await Emergency.findOne({
      department: departmentId,
      status: "active",
    });

    if (!emergency) {
      return res.status(404).json({ message: "Active emergency not found" });
    }

    emergency.status = "resolved";
    await emergency.save();

    queue.emergencyActive = false;
    await queue.save();

    // 🔔 STUDENT CONFIRMATION
    io.to(`user_${emergency.student}`).emit("emergency_served");

    // 🔔 DEPARTMENT UPDATE
    io.to(`department_${departmentId}`).emit("emergency_ended");

    res.json({ message: "Emergency resolved" });
  } catch (error) {
    console.error("End emergency error:", error);
    res.status(500).json({ message: "Failed to resolve emergency" });
  }
};


/* ==============================
   🚨 REQUEST EMERGENCY (STUDENT)
============================== */

/* ==============================
   🚨 GET PENDING EMERGENCY COUNT (STAFF)
============================== */
export const getPendingEmergencyCount = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res
        .status(400)
        .json({ message: "Staff not assigned to department" });
    }

    const count = await Emergency.countDocuments({
      department: staff.department,
      status: "pending",
    });

    res.json({ count });
  } catch (error) {
    console.error("Get emergency count error:", error);
    res.status(500).json({ message: "Failed to fetch emergency count" });
  }
};

export const getEmergencyStatus = async (req, res) => {
  try {
    const { departmentId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ message: "Department required" });
    }

    const queue = await Queue.findOne({ department: departmentId });

    res.json({
      active: queue?.emergencyActive || false,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to check emergency status" });
  }
};


export const requestEmergency = async (req, res) => {
  try {
    console.log("🚨 Emergency Request Received:");
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const { departmentId, reason } = req.body;

    if (!req.file) {
      console.log("❌ No proof file uploaded");
      return res.status(400).json({ message: "Proof image required" });
    }

    if (!departmentId || !reason) {
        console.log("❌ Missing fields");
        return res.status(400).json({ message: "Department and reason required" });
    }

    const emergency = await Emergency.create({
      department: departmentId,
      student: req.user.id,
      reason,
      proof: `/uploads/emergency_proofs/${req.file.filename}`,
      status: "pending",
    });

    console.log("✅ Emergency created:", emergency._id);

    // notify staff via socket
    io.to(`department_${departmentId}`).emit("emergency_requested", {
      emergencyId: emergency._id,
      reason,
      proof: emergency.proof,
    });

    res.json({ message: "Emergency request sent" });
  } catch (err) {
    console.error("❌ Emergency request error:", err);
    res.status(500).json({ message: "Emergency request failed", error: err.message });
  }
};



export const rejectEmergency = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const { emergencyId } = req.params;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    // ✅ status guard
    if (emergency.status !== "pending") {
      return res.status(400).json({
        message: `Cannot modify emergency in '${emergency.status}' state`,
      });
    }

    emergency.status = "rejected";
    await emergency.save();

    // 🔔 notify student
    io.to(`user_${emergency.student}`).emit("emergency_rejected");

    res.json({ message: "Emergency rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reject emergency" });
  }
};

export const approveEmergency = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const { emergencyId } = req.params;

    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    // ✅ status guard
    if (emergency.status !== "pending") {
      return res.status(400).json({
        message: `Cannot modify emergency in '${emergency.status}' state`,
      });
    }

    emergency.status = "approved";
    await emergency.save();

    // 🔔 notify student
    io.to(`user_${emergency.student}`).emit("emergency_approved");

    res.json({ message: "Emergency approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to approve emergency" });
  }
};
