import mongoose from "mongoose";
const { Schema } = mongoose;

const complaintSchema = new Schema(
    {
        student: { type: Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        response: { type: String },
        status: { type: String, enum: ["pending", "resolved", "rejected"], default: "pending" },
        handledBy: { type: Schema.Types.ObjectId, ref: "User" }, // admin or warden
    },
    { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
