import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
    },

    queue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // 🔑 GUEST SUPPORT (THIS WAS MISSING)
    isGuest: {
      type: Boolean,
      default: false,
    },

    guestToken: {
      type: String,
      index: true,
      default: null,
    },

    guestInfo: {
      name: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
    },

    source: {
      type: String,
      enum: ["app", "qr", "staff"],
      required: true,
    },

    status: {
      type: String,
      enum: ["waiting", "serving", "completed", "no-show"],
      default: "waiting",
    },

    servedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
