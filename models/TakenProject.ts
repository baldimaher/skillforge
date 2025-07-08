import mongoose, { Document, Schema, Types, model, models } from "mongoose";

interface ITicket {
  title: string;
  description: string;
  status: "À faire" | "En cours" | "Terminé";
  createdAt: Date;
}

interface ITakenProject extends Document {
  userId: Types.ObjectId;
  projectId: Types.ObjectId;
  tickets: ITicket[];
  startedAt: Date;
}

const ticketSchema = new Schema<ITicket>({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["À faire", "En cours", "Terminé"],
    default: "À faire",
  },
  createdAt: { type: Date, default: Date.now },
});

const takenProjectSchema = new Schema<ITakenProject>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  tickets: [ticketSchema],
  startedAt: { type: Date, default: Date.now },
});

// Vérifie si le modèle existe déjà, sinon crée-le
const TakenProject = models.TakenProject || model<ITakenProject>("TakenProject", takenProjectSchema);

export default TakenProject;
