import mongoose from "mongoose";

const staffQrSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    qrId: {
      type: String,
      unique: true,
      required: true,
    },

    validDate: {
      type: Date,
      required: true, // expires at end of day
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

staffQrSchema.index({ validDate: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("StaffQr", staffQrSchema);
