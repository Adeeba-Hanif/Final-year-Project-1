import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Room } from "../models/room.model.js";
import { getUserProfileById } from "../utils/getUserProfileById.js";

export const getStudentProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json({ message: "User id missing in token" });
        }

        const user = await getUserProfileById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        console.error("getStudentProfile error:", err);
        res.status(500).json({ message: "Server error" });
    }
};



export const updateMyProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user?.id;
        if (!userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "User id missing in token" });
        }

        // fields user can change without room logic
        const allowedFields = ["fullName", "phone", "messPlan", "messChoices"];
        const updates = {};

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // fetch user so we know current room + current messChoices
        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "User not found" });
        }

        const currentRoomId = user.room ? user.room.toString() : null;
        const requestedRoomId = req.body.room || null;

        // merge messChoices if partial
        if (req.body.messChoices) {
            const merged = {
                ...(user.messChoices ? user.messChoices.toObject?.() ?? user.messChoices : {}),
                ...req.body.messChoices,
            };
            updates.messChoices = merged;
        }

        // ROOM CHANGE LOGIC (based on occupants array)
        if (requestedRoomId && requestedRoomId !== currentRoomId) {
            // get target room
            const targetRoom = await Room.findById(requestedRoomId).session(session);
            if (!targetRoom) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: "Target room not found" });
            }

            // check vacancy
            const hasVacancy =
                targetRoom.occupants.length < (targetRoom.capacity ?? 0);

            if (!hasVacancy) {
                await session.abortTransaction();
                session.endSession();
                return res
                    .status(400)
                    .json({ message: "Room is full. Choose another room." });
            }

            // add user to target room occupants (avoid duplicates just in case)
            if (!targetRoom.occupants.some((id) => id.toString() === userId)) {
                targetRoom.occupants.push(userId);
            }

            // optionally update status
            if (targetRoom.occupants.length >= targetRoom.capacity) {
                targetRoom.status = "booked";
            } else {
                targetRoom.status = "available";
            }
            await targetRoom.save({ session });

            // remove from old room if existed
            if (currentRoomId) {
                const oldRoom = await Room.findById(currentRoomId).session(session);
                if (oldRoom) {
                    oldRoom.occupants = oldRoom.occupants.filter(
                        (id) => id.toString() !== userId
                    );
                    // adjust status on old room
                    if (oldRoom.occupants.length >= oldRoom.capacity) {
                        oldRoom.status = "booked";
                    } else {
                        oldRoom.status = "available";
                    }
                    await oldRoom.save({ session });
                }
            }

            // set user's room to new one
            updates.room = requestedRoomId;
        }

        // finally update user
        await User.findByIdAndUpdate(userId, updates, {
            new: false,
            session,
        });

        // return fresh populated profile
        const updatedUser = await getUserProfileById(userId, session);

        await session.commitTransaction();
        session.endSession();

        return res.json(updatedUser);
    } catch (err) {
        console.error("updateMyProfile error:", err);
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json({ message: "Server error" });
    }
};

