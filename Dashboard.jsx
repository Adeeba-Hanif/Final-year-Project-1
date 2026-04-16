import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../../layout/AdminLayout.jsx";
import { StatCard } from "../../components/Card.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import {
    FiUsers, FiHome, FiAlertCircle, FiCheckCircle, FiBell,
    FiArrowRight, FiDollarSign, FiTruck, FiTrendingUp, FiClock, FiStar,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE;

const QUICK_LINKS = [
    { label: "Students",      href: "/admin/students",    icon: FiUsers,       color: "indigo" },
    { label: "Complaints",    href: "/admin/complaints",  icon: FiAlertCircle, color: "rose"   },
    { label: "Finance",       href: "/admin/finance",     icon: FiDollarSign,  color: "emerald"},
    { label: "Rooms",         href: "/admin/hostel",      icon: FiHome,        color: "amber"  },
    { label: "Transport",     href: "/admin/transport",   icon: FiTruck,       color: "sky"    },
    { label: "Reviews",       href: "/admin/reviews",     icon: FiStar,        color: "violet" },
];

const COLOR_LINK = {
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
    rose:   "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
    emerald:"bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
    sky:    "bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
};

export default function Dashboard() {
    const { token } = useAuthContext();
    const [stats, setStats] = useState({
        totalStudents: null, totalRooms: null, occupiedRooms: null, pendingComplaints: null,
        totalRevenue: null, pendingRevenue: null,
    });
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        Promise.allSettled([
            axios.get(`${API_BASE}/user/students`, { headers }),
            axios.get(`${API_BASE}/room/`, { headers }),
            axios.get(`${API_BASE}/complaints/all?status=pending`, { headers }),
            axios.get(`${API_BASE}/notifications/`, { headers }),
            axios.get(`${API_BASE}/stats/overview`, { headers }),
        ]).then(([studRes, roomRes, compRes, notifRes, statsRes]) => {
            const students = studRes.status === "fulfilled" ? studRes.value.data.students : [];
            const rooms    = roomRes.status  === "fulfilled" ? (Array.isArray(roomRes.value.data) ? roomRes.value.data : roomRes.value.data.rooms ?? []) : [];
            const pending  = compRes.status  === "fulfilled" ? compRes.value.data.complaints : [];
            const notifs   = notifRes.status === "fulfilled" ? notifRes.value.data.notifications : [];
            const overview = statsRes.status === "fulfilled" ? statsRes.value.data : null;

            setStats({
                totalStudents:    students.length,
                totalRooms:       rooms.length,
                occupiedRooms:    rooms.filter((r) => r.status === "booked").length,
                pendingComplaints: pending.length,
                totalRevenue:     overview?.finance?.totalRevenue ?? null,
                pendingRevenue:   overview?.finance?.pendingRevenue ?? null,
            });
            setNotifications(notifs.slice(0, 8));
        }).finally(() => setLoading(false));
    }, [token]);

    const { totalStudents, totalRooms, occupiedRooms, pendingComplaints, totalRevenue, pendingRevenue } = stats;

    return (
        <AdminLayout active="dashboard">
            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Riphah International University  Hostel Overview</p>
                </div>
                <span className="hidden sm:inline text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
                    {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
            </div>

            {/* Stats row 1: occupancy */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                <StatCard label="Total Students"     value={totalStudents} loading={loading} icon={<FiUsers />}        color="indigo" />
                <StatCard label="Total Rooms"        value={totalRooms}    loading={loading} icon={<FiHome />}         color="amber"
                    sub={loading ? undefined : `${occupiedRooms} occupied`} />
                <StatCard label="Available Rooms"    value={loading ? null : (totalRooms - occupiedRooms)} loading={loading} icon={<FiCheckCircle />} color="emerald" />
                <StatCard label="Pending Complaints" value={pendingComplaints} loading={loading} icon={<FiAlertCircle />} color="rose" />
            </div>

            {/* Stats row 2: finance */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <StatCard
                    label="Revenue Collected"
                    value={totalRevenue !== null ? `Rs ${totalRevenue.toLocaleString()}` : ""}
                    loading={loading} icon={<FiTrendingUp />} color="emerald"
                />
                <StatCard
                    label="Outstanding Amount"
                    value={pendingRevenue !== null ? `Rs ${pendingRevenue.toLocaleString()}` : ""}
                    loading={loading} icon={<FiClock />} color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Notifications */}
                <div className="lg:col-span-3 card">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <FiBell size={14} className="text-slate-400" />
                            <h3 className="text-sm font-semibold text-slate-700">Recent Notifications</h3>
                        </div>
                        <Link to="/admin/notifications-alerts" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
                            View all <FiArrowRight size={11} />
                        </Link>
                    </div>
                    <div className="px-5 py-3 divide-y divide-slate-50">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="py-3 flex gap-3 animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 bg-slate-100 rounded w-3/4" />
                                        <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="py-10 text-center">
                                <FiBell className="mx-auto text-slate-200 mb-2" size={28} />
                                <p className="text-sm text-slate-400">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div key={n._id} className="py-3 flex items-start gap-3 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-700 leading-snug group-hover:text-slate-900 transition-colors">
                                            {n.text || n.title || n.message}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(n.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick links */}
                <div className="lg:col-span-2 card p-5">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Quick Access</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        {QUICK_LINKS.map(({ label, href, icon: Icon, color }) => (
                            <Link
                                key={label}
                                to={href}
                                className={`flex flex-col items-start gap-2 border rounded-xl px-3.5 py-3 transition-all group ${COLOR_LINK[color]}`}
                            >
                                <Icon size={16} />
                                <span className="text-xs font-semibold leading-tight">{label}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
