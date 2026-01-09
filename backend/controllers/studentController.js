import Queue from "../models/Queue.js";
import Ticket from "../models/Ticket.js";
import Department from "../models/Department.js";
import { io } from "../server.js";

// ==============================
// STUDENT JOIN QUEUE
// ==============================
export const joinQueue = async (req, res) => {
  try {
    // 1️⃣ Only students
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    // 2️⃣ Validate department
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({ message: "Department not available" });
    }

    // 3️⃣ Find queue
    const queue = await Queue.findOne({ department: departmentId });
    if (!queue) {
      return res.status(400).json({ message: "Queue not found" });
    }

    // 🚫 Queue closed
    if (!queue.isOpen) {
      return res.status(400).json({ message: "Queue is currently closed" });
    }

    // 🚫 Same department duplicate check
    const existingTicket = await Ticket.findOne({
      user: req.user.id,
      queue: queue._id,
      status: { $in: ["waiting", "serving"] },
    });

    if (existingTicket) {
      return res.status(400).json({
        message: "You are already in this department queue",
      });
    }

    // 🚫 Queue limit check (SAFE)
    if (queue.maxTickets != null) {
      const activeCount = await Ticket.countDocuments({
        queue: queue._id,
        status: { $in: ["waiting", "serving"] },
      });

      if (activeCount >= queue.maxTickets) {
        return res.status(400).json({
          message: "Queue is full. Please try later.",
        });
      }
    }

    // 4️⃣ Count waiting tickets
    const waitingCount = await Ticket.countDocuments({
      queue: queue._id,
      status: "waiting",
    });

    // 5️⃣ Generate ticket number
    const ticketNumber = `A${String(waitingCount + 1).padStart(3, "0")}`;

    // 6️⃣ Create ticket
    const ticket = await Ticket.create({
      ticketNumber,
      queue: queue._id,
      user: req.user.id,
      source: "app",
      status: "waiting",
      isGuest: false,
    });

    // 🔔 Notify students in this department
    io.to(`department_${departmentId}`).emit("ticket_joined", {
      ticketNumber,
      position: waitingCount + 1,
    });

    // 7️⃣ Calculate ETA
    const eta = waitingCount * queue.averageServiceTime;

    // 🆕 AUTO-CLOSE QUEUE IF LIMIT REACHED (IMPORTANT FIX)
    if (queue.maxTickets != null) {
      const activeCountAfterJoin = await Ticket.countDocuments({
        queue: queue._id,
        status: { $in: ["waiting", "serving"] },
      });

      if (activeCountAfterJoin >= queue.maxTickets) {
        queue.isOpen = false;
        await queue.save();

        io.to(`department_${departmentId}`).emit("queue_status_changed", {
          isOpen: false,
        });
      }
    }

    // ✅ SEND RESPONSE LAST
    res.status(201).json({
      message: "Joined queue successfully",
      ticketNumber,
      position: waitingCount + 1,
      estimatedWaitTime: `${eta} minutes`,
      ticketId: ticket._id,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// GET ACTIVE DEPARTMENTS (STUDENT)
// ==============================
export const getActiveDepartments = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const departments = await Department.find({ isActive: true })
      .select("_id name description");

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// GET ACTIVE TICKET (STUDENT)
// ==============================
export const getMyActiveTicket = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const ticket = await Ticket.findOne({
      user: req.user.id,
      status: { $in: ["waiting", "serving"] },
    }).populate({
      path: "queue",
      populate: { path: "department", select: "name" },
    });

    if (!ticket) {
      return res.json(null);
    }

    res.json({
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      departmentId: ticket.queue.department._id,
      departmentName: ticket.queue.department.name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STUDENT CANCEL QUEUE
// ==============================
export const cancelQueue = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    const queue = await Queue.findOne({ department: departmentId });
    if (!queue) {
      return res.status(400).json({ message: "Queue not found" });
    }

    const ticket = await Ticket.findOne({
      user: req.user.id,
      queue: queue._id,
      status: { $in: ["waiting", "serving"] },
    });

    if (!ticket) {
      return res.status(400).json({
        message: "You are not in this queue",
      });
    }

    ticket.status = "no-show";
    ticket.servedAt = new Date();
    await ticket.save();

    if (
      queue.currentTicket &&
      queue.currentTicket.toString() === ticket._id.toString()
    ) {
      queue.currentTicket = null;
      await queue.save();
    }

    // 🔔 Notify department
    io.to(`department_${departmentId}`).emit("ticket_cancelled", {
      ticketNumber: ticket.ticketNumber,
    });

    res.json({
      message: "You have left the queue successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// STUDENT: TICKET HISTORY
// ==============================
export const getMyTicketHistory = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const tickets = await Ticket.find({
      user: req.user.id,
      status: { $in: ["completed", "no-show"] },
    })
      .populate({
        path: "queue",
        populate: {
          path: "department",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    res.json(
      tickets.map((t) => ({
        ticketNumber: t.ticketNumber,
        department: t.queue.department.name,
        status: t.status,
        joinedAt: t.createdAt,
        servedAt: t.servedAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
