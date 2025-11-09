import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Attendance } from "../models/attendance.model.js";

const QR_TTL_MS = 30 * 1000; // 30 seconds

export const getAttendanceQr = (req, res) => {
    const now = Date.now();
    const payload = {
        type: "attendance",
        iat: Math.floor(now / 1000),
        exp: Math.floor((now + QR_TTL_MS) / 1000),
        nonce: crypto.randomBytes(6).toString("hex"),
    };

    // SIGN HERE
    const qrToken = jwt.sign(payload, process.env.JWT_SECRET);

    res.json({
        qrToken,
        expiresIn: QR_TTL_MS / 1000,
    });
};

export const markAttendance = async (req, res) => {
    try {
        // user comes from your verifyToken middleware
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { qrToken, verifiedBy } = req.body;

        if (!qrToken) {
            return res.status(400).json({ message: "qrToken is required" });
        }

        if (!verifiedBy || !["fingerprint", "otp"].includes(verifiedBy)) {
            return res
                .status(400)
                .json({ message: "verifiedBy must be 'fingerprint' or 'otp'" });
        }

        // 1) verify the QR was actually issued by us and not expired
        let qrPayload;
        try {
            qrPayload = jwt.verify(qrToken, process.env.JWT_SECRET);
            // qrPayload will have type/exp/nonce if you added them when generating
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired QR" });
        }

        // 2) optional: prevent multiple attendance in same day
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const existing = await Attendance.findOne({
            student: userId,
            date: { $gte: dayStart, $lt: dayEnd },
        });

        if (existing) {
            return res.status(200).json({
                message: "Attendance already marked for today",
                attendance: existing,
            });
        }

        // 3) create attendance
        const attendance = await Attendance.create({
            student: userId,
            date: now,
            verifiedBy,
            status: "present",
        });

        return res.status(201).json({
            message: "Attendance marked",
            attendance,
        });
    } catch (err) {
        console.error("markAttendance error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getMyAttendance = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // get all attendance for this user, latest first
        const records = await Attendance.find({ student: userId })
            .sort({ date: -1 })
            .lean();

        // shape the response
        const data = records.map((r) => ({
            id: r._id,
            date: r.date,
            present: r.status === "present",
            verifiedBy: r.verifiedBy,
            status: r.status,
            createdAt: r.createdAt,
        }));

        return res.json({
            count: data.length,
            attendance: data,
        });
    } catch (err) {
        console.error("getMyAttendance error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
