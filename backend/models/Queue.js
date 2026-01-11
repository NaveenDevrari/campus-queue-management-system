import mongoose from "mongoose";

const queueSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      unique: true,
    },

    isOpen: {
      type: Boolean,
      default: true,
    },

    // 🔢 NEW: Optional queue limit
    maxTickets: {
      type: Number,
      default: null, // null = unlimited queue
    },

    currentTicket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    averageServiceTime: {
      type: Number, // in minutes
      default: 5,
    },
    emergencyActive: {
  type: Boolean,
  default: false,
},

emergencyReason: {
  type: String,
  default: "",
},

  },
  { timestamps: true }
);

const Queue = mongoose.model("Queue", queueSchema);

export default Queue;
