import mongoose from "mongoose";

const pushSubscriptionSchema = new mongoose.Schema({
  userId: String,        // student OR guest id
  role: String,          // "student" | "guest"
  subscription: Object,  // push subscription
});

export default mongoose.model("PushSubscription", pushSubscriptionSchema);
