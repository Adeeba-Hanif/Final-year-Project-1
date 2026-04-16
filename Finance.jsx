import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../../layout/AdminLayout.jsx";
import { useAuthContext } from "../../context/AuthContext.jsx";
import {
    FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp,
    FiDownload, FiX, FiAlertTriangle, FiSearch, FiBarChart2,
    FiUsers, FiFilter,
} from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE;
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function Finance() {
    const { token } = useAuthContext();

    // Challan list state
    const [challans,     setChallans]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterMonth,  setFilterMonth]  = useState("");
    const [search,       setSearch]       = useState("");

    // Stats state
    const [finStats,     setFinStats]     = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // Generate modal
    const [showGenModal, setShowGenModal] = useState(false);
    const [genMonth,     setGenMonth]     = useState("");
    const [genYear,      setGenYear]      = useState(new Date().getFullYear());
    const [genDue,       setGenDue]       = useState("");
    const [genLoading,   setGenLoading]   = useState(false);
    const [genResult,    setGenResult]    = useState(null);

    // Mark paid modal
    const [payingId,     setPayingId]     = useState(null);
    const [bankRef,      setBankRef]      = useState("");
    const [payLoading,   setPayLoading]   = useState(false);

    // Analytics tab
    const [tab, setTab] = useState("challans"); // "challans" | "analytics"

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    const fetchChallans = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== "all") params.status = filterStatus;
            if (filterMonth)            params.month  = filterMonth;
            const res = await axios.get(`${API_BASE}/challan/all`, { ...authHeaders, params });
            setChallans(res.data.challans || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [token, filterStatus, filterMonth]); // eslint-disable-line

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/stats/finance`, authHeaders);
            setFinStats(res.data);
        } catch (err) { console.error(err); }
        finally { setStatsLoading(false); }
    }, [token]); // eslint-disable-line

    useEffect(() => { fetchChallans(); fetchStats(); }, [fetchChallans, fetchStats]);

    const paid      = challans.filter((c) => c.status === "paid");
    const unpaid    = challans.filter((c) => c.status === "unpaid");
    const collected = paid.reduce((s, c) => s + c.totalAmount, 0);
    const pending   = unpaid.reduce((s, c) => s + c.totalAmount, 0);

    const filtered  = challans.filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            c.student?.fullName?.toLowerCase().includes(q) ||
            c.student?.email?.toLowerCase().includes(q)   ||
            c.challanId?.toLowerCase().includes(q)
        );
    });

    const handleGenerate = async () => {
        if (!genMonth || !genYear || !genDue) return alert("Please fill all fields.");
        setGenLoading(true); setGenResult(null);
        try {
            const res = await axios.post(
                `${API_BASE}/challan/generate-monthly`,
                { month: `${genMonth} ${genYear}`, dueDate: genDue },
                authHeaders
            );
            setGenResult(res.data);
            fetchChallans(); fetchStats();
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to generate challans");
        } finally { setGenLoading(false); }
    };

    const handleMarkPaid = async () => {
        if (!payingId) return;
        setPayLoading(true);
        try {
            await axios.patch(`${API_BASE}/challan/${payingId}/mark-paid`, { bankRef }, authHeaders);
            setPayingId(null); setBankRef(""); fetchChallans(); fetchStats();
        } catch (err) {
            alert(err?.response?.data?.message || "Failed");
        } finally { setPayLoading(false); }
    };

    const handlePdf = async (challan) => {
        try {
            const res = await axios.get(`${API_BASE}/challan/${challan._id}/pdf`, { ...authHeaders, responseType: "blob" });
            const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const a = document.createElement("a"); a.href = url;
            a.download = `challan-${challan.challanId}.pdf`; a.click();
            URL.revokeObjectURL(url);
        } catch { alert("Failed to download PDF"); }
    };

    const statTotals = finStats?.totals;

    return (
        <AdminLayout active="finance">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Finance & Challans</h1>
                    <p className="page-subtitle">Bank of Meezan payment challans and revenue analytics</p>
                </div>
                <button
                    onClick={() => { setShowGenModal(true); setGenResult(null); }}
                    className="btn-md btn-primary"
                >
                    + Generate Monthly Challans
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Revenue" value={statTotals ? `Rs ${statTotals.totalRevenue.toLocaleString()}` : ""}   loading={statsLoading} icon={<FiTrendingUp />}  color="indigo" />
                <StatCard label="Paid"          value={statTotals?.paidCount ?? ""}                                           loading={statsLoading} icon={<FiCheckCircle />} color="emerald" />
                <StatCard label="Outstanding"   value={statTotals ? `Rs ${statTotals.pendingRevenue.toLocaleString()}` : ""} loading={statsLoading} icon={<FiClock />}       color="amber" />
                <StatCard label="Total Students" value={finStats?.studentsSummary?.total ?? ""}                              loading={statsLoading} icon={<FiUsers />}       color="sky" />
            </div>

            {/* Pending alert */}
            {!statsLoading && statTotals?.pendingRevenue > 0 && (
                <div className="mb-5 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <FiAlertTriangle className="text-amber-500 shrink-0" size={15} />
                    <p className="text-sm text-amber-800">
                        <strong>Rs {statTotals.pendingRevenue.toLocaleString()}</strong> outstanding across{" "}
                        <strong>{statTotals.unpaidCount}</strong> unpaid challan{statTotals.unpaidCount !== 1 ? "s" : ""}.
                    </p>
                </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-5">
                <button
                    onClick={() => setTab("challans")}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${tab === "challans" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Challans
                </button>
                <button
                    onClick={() => setTab("analytics")}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${tab === "analytics" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    <FiBarChart2 size={12} /> Analytics
                </button>
            </div>

            {tab === "analytics" ? (
                <AnalyticsTab finStats={finStats} loading={statsLoading} />
            ) : (
                <>
                    {/* Filters */}
                    <div className="card p-4 mb-5 flex gap-3 flex-wrap items-center">
                        <div className="flex gap-2">
                            {["all", "paid", "unpaid"].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize ${
                                        filterStatus === s
                                            ? "bg-slate-900 text-white border-slate-900"
                                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    {s === "all" ? "All" : s}
                                </button>
                            ))}
                        </div>
                        <div className="relative ml-auto flex-1 max-w-xs">
                            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or challan ID…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="field py-1.5 text-xs pl-8 w-full"
                            />
                        </div>
                        <div className="relative">
                            <FiFilter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Month (e.g. June 2025)"
                                value={filterMonth}
                                onChange={(e) => setFilterMonth(e.target.value)}
                                className="field py-1.5 text-xs pl-8 w-44"
                            />
                        </div>
                    </div>

                    {/* Challan table */}
                    <div className="card">
                        {loading ? (
                            <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading challans…</div>
                        ) : filtered.length === 0 ? (
                            <div className="py-20 text-center">
                                <FiDollarSign className="mx-auto text-slate-200 mb-3" size={36} />
                                <p className="text-sm text-slate-500">No challans found</p>
                                <p className="text-xs text-slate-400 mt-1">Generate monthly challans or adjust your filters</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="data-table px-5">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pl-5">Challan ID</th>
                                            <th>Student</th>
                                            <th>Month</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Due Date</th>
                                            <th>Status</th>
                                            <th className="pr-5">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((c) => {
                                            const isOverdue = c.status === "unpaid" && new Date(c.dueDate) < new Date();
                                            return (
                                                <tr key={c._id}>
                                                    <td className="pl-5">
                                                        <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                            {c.challanId}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <p className="font-semibold text-slate-800 text-sm">{c.student?.fullName || ""}</p>
                                                        <p className="text-[11px] text-slate-400">{c.student?.email}</p>
                                                    </td>
                                                    <td className="text-slate-600 text-sm">{c.month}</td>
                                                    <td>
                                                        <span className="text-[11px] capitalize bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                                                            {c.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="font-bold text-slate-800">Rs {c.totalAmount?.toLocaleString()}</span>
                                                    </td>
                                                    <td>
                                                        <span className={isOverdue ? "text-rose-600 font-semibold text-xs" : "text-slate-500 text-xs"}>
                                                            {new Date(c.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                                                            {isOverdue && " ⚠"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {c.status === "paid" ? (
                                                            <span className="badge badge-green">Paid</span>
                                                        ) : isOverdue ? (
                                                            <span className="badge badge-red">Overdue</span>
                                                        ) : (
                                                            <span className="badge badge-amber">Unpaid</span>
                                                        )}
                                                    </td>
                                                    <td className="pr-5">
                                                        <div className="flex gap-2 items-center">
                                                            <button onClick={() => handlePdf(c)} className="btn-sm btn-ghost gap-1.5">
                                                                <FiDownload size={11} /> PDF
                                                            </button>
                                                            {c.status === "unpaid" && (
                                                                <button
                                                                    onClick={() => { setPayingId(c._id); setBankRef(""); }}
                                                                    className="btn-sm btn-success"
                                                                >
                                                                    Mark Paid
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Generate Modal */}
            {showGenModal && (
                <Modal title="Generate Monthly Challans" onClose={() => setShowGenModal(false)}>
                    <p className="text-sm text-slate-500 mb-4">
                        Creates one challan per active student with room rent + any unbilled mess expenses. Existing challans for the same month are skipped.
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="field-label">Month</label>
                            <select value={genMonth} onChange={(e) => setGenMonth(e.target.value)} className="field">
                                <option value="">Select month</option>
                                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="field-label">Year</label>
                            <input type="number" value={genYear} onChange={(e) => setGenYear(e.target.value)} className="field" />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="field-label">Due Date</label>
                        <input type="date" value={genDue} onChange={(e) => setGenDue(e.target.value)} className="field" />
                    </div>
                    {genResult && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800 mb-4">
                            ✓ Created: <strong>{genResult.created}</strong> &nbsp;·&nbsp; Skipped: <strong>{genResult.skipped}</strong>
                        </div>
                    )}
                    <button onClick={handleGenerate} disabled={genLoading} className="btn-lg btn-primary w-full">
                        {genLoading ? "Generating…" : "Generate Challans"}
                    </button>
                </Modal>
            )}

            {/* Mark Paid Modal */}
            {payingId && (
                <Modal title="Mark as Paid" onClose={() => setPayingId(null)}>
                    <p className="text-sm text-slate-500 mb-4">
                        Enter the Bank of Meezan transaction reference (optional).
                    </p>
                    <div className="mb-4">
                        <label className="field-label">Bank Reference</label>
                        <input
                            type="text"
                            placeholder="e.g. TXN-20250601-12345"
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            className="field"
                        />
                    </div>
                    <button onClick={handleMarkPaid} disabled={payLoading} className="btn-lg btn-success w-full">
                        {payLoading ? "Saving…" : "Confirm Payment"}
                    </button>
                </Modal>
            )}
        </AdminLayout>
    );
}

// ── Analytics sub-view ────────────────────────────────────────────────────────
function AnalyticsTab({ finStats, loading }) {
    if (loading) {
        return (
            <div className="card p-8 text-center text-slate-400 text-sm animate-pulse">
                Loading analytics…
            </div>
        );
    }

    const monthly = finStats?.monthlyBreakdown || [];
    const maxVal  = Math.max(...monthly.map((m) => m.collected + m.pending), 1);

    return (
        <div className="space-y-5">
            {/* Student summary */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Students", value: finStats?.studentsSummary?.total ?? 0, color: "indigo" },
                    { label: "Have Challans",  value: finStats?.studentsSummary?.withChallans ?? 0, color: "emerald" },
                    { label: "No Challan",     value: finStats?.studentsSummary?.noChallan ?? 0, color: "amber" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="card p-4">
                        <p className="text-xs text-slate-500 font-medium">{label}</p>
                        <p className={`text-3xl font-bold mt-1 text-${color}-600`}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Monthly bar chart */}
            <div className="card p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
                    <FiBarChart2 size={14} className="text-indigo-400" /> Monthly Revenue Breakdown
                </h3>
                {monthly.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-10">No monthly data yet</p>
                ) : (
                    <div className="flex items-end gap-3 h-44 overflow-x-auto pb-1">
                        {monthly.map((m) => {
                            const totalH  = Math.round(((m.collected + m.pending) / maxVal) * 100);
                            const collH   = Math.round((m.collected / maxVal) * 100);
                            return (
                                <div key={m._id} className="flex flex-col items-center gap-1 shrink-0 min-w-[52px]">
                                    <div className="relative flex items-end gap-0.5 h-36 w-10">
                                        <div
                                            className="w-4 bg-indigo-500 rounded-t transition-all"
                                            style={{ height: `${collH}%` }}
                                            title={`Collected: Rs ${m.collected.toLocaleString()}`}
                                        />
                                        <div
                                            className="w-4 bg-amber-300 rounded-t transition-all"
                                            style={{ height: `${(totalH - collH)}%` }}
                                            title={`Pending: Rs ${m.pending.toLocaleString()}`}
                                        />
                                    </div>
                                    <span className="text-[10px] text-slate-400 text-center leading-tight">{m._id?.split(" ")[0]?.slice(0,3)}</span>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="flex gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Collected
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 rounded bg-amber-300" /> Pending
                    </div>
                </div>
            </div>

            {/* Monthly detail table */}
            <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700">Per-Month Summary</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table px-5">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="pl-5">Month</th>
                                <th>Total</th>
                                <th>Collected</th>
                                <th>Pending</th>
                                <th className="pr-5">Challans</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthly.map((m) => (
                                <tr key={m._id}>
                                    <td className="pl-5 font-semibold text-slate-700">{m._id}</td>
                                    <td className="font-bold">Rs {(m.collected + m.pending).toLocaleString()}</td>
                                    <td className="text-emerald-600 font-semibold">Rs {m.collected.toLocaleString()}</td>
                                    <td className="text-amber-600 font-semibold">Rs {m.pending.toLocaleString()}</td>
                                    <td className="pr-5 text-slate-500">{m.totalChallans}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ── Shared components ─────────────────────────────────────────────────────────
function StatCard({ label, value, loading, icon, color }) {
    const clr = {
        indigo:  "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber:   "bg-amber-50 text-amber-600",
        sky:     "bg-sky-50 text-sky-600",
    };
    return (
        <div className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${clr[color] || clr.indigo}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                {loading
                    ? <div className="h-6 w-16 bg-slate-100 rounded mt-1 animate-pulse" />
                    : <p className="text-xl font-bold text-slate-800 leading-none mt-0.5">{value ?? ""}</p>
                }
            </div>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
                        <FiX size={16} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}
