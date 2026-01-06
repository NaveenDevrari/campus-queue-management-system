import Ticket from "../models/Ticket.js";
import Queue from "../models/Queue.js";

/**
 * Crowd Status Service
 * -------------------
 * Calculates real-time crowd signal for a department
 */

const AVG_SERVICE_TIME_MINUTES = 3; // ⏱ average time per ticket (hackathon-safe)

/**
 * Get crowd status for a department
 * @param {String} departmentId
 */
export const getCrowdStatusByDepartment = async (departmentId) => {
  if (!departmentId) {
    throw new Error("Department ID is required");
  }

  // 1️⃣ Find queue for department
  const queue = await Queue.findOne({ department: departmentId });

  if (!queue) {
    return {
      queueLength: 0,
      estimatedWaitTime: 0,
      crowdLevel: "GREEN",
    };
  }

  // 2️⃣ Count active tickets (waiting + serving)
  const queueLength = await Ticket.countDocuments({
    queue: queue._id,
    status: { $in: ["waiting", "serving"] },
  });

  // 3️⃣ Active staff count
  // V1 assumption: 1 active staff per department
  const activeStaffCount = 1;

  // 4️⃣ Calculate estimated wait time
  let estimatedWaitTime = 0;

  if (activeStaffCount > 0) {
    estimatedWaitTime =
      (queueLength * AVG_SERVICE_TIME_MINUTES) / activeStaffCount;
  } else {
    // No staff available → worst case
    estimatedWaitTime = queueLength * AVG_SERVICE_TIME_MINUTES;
  }

  // Round for clean UI
  estimatedWaitTime = Math.ceil(estimatedWaitTime);

  // 5️⃣ Decide crowd level
  let crowdLevel = "GREEN";

  if (estimatedWaitTime > 25) {
    crowdLevel = "RED";
  } else if (estimatedWaitTime > 10) {
    crowdLevel = "YELLOW";
  }

  // 6️⃣ Return final result
  return {
    queueLength,
    estimatedWaitTime,
    crowdLevel,
  };
};
