import Queue from "../models/Queue.js";
import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import { io } from "../server.js";
import QRCode from "qrcode";
import { getCrowdStatusByDepartment } from "../services/crowdStatus.service.js";
import crypto from "crypto";
import StaffQr from "../models/StaffQr.js";



// ==============================
// GET STAFF PROFILE
// ==============================
export const getStaffProfile = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }
 
    const staff = await User.findById(req.user.id)
      .populate("department", "name description");

    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STAFF CALL NEXT TICKET
// ==============================
export const callNextTicket = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({
        message: "Staff not assigned to any department",
      });
    }

    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({
      department: departmentId,
      isOpen: true,
    });

    if (!queue) {
      return res.status(400).json({ message: "Queue is closed" });
    }

    const nextTicket = await Ticket.findOne({
      queue: queue._id,
      status: "waiting",
    }).sort({ createdAt: 1 });

    if (!nextTicket) {
      return res.status(400).json({ message: "No tickets in queue" });
    }

    // 1️⃣ Update ticket
    nextTicket.status = "serving";
    await nextTicket.save();

    // 2️⃣ Update queue
    queue.currentTicket = nextTicket._id;
    await queue.save();

    // 3️⃣ Emit ticket called
    io.to(`department_${departmentId}`).emit("ticket_called", {
      ticketNumber: nextTicket.ticketNumber,
    });

    // 4️⃣ Emit UPDATED crowd status (✅ CORRECT PLACE)
    const crowdStatus = await getCrowdStatusByDepartment(departmentId);

    io.to(`department_${departmentId}`).emit("queue_crowd_updated", {
      departmentId,
      ...crowdStatus,
    });

    res.json({
      message: "Now serving",
      ticketNumber: nextTicket.ticketNumber,
      ticketId: nextTicket._id,
    });
  } catch (error) {
    console.error("Call next ticket error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STAFF COMPLETE CURRENT TICKET
// ==============================
export const completeTicket = async (req, res) => {
  try {
    // 🔐 Role check
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    // 👤 Get staff & department
    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({
        message: "Staff not assigned to any department",
      });
    }

    const departmentId = staff.department.toString();

    // 🎯 Find queue for department
    const queue = await Queue.findOne({ department: departmentId });

    if (!queue || !queue.currentTicket) {
      return res.status(400).json({
        message: "No active ticket to complete",
      });
    }

    // 🎟️ Find current ticket
    const ticket = await Ticket.findById(queue.currentTicket);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Complete ticket
    ticket.status = "completed";
    ticket.servedAt = new Date();
    await ticket.save();

    // 🔄 Clear current ticket from queue
    queue.currentTicket = null;
    await queue.save();

    // 📢 Emit ticket completed event
    io.to(`department_${departmentId}`).emit("ticket_completed", {
      ticketNumber: ticket.ticketNumber,
    });

    // 🚦 Emit UPDATED crowd status (🔥 VERY IMPORTANT)
    const crowdStatus = await getCrowdStatusByDepartment(departmentId);

    io.to(`department_${departmentId}`).emit("queue_crowd_updated", {
      departmentId,
      ...crowdStatus,
    });

    // ✅ Final response
    res.json({
      message: "Ticket completed successfully",
      ticketNumber: ticket.ticketNumber,
    });
  } catch (error) {
    console.error("Complete ticket error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STAFF TOGGLE QUEUE STATUS
// ==============================
export const toggleQueueStatus = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({ message: "Staff not assigned" });
    }

    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({ department: departmentId });
    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    queue.isOpen = !queue.isOpen;
    await queue.save();

    io.to(`department_${departmentId}`).emit("queue_status_changed", {
      isOpen: queue.isOpen,
    });

    res.json({
      message: `Queue ${queue.isOpen ? "opened" : "closed"}`,
      isOpen: queue.isOpen,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// SET QUEUE LIMIT
// ==============================
export const setQueueLimit = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const { maxTickets } = req.body;

    const staff = await User.findById(req.user.id);
    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({ department: departmentId });

    queue.maxTickets = maxTickets;
    await queue.save();

    io.to(`department_${departmentId}`).emit("queue_limit_updated", {
      maxTickets,
    });

    res.json({
      message: "Queue limit updated",
      maxTickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STAFF INCREASE QUEUE LIMIT
// ==============================
export const increaseQueueLimit = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const { increaseBy } = req.body;

    if (!increaseBy || increaseBy <= 0) {
      return res.status(400).json({ message: "Invalid increase value" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({
        message: "Staff not assigned to department",
      });
    }

    const departmentId = staff.department.toString();

    const queue = await Queue.findOne({
      department: departmentId,
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    queue.maxTickets =
      queue.maxTickets === null ? increaseBy : queue.maxTickets + increaseBy;

    queue.isOpen = true;
    await queue.save();

    io.to(`department_${departmentId}`).emit("queue_status_changed", {
      isOpen: true,
      maxTickets: queue.maxTickets,
    });

    res.json({
      message: "Queue limit increased",
      maxTickets: queue.maxTickets,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ===============================
// GENERATE QR FOR STAFF DEPARTMENT
// ===============================
export const generateDepartmentQR = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({
        message: "Staff is not assigned to any department",
      });
    }

    const departmentId = staff.department.toString();
    console.log("🧑‍💼 STAFF DEPARTMENT:", departmentId);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    console.log("🕒 NOW:", new Date());
    console.log("⏰ QR VALID TILL:", endOfToday);

    let staffQr = await StaffQr.findOne({
      department: departmentId,
      isActive: true,
      validDate: { $gte: new Date() },
    });

    console.log("🔍 EXISTING STAFF QR:", staffQr);

    if (!staffQr) {
      staffQr = await StaffQr.create({
        department: departmentId,
        qrId: crypto.randomUUID(),
        validDate: endOfToday,
        isActive: true,
      });

      console.log("🆕 NEW STAFF QR CREATED:", staffQr);
    }

    const joinUrl = `${process.env.FRONTEND_BASE_URL}/#/guest/entry/${staffQr.qrId}`;
    console.log("🔗 FINAL QR ID:", staffQr.qrId);
    console.log("🌐 JOIN URL:", joinUrl);

    const qrCode = await QRCode.toDataURL(joinUrl);

    res.json({
      qrId: staffQr.qrId,
      joinUrl,
      qrCode,
      validTill: staffQr.validDate,
    });
  } catch (error) {
    console.error("Staff QR error:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// ==============================
// STAFF QUEUE STATS
// ==============================
export const getQueueStats = async (req, res) => {
  try {
    if (req.user.role !== "staff") {
      return res.status(403).json({ message: "Staff only" });
    }

    const staff = await User.findById(req.user.id);
    if (!staff || !staff.department) {
      return res.status(400).json({
        message: "Staff not assigned to any department",
      });
    }

    const queue = await Queue.findOne({
      department: staff.department,
    });

    if (!queue) {
      return res.status(404).json({ message: "Queue not found" });
    }

    const total = await Ticket.countDocuments({
      queue: queue._id,
    });

    const served = await Ticket.countDocuments({
      queue: queue._id,
      status: "completed",
    });

    const remaining = await Ticket.countDocuments({
      queue: queue._id,
      status: { $in: ["waiting", "serving"] },
    });

    res.json({
      total,
      served,
      remaining,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
