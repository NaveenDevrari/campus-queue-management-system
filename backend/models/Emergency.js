import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",   // student submitted, waiting for staff
        "approved",  // approved but waiting
        "active",    // currently being served
        "rejected",  // staff rejected
        "resolved",  // served successfully
      ],
      default: "pending",
    },

    note: {
      type: String,
      default: "",
    },

    reason: {
      type: String,
      required: true,
    },

    proof: {
      type: String, // image path
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Emergency", emergencySchema);
