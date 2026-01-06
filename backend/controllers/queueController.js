import Queue from "../models/Queue.js";
import { getCrowdStatusByDepartment } from "../services/crowdStatus.service.js";


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

// ===============================
// GET CROWD STATUS (BEFORE JOIN)
// ===============================
export const getCrowdStatus = async (req, res) => {
  try {
    const { departmentId } = req.query;

    if (!departmentId) {
      return res.status(400).json({
        message: "departmentId is required",
      });
    }

    const crowdStatus = await getCrowdStatusByDepartment(departmentId);

    res.json({
      departmentId,
      ...crowdStatus,
    });
  } catch (error) {
    console.error("Crowd status error:", error);
    res.status(500).json({
      message: "Unable to fetch crowd status",
    });
  }
};
