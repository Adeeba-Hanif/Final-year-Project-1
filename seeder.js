import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectDB from "./db.js";
import { Room } from "../models/room.model.js";
import { Service } from "../models/service.model.js";
import { Transport } from "../models/transport.model.js";
import { MessPlan } from "../models/messPlan.model.js";
import { User } from "../models/user.model.js";

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        await Promise.all([
            Room.deleteMany(),
            Service.deleteMany(),
            Transport.deleteMany(),
            MessPlan.deleteMany(),
            User.deleteOne({ email: "admin@staff.riphah.edu.pk" }),
        ]);

        const levels = ["A", "B", "C"];
        const rooms = [];

        levels.forEach((level, levelIndex) => {
            for (let i = 1; i <= 15; i++) {
                const roomNumber = `${level}${i.toString().padStart(2, "0")}`;
                const rent = 10000 + levelIndex * 2000 + i * 100;
                rooms.push({
                    level,
                    roomNumber,
                    capacity: i % 3 === 0 ? 3 : 2,
                    rent,
                });
            }
        });

        const createdRooms = await Room.insertMany(rooms);

        const wifiServices = [];
        for (let i = 0; i < createdRooms.length; i += 5) {
            const wifiGroup = createdRooms.slice(i, i + 5);
            const level = wifiGroup[0].level;
            const wifiName = `WIFI-${level}-${Math.floor(i / 5) + 1}`;

            wifiServices.push({
                name: wifiName,
                category: "utility",
                type: "wifi",
                description: `WiFi covering rooms ${wifiGroup
                    .map((r) => r.roomNumber)
                    .join(", ")}`,
                wifiRooms: wifiGroup.map((r) => r._id),
                isPaid: false,
                password: `Hostel@${level}${Math.floor(i / 5) + 1}`,
            });
        }

        await Service.insertMany([
            ...wifiServices,
            {
                name: "Laundry",
                type: "laundry",
                category: "paid",
                description: "Wash and fold laundry service.",
                isPaid: true,
                pricePerItem: 3,
            },
            {
                name: "Ironing",
                type: "ironing",
                category: "paid",
                description: "Ironing service.",
                isPaid: true,
                pricePerItem: 2,
            },
        ]);

        const transportRoutes = [
            {
                routeName: "Morning Route A",
                from: "Hostel",
                to: "University",
                departureTime: "07:00 AM",
                driverName: "Imran Khan",
                busNumber: "BUS-001",
                seatsAvailable: 40,
            },
            {
                routeName: "Morning Route B",
                from: "Hostel",
                to: "University",
                departureTime: "08:00 AM",
                driverName: "Ali Raza",
                busNumber: "BUS-002",
                seatsAvailable: 35,
            },
            {
                routeName: "Midday Route",
                from: "University",
                to: "Hostel",
                departureTime: "01:00 PM",
                driverName: "Ahmed Rafiq",
                busNumber: "BUS-003",
                seatsAvailable: 30,
            },
            {
                routeName: "Evening Route A",
                from: "University",
                to: "Hostel",
                departureTime: "05:00 PM",
                driverName: "Hassan Malik",
                busNumber: "BUS-004",
                seatsAvailable: 40,
            },
            {
                routeName: "Evening Route B",
                from: "University",
                to: "Hostel",
                departureTime: "06:00 PM",
                driverName: "Zeeshan Tariq",
                busNumber: "BUS-005",
                seatsAvailable: 40,
            },
        ];

        await Transport.insertMany(transportRoutes);

        // mess plans with prices
        await MessPlan.insertMany([
            {
                day: "Monday",
                meals: {
                    breakfast: { items: ["Paratha", "Omelette", "Tea"], price: 200 },
                    lunch: { items: ["Daal Chawal", "Salad"], price: 300 },
                    dinner: { items: ["Chicken Karahi", "Roti"], price: 400 },
                },
            },
            {
                day: "Tuesday",
                meals: {
                    breakfast: { items: ["Halwa Puri", "Tea"], price: 200 },
                    lunch: { items: ["Biryani", "Raita"], price: 300 },
                    dinner: { items: ["Daal Mash", "Rice"], price: 400 },
                },
            },
            {
                day: "Wednesday",
                meals: {
                    breakfast: { items: ["Aloo Paratha", "Yogurt"], price: 200 },
                    lunch: { items: ["Mixed Vegetables", "Chapati"], price: 300 },
                    dinner: { items: ["Qorma", "Naan"], price: 400 },
                },
            },
            {
                day: "Thursday",
                meals: {
                    breakfast: { items: ["Toast", "Omelette", "Milk"], price: 200 },
                    lunch: { items: ["Chana Pulao", "Raita"], price: 300 },
                    dinner: { items: ["Bhindi", "Chapati"], price: 400 },
                },
            },
            {
                day: "Friday",
                meals: {
                    breakfast: { items: ["Aloo Paratha", "Tea"], price: 200 },
                    lunch: { items: ["Chicken Pulao", "Salad"], price: 300 },
                    dinner: { items: ["Keema", "Roti"], price: 400 },
                },
            },
            {
                day: "Saturday",
                meals: {
                    breakfast: { items: ["Egg", "Paratha", "Tea"], price: 200 },
                    lunch: { items: ["Vegetable Rice", "Salad"], price: 300 },
                    dinner: { items: ["Beef Nihari", "Naan"], price: 400 },
                },
            },
            {
                day: "Sunday",
                meals: {
                    breakfast: { items: ["Halwa Puri", "Tea"], price: 200 },
                    lunch: { items: ["Biryani", "Raita"], price: 300 },
                    dinner: { items: ["Chicken Roast", "Naan"], price: 400 },
                },
            },
        ]);

        // hash admin password
        const plainPassword = "Admin1122@";
        const hashedPassword = await bcrypt.hash(plainPassword, 10); // 10 = salt rounds

        await User.create({
            fullName: "System Admin",
            email: "admin@staff.riphah.edu.pk",
            password: hashedPassword,
            role: "admin",
            isActive: true,
            // no messPlan, no messChoices
        });

        console.log("Seeding completed.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedData();
