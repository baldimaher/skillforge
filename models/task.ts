import mongoose, { Schema, model, models } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    status: {
      type: String,
      enum: ["todo", "doing", "done"],  // correspond à ce que tu envoies depuis le front
      default: "todo",
    },
  },
  {
    timestamps: true,
  }
);

const Task = models.Task || model("Task", taskSchema);

export default Task;
