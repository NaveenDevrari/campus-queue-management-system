import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      unique: true, // ✅ one feedback per ticket
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    // ✅ AT LEAST ONE REQUIRED
    options: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length >= 1;
        },
        message: "At least one feedback option is required",
      },
      required: true,
    },

    // OPTIONAL FREE TEXT
    comment: {
      type: String,
      maxlength: 200,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
