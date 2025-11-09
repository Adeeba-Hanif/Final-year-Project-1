
import { Room } from "../models/room.model.js";

export const getRooms = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};

        if (status) {
            filter.status = status;
        }

        const rooms = await Room.find(filter)
            .populate("occupants", "name email")
            .populate("wifiPoint", "name type");

        return res.status(200).json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return res.status(500).json({ message: "Failed to fetch rooms" });
    }
};

// GET /api/rooms/:id  → get single room by id
export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id)
            .populate("occupants", "name email")
            .populate("wifiPoint", "name type");

        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        return res.status(200).json(room);
    } catch (error) {
        console.error("Error fetching room:", error);
        return res.status(500).json({ message: "Failed to fetch room" });
    }
};
