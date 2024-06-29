import mongoose from "mongoose";

const todoSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "pending",
  },
});

export default mongoose.model("Todo", todoSchema);
