import crypto from "crypto";
import Department from "../models/Department.js";
import Queue from "../models/Queue.js";
import Ticket from "../models/Ticket.js";
import { io } from "../server.js";

// ===============================
// GUEST JOIN QUEUE (QR BASED)
// ===============================
export const guestJoinQueue = async (req, res) => {
  try {
    const { departmentId, name = "", phone = "" } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department ID is required" });
    }

    // 1️⃣ Validate department
    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({ message: "Department not available" });
    }

    // 2️⃣ Find queue
    const queue = await Queue.findOne({ department: departmentId });
    if (!queue) {
      return res.status(400).json({ message: "Queue not found" });
    }

    // 🚫 Queue closed
    if (!queue.isOpen) {
      return res.status(400).json({ message: "Queue is currently closed" });
    }

    // 3️⃣ Identify guest (device-based)
    let guestToken = req.headers["x-guest-token"];

    if (!guestToken) {
      guestToken = crypto.randomUUID();
    }

    // 🚫 ONE GUEST → ONE ACTIVE TICKET (ANY DEPARTMENT)
    // Block if ANY non-completed ticket exists
    const existingTicket = await Ticket.findOne({
      guestToken,
      status: { $ne: "completed" },
    }).sort({ createdAt: -1 });

    if (existingTicket) {
      return res.status(400).json({
        message: "You already have an active ticket",
      });
    }

    // 🚫 Queue limit check
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
      user: null,
      isGuest: true,
      guestToken,
      guestInfo: {
        name,
        phone,
      },
      source: "qr",
      status: "waiting",
    });

    // 🔔 Notify department room
    io.to(`department_${departmentId}`).emit("ticket_joined", {
      ticketNumber,
      position: waitingCount + 1,
    });

    // 7️⃣ ETA
    const eta = waitingCount * queue.averageServiceTime;

    // 🆕 AUTO-CLOSE QUEUE IF LIMIT REACHED
    if (queue.maxTickets != null) {
      const activeAfterJoin = await Ticket.countDocuments({
        queue: queue._id,
        status: { $in: ["waiting", "serving"] },
      });

      if (activeAfterJoin >= queue.maxTickets) {
        queue.isOpen = false;
        await queue.save();

        io.to(`department_${departmentId}`).emit("queue_status_changed", {
          isOpen: false,
        });
      }
    }

    // ✅ RESPONSE
    res.status(201).json({
      message: "Joined queue successfully",
      ticketNumber,
      position: waitingCount + 1,
      estimatedWaitTime: `${eta} minutes`,
      ticketId: ticket._id,
      guestToken, // client must store this
    });

  } catch (error) {
    console.error("Guest join error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

 
// ===============================
// GUEST CANCEL TICKET
// ===============================
export const guestCancelTicket = async (req, res) => {
  try {
    const guestToken = req.headers["x-guest-token"];

    if (!guestToken) {
      return res.status(400).json({ message: "Guest token is required" });
    }

    // 1️⃣ Find active guest ticket
    const ticket = await Ticket.findOne({
      guestToken,
      status: { $in: ["waiting", "serving"] },
    }).populate("queue");

    if (!ticket) {
      return res.status(404).json({
        message: "No active ticket found to cancel",
      });
    }

    // 2️⃣ Mark ticket as completed
    ticket.status = "completed";
    ticket.servedAt = new Date();
    await ticket.save();

    // 3️⃣ Re-open queue if it was closed due to limit
    const queue = await Queue.findById(ticket.queue._id);

    if (queue && !queue.isOpen) {
      queue.isOpen = true;
      await queue.save();

      io.to(`department_${queue.department}`).emit("queue_status_changed", {
        isOpen: true,
      });
    }

    // 4️⃣ Notify department room
    io.to(`department_${queue.department}`).emit("ticket_cancelled", {
      ticketNumber: ticket.ticketNumber,
    });

    // 5️⃣ Response
    res.json({
      message: "Ticket cancelled successfully",
      ticketNumber: ticket.ticketNumber,
    });

  } catch (error) {
    console.error("Guest cancel error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// GUEST RESTORE ACTIVE TICKET
// ===============================
export const guestRestoreTicket = async (req, res) => {
  try {
    const guestToken = req.headers["x-guest-token"];

    if (!guestToken) {
      return res.status(400).json({ message: "Guest token is required" });
    }

    // 1️⃣ Find active guest ticket (not completed)
    const ticket = await Ticket.findOne({
      guestToken,
      status: { $ne: "completed" },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "queue",
        populate: {
          path: "department",
          select: "name",
        },
      });

    if (!ticket) {
      return res.status(404).json({
        message: "No active ticket found",
      });
    }

    // 2️⃣ Calculate current position (only for waiting tickets)
    let position = null;

    if (ticket.status === "waiting") {
      position =
        (await Ticket.countDocuments({
          queue: ticket.queue._id,
          status: "waiting",
          createdAt: { $lt: ticket.createdAt },
        })) + 1;
    }

    // 3️⃣ Response
    res.json({
  ticketId: ticket._id,
  ticketNumber: ticket.ticketNumber,
  status: ticket.status,
  department: ticket.queue.department.name,
  departmentId: ticket.queue.department._id, // ✅ ADD THIS LINE
  position,
  isGuest: true,
});


  } catch (error) {
    console.error("Guest restore error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
