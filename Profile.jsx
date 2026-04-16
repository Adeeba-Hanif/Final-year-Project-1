import React from "react";
import AdminLayout from "../../layout/AdminLayout.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { FiUser, FiMail, FiLogOut, FiShield } from "react-icons/fi";

export default function AdminProfile() {
    const { user, logout } = useAuthContext();

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
        : "A";

    return (
        <AdminLayout active="profile">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Your administrator account</p>
                </div>
            </div>

            <div className="max-w-lg space-y-4">
                {/* Avatar card */}
                <div className="card p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="text-lg font-bold text-slate-800">{user?.fullName || "Admin"}</p>
                        <p className="text-sm text-slate-500">{user?.email || ""}</p>
                        <span className="mt-1 inline-flex items-center gap-1 badge badge-blue">
                            <FiShield size={9} /> Administrator
                        </span>
                    </div>
                </div>

                {/* Read-only fields */}
                <div className="card p-5 space-y-4">
                    <div>
                        <label className="field-label flex items-center gap-1.5">
                            <FiUser size={12} /> Full Name
                        </label>
                        <input
                            className="field bg-slate-50 cursor-not-allowed text-slate-600"
                            value={user?.fullName || ""}
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="field-label flex items-center gap-1.5">
                            <FiMail size={12} /> Email
                        </label>
                        <input
                            className="field bg-slate-50 cursor-not-allowed text-slate-600"
                            value={user?.email || ""}
                            readOnly
                        />
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="btn-md btn-danger gap-2 w-full"
                >
                    <FiLogOut size={14} /> Sign Out
                </button>
            </div>
        </AdminLayout>
    );
}
