import Queue from "../models/Queue.js";

// ===============================
// GET CURRENT SERVING TICKET
// ===============================
export const getCurrentServing = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const queue = await Queue.findOne({ department: departmentId })
      .populate("currentTicket", "ticketNumber");

    res.json({
      currentServing: queue?.currentTicket?.ticketNumber || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
