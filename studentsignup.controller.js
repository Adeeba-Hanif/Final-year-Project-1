import bcrypt from "bcryptjs";
import { User } from "../models/user.model.js";

const UniDb = [
    "42558",
    "39977",
    "39862",
    "39876",
    "39568",
    "42786",
    "42559",
    "42788",
    "42678",
    "42342",
    "42765",
];

export const studentSignup = async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;


        // Basic field validation
        if (!fullName || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate Riphah email format
        const emailRegex = /^([0-9]{5})@students\.riphah\.edu\.pk$/i;
        const match = email.toLowerCase().match(emailRegex);
        if (!match) {
            return res
                .status(400)
                .json({ message: "Invalid email. Use your university email" });
        }

        // Extract SAP ID from email and verify enrollment
        const sapId = match[1];
        if (!UniDb.includes(sapId)) {
            return res.status(403).json({ message: "This student is not enlisted in university records" });
        }

        // Normalize Pakistani phone number
        let cleanPhone = phone.replace(/\D/g, ""); // remove non-digits
        if (cleanPhone.startsWith("92")) cleanPhone = cleanPhone.slice(2);
        if (cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);
        cleanPhone = "03" + cleanPhone.slice(1); // ensure starts with 03

        if (!/^03[0-9]{9}$/.test(cleanPhone)) {
            return res.status(400).json({ message: "Invalid Pakistani phone number" });
        }

        // Check for existing student
        const existing = await User.findOne({
            $or: [{ email: email.toLowerCase() }, { phone: cleanPhone }],
        });

        if (existing) {
            return res.status(409).json({ message: "Email or phone already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student record
        const student = await User.create({
            fullName,
            email: email.toLowerCase(),
            password: hashedPassword,
            phone: cleanPhone,
        });

        // Success response
        return res.status(201).json({
            message: "User registered successfully",
            student: {
                id: student._id,
                fullName: student.fullName,
                email: student.email,
                phone: student.phone,
                role: student.role,
            },
        });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
