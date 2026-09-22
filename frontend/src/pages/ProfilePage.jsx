// import { FileText, MessageSquare, LogOut } from "lucide-react";
// import { LinearProgress } from "@mui/material";
// import Header from "../components/Header.jsx";
// import default_avatar from "../assets/default-avatar.png";
// import { useAuthStore } from "../store/authStore.js";
// import { useUsageQuery } from "../hooks/useUsage.js";

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(Date.UTC(
//         now.getUTCFullYear(),
//         now.getUTCMonth(),
//         now.getUTCDate() + 1,
//         0, 0, 0, 0
//     ));
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const totalMinutes = Math.floor(ms / 60000);
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return `${hours}h ${minutes}m`;
// }

// function barColor(used, total) {
//     if (total <= 0) return "var(--color-primary)";
//     const ratio = used / total;
//     if (ratio >= 1) return "var(--color-danger)";
//     if (ratio >= 0.8) return "var(--color-warning)";
//     return "var(--color-primary)";
// }

// function UsageRow({ icon: Icon, label, used, total }) {
//     const safeTotal = total ?? 0;
//     const safeUsed = used ?? 0;
//     const pct = safeTotal > 0 ? Math.min(100, (safeUsed / safeTotal) * 100) : 0;
//     const color = barColor(safeUsed, safeTotal);

//     return (
//         <div className="p-4 rounded-2xl bg-surface-emphasized">
//             <div className="flex items-center justify-between mb-3">
//                 <div className="flex items-center gap-2.5">
//                     <div className="w-8 h-8 rounded-lg bg-surface-default flex items-center justify-center shrink-0">
//                         <Icon className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
//                     </div>
//                     <span className="text-[14px] font-medium text-content-default">{label}</span>
//                 </div>
//                 <span className="text-[13px] font-medium text-content-deemphasized tabular-nums">
//                     {safeUsed} / {safeTotal}
//                 </span>
//             </div>
//             <LinearProgress
//                 variant="determinate"
//                 value={pct}
//                 sx={{
//                     height: 5,
//                     borderRadius: 999,
//                     backgroundColor: "var(--color-surface-default)",
//                     "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: color },
//                 }}
//             />
//         </div>
//     );
// }

// export default function ProfilePage() {
//     const user = useAuthStore((state) => state.user);
//     const handleLogout = useAuthStore((state) => state.handleLogout);

//     const { data: usage, isLoading, isError, refetch } = useUsageQuery();

//     return (
//         <div className="min-h-screen w-full bg-surface-default">
//             <Header />

//             <div className="mx-auto max-w-xl px-6 py-10 sm:px-0">
//                 <h1 className="text-[22px] font-semibold text-content-default tracking-[-0.01em] mb-6">
//                     Profile
//                 </h1>

//                 <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface-emphasized mb-8">
//                     <img
//                         src={user?.avatar || default_avatar}
//                         alt=""
//                         className="w-14 h-14 rounded-full object-cover shrink-0"
//                     />
//                     <div className="min-w-0 flex-1">
//                         <p className="text-[15px] font-semibold text-content-default truncate">
//                             {user?.name || "Your account"}
//                         </p>
//                         <p className="text-[13px] text-content-deemphasized truncate">
//                             {user?.email || ""}
//                         </p>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={handleLogout}
//                         className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-danger hover:bg-danger/8 transition-colors shrink-0"
//                     >
//                         <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
//                         Log out
//                     </button>
//                 </div>

//                 <div className="flex items-center justify-between mb-3">
//                     <h2 className="text-[13px] font-semibold text-content-default">Today's usage</h2>
//                     <span className="text-[12px] text-content-deemphasized">
//                         Resets in {formatCountdown(getMsUntilMidnightUTC())}
//                     </span>
//                 </div>

//                 {isLoading ? (
//                     <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
//                         <div className="h-5 w-5 animate-spin rounded-full border-2 border-content-deemphasized/30 border-t-primary" />
//                         <p className="text-[13px] text-content-deemphasized">Loading usage</p>
//                     </div>
//                 ) : isError ? (
//                     <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
//                         <p className="text-[13px] text-content-deemphasized">Couldn't load your usage.</p>
//                         <button
//                             type="button"
//                             onClick={() => refetch()}
//                             className="rounded-lg px-4 py-1.5 text-[13px] font-medium text-primary hover:bg-primary/10 transition-colors"
//                         >
//                             Try again
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="space-y-3">
//                         <UsageRow
//                             icon={FileText}
//                             label="Documents uploaded"
//                             used={usage?.documents?.used}
//                             total={usage?.documents?.total}
//                         />
//                         <UsageRow
//                             icon={MessageSquare}
//                             label="Questions asked"
//                             used={usage?.questions?.used}
//                             total={usage?.questions?.total}
//                         />
//                     </div>
//                 )}

//                 <p className="text-center text-[12px] text-content-deemphasized/80 mt-6">
//                     Higher limits with Pro — coming soon
//                 </p>
//             </div>
//         </div>
//     );
// }















// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import { Calendar, KeyRound, LogOut, Pencil, FileText, MessageSquare, ChevronRight } from "lucide-react";
// import { GitHubIcon, GoogleIcon, MailIcon } from "../components/common/Icons.jsx";

// import { LinearProgress } from "@mui/material";
// import Header from "../components/Header.jsx";
// import default_avatar from "../assets/default-avatar.png";
// import { useAuthStore } from "../store/authStore.js";
// import { useUsageQuery, useUpdateProfile } from "../hooks/useUsage.js";

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(Date.UTC(
//         now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
//     ));
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const totalMinutes = Math.floor(ms / 60000);
//     return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
// }

// function formatMemberSince(dateStr) {
//     if (!dateStr) return "—";
//     return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(dateStr));
// }

// function barColor(used, total) {
//     if (!total) return "var(--color-primary)";
//     const ratio = used / total;
//     if (ratio >= 1) return "var(--color-danger)";
//     if (ratio >= 0.8) return "var(--color-warning)";
//     return "var(--color-primary)";
// }

// /** Ek grouped section — iOS/macOS Settings jaisa card, andar rows divided by hairline */
// function SettingsGroup({ title, children }) {
//     return (
//         <div className="mb-7">
//             {title && (
//                 <h2 className="text-[12px] font-semibold uppercase tracking-wide text-content-deemphasized mb-2 px-1">
//                     {title}
//                 </h2>
//             )}
//             <div className="rounded-2xl bg-surface-emphasized divide-y divide-lines-divider overflow-hidden">
//                 {children}
//             </div>
//         </div>
//     );
// }

// function Row({ icon: Icon, label, value, action, danger }) {
//     return (
//         <div className="flex items-center gap-3 px-4 py-3.5">
//             {Icon && (
//                 <div className="w-7 h-7 rounded-lg bg-surface-default flex items-center justify-center shrink-0">
//                     <Icon className={`w-3.5 h-3.5 ${danger ? "text-danger" : "text-content-deemphasized"}`} strokeWidth={1.75} />
//                 </div>
//             )}
//             <div className="min-w-0 flex-1">
//                 <p className={`text-[13px] font-medium ${danger ? "text-danger" : "text-content-default"}`}>{label}</p>
//                 {value && <p className="text-[12px] text-content-deemphasized truncate mt-0.5">{value}</p>}
//             </div>
//             {action}
//         </div>
//     );
// }

// export default function ProfilePage() {
//     const navigate = useNavigate();
//     const user = useAuthStore((state) => state.user);
//     const setUser = useAuthStore((state) => state.setUser); // agar tumhare store mein na ho, ye undefined rahega (safe)
//     const handleLogout = useAuthStore((state) => state.handleLogout);

//     const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useUsageQuery();
//     const updateProfile = useUpdateProfile();

//     const [isEditingName, setIsEditingName] = useState(false);
//     const [nameDraft, setNameDraft] = useState(user?.username || user?.name || "");
//     const nameInputRef = useRef(null);

//     useEffect(() => {
//         if (isEditingName) {
//             nameInputRef.current?.focus();
//             nameInputRef.current?.select();
//         }
//     }, [isEditingName]);

//     const handleSaveName = async () => {
//         const trimmed = nameDraft.trim();
//         setIsEditingName(false);

//         const currentName = user?.username || user?.name || "";
//         if (!trimmed || trimmed === currentName) {
//             setNameDraft(currentName);
//             return;
//         }

//         try {
//             await updateProfile.mutateAsync({ username: trimmed });
//             setUser?.({ ...user, username: trimmed });
//             toast.success("Name updated");
//         } catch (err) {
//             setNameDraft(currentName);
//             toast.error(err?.response?.data?.detail?.message || "Could not update name");
//         }
//     };

//     const linkedProviders = user?.linked_providers || [];
//     const isLinked = (provider) => linkedProviders.some((p) => p.provider === provider);

//     return (
//         <div className="min-h-screen w-full bg-surface-default">
//             <Header />

//             <div className="mx-auto max-w-2xl px-6 py-10 sm:px-0">
//                 {/* Hero */}
//                 <div className="flex items-center gap-4 mb-8">
//                     <img
//                         src={user?.avatar || default_avatar}
//                         alt=""
//                         className="w-16 h-16 rounded-full object-cover shrink-0"
//                     />
//                     <div className="min-w-0 flex-1">
//                         {isEditingName ? (
//                             <input
//                                 ref={nameInputRef}
//                                 value={nameDraft}
//                                 onChange={(e) => setNameDraft(e.target.value)}
//                                 onBlur={handleSaveName}
//                                 onKeyDown={(e) => {
//                                     if (e.key === "Enter") e.target.blur();
//                                     if (e.key === "Escape") { setNameDraft(user?.username || user?.name || ""); setIsEditingName(false); }
//                                 }}
//                                 className="text-[20px] font-semibold bg-surface-emphasized outline outline-primary/50 rounded-md px-2 py-0.5 text-content-default tracking-[-0.01em] w-full max-w-xs"
//                             />
//                         ) : (
//                             <button
//                                 type="button"
//                                 onClick={() => { setNameDraft(user?.username || user?.name || ""); setIsEditingName(true); }}
//                                 className="group flex items-center gap-2 text-left"
//                             >
//                                 <span className="text-[20px] font-semibold text-content-default tracking-[-0.01em] truncate">
//                                     {user?.username || user?.name || "Your account"}
//                                 </span>
//                                 <Pencil className="w-3.5 h-3.5 text-content-deemphasized opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
//                             </button>
//                         )}
//                         <p className="text-[13px] text-content-deemphasized mt-0.5 truncate">{user?.email}</p>
//                     </div>
//                 </div>

//                 {/* Account */}
//                 <SettingsGroup title="Account">
//                     <Row icon={MailIcon} label="Email" value={user?.email} />
//                     <Row icon={Calendar} label="Member since" value={formatMemberSince(user?.created_at)} />
//                 </SettingsGroup>

//                 {/* Connected accounts */}
//                 <SettingsGroup title="Connected accounts">
//                     <Row
//                         icon={GoogleIcon}
//                         label="Google"
//                         action={
//                             isLinked("google") ? (
//                                 <span className="text-[12px] font-medium text-success">Connected</span>
//                             ) : (
//                                 <span className="text-[12px] text-content-deemphasized">Not connected</span>
//                             )
//                         }
//                     />
//                     <Row
//                         icon={GitHubIcon}
//                         label="GitHub"
//                         action={
//                             isLinked("github") ? (
//                                 <span className="text-[12px] font-medium text-success">Connected</span>
//                             ) : (
//                                 <span className="text-[12px] text-content-deemphasized">Not connected</span>
//                             )
//                         }
//                     />
//                 </SettingsGroup>

//                 {/* Security */}
//                 <SettingsGroup title="Security">
//                     <button
//                         type="button"
//                         onClick={() => navigate("/forgot-password")}
//                         className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-default/50 transition-colors text-left"
//                     >
//                         <div className="w-7 h-7 rounded-lg bg-surface-default flex items-center justify-center shrink-0">
//                             <KeyRound className="w-3.5 h-3.5 text-content-deemphasized" strokeWidth={1.75} />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                             <p className="text-[13px] font-medium text-content-default">Change password</p>
//                             <p className="text-[12px] text-content-deemphasized mt-0.5">We'll email you a code to reset it</p>
//                         </div>
//                         <ChevronRight className="w-4 h-4 text-content-deemphasized shrink-0" />
//                     </button>

//                     <button
//                         type="button"
//                         onClick={handleLogout}
//                         className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-default/50 transition-colors text-left"
//                     >
//                         <div className="w-7 h-7 rounded-lg bg-surface-default flex items-center justify-center shrink-0">
//                             <LogOut className="w-3.5 h-3.5 text-content-deemphasized" strokeWidth={1.75} />
//                         </div>
//                         <p className="text-[13px] font-medium text-content-default">Log out</p>
//                     </button>
//                 </SettingsGroup>

//                 {/* Usage */}
//                 <div className="mb-7">
//                     <div className="flex items-center justify-between mb-2 px-1">
//                         <h2 className="text-[12px] font-semibold uppercase tracking-wide text-content-deemphasized">
//                             Today's usage
//                         </h2>
//                         <span className="text-[11px] text-content-deemphasized">
//                             Resets in {formatCountdown(getMsUntilMidnightUTC())}
//                         </span>
//                     </div>

//                     {usageLoading ? (
//                         <div className="rounded-2xl bg-surface-emphasized py-8 flex items-center justify-center">
//                             <div className="h-4 w-4 animate-spin rounded-full border-2 border-content-deemphasized/30 border-t-primary" />
//                         </div>
//                     ) : usageError ? (
//                         <div className="rounded-2xl bg-surface-emphasized py-8 flex flex-col items-center justify-center gap-2">
//                             <p className="text-[13px] text-content-deemphasized">Couldn't load usage.</p>
//                             <button
//                                 type="button"
//                                 onClick={() => refetchUsage()}
//                                 className="text-[13px] font-medium text-primary hover:bg-primary/10 rounded-lg px-3 py-1"
//                             >
//                                 Try again
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="rounded-2xl bg-surface-emphasized divide-y divide-lines-divider overflow-hidden">
//                             {[
//                                 { icon: FileText, label: "Documents uploaded", used: usage?.documents?.used ?? 0, total: usage?.documents?.total ?? 0 },
//                                 { icon: MessageSquare, label: "Questions asked", used: usage?.questions?.used ?? 0, total: usage?.questions?.total ?? 0 },
//                             ].map(({ icon: Icon, label, used, total }) => (
//                                 <div key={label} className="px-4 py-3.5">
//                                     <div className="flex items-center justify-between mb-2">
//                                         <div className="flex items-center gap-2.5">
//                                             <Icon className="w-3.5 h-3.5 text-content-deemphasized" strokeWidth={1.75} />
//                                             <span className="text-[13px] font-medium text-content-default">{label}</span>
//                                         </div>
//                                         <span className="text-[12px] text-content-deemphasized tabular-nums">{used} / {total}</span>
//                                     </div>
//                                     <LinearProgress
//                                         variant="determinate"
//                                         value={total > 0 ? Math.min(100, (used / total) * 100) : 0}
//                                         sx={{
//                                             height: 4,
//                                             borderRadius: 999,
//                                             backgroundColor: "var(--color-surface-default)",
//                                             "& .MuiLinearProgress-bar": { borderRadius: 999, backgroundColor: barColor(used, total) },
//                                         }}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                     <p className="text-center text-[11px] text-content-deemphasized/80 mt-3">
//                         Higher limits with Pro — coming soon
//                     </p>
//                 </div>

//                 {/* Danger zone */}
//                 <SettingsGroup title="Danger zone">
//                     <Row
//                         icon={LogOut}
//                         label="Delete account"
//                         danger
//                         action={<span className="text-[11px] text-content-deemphasized">Coming soon</span>}
//                     />
//                 </SettingsGroup>
//             </div>
//         </div>
//     );
// }

















import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Mail,
    Calendar,
    KeyRound,
    LogOut,
    Pencil,
    FileText,
    MessageSquare,
    Trash2,
} from "lucide-react";
import { Button } from "@mui/material";
import Header from "../components/layout/Header.jsx";
import default_avatar from "../assets/default-avatar.png";
import { useAuthStore } from "../store/authStore.js";
import { useUsageQuery, useUpdateProfile } from "../hooks/useUsage.js";
import { GitHubIcon, GoogleIcon } from "../components/common/Icons.jsx";

const TABS = [
    { value: "overview", label: "Overview" },
    { value: "security", label: "Security" },
    { value: "usage", label: "Usage" },
];

const RING_SIZE = 116;
const RING_STROKE = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getMsUntilMidnightUTC() {
    const now = new Date();
    const midnight = new Date(Date.UTC(
        now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0
    ));
    return midnight.getTime() - now.getTime();
}

function formatCountdown(ms) {
    if (ms <= 0) return "0h 0m";
    const totalMinutes = Math.floor(ms / 60000);
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

function formatMemberSince(dateStr) {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(dateStr));
}

function ringColor(used, total) {
    if (!total) return "var(--color-primary)";
    const ratio = used / total;
    if (ratio >= 1) return "var(--color-danger)";
    if (ratio >= 0.8) return "var(--color-warning)";
    return "var(--color-primary)";
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl bg-surface-emphasized p-5">
            <div className="w-9 h-9 rounded-xl bg-surface-default flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
            </div>
            <p className="text-[12px] text-content-deemphasized mb-1">{label}</p>
            <p className="text-[15px] font-medium text-content-default truncate">{value}</p>
        </div>
    );
}

function ConnectedAccountCard({ icon: Icon, label, connected }) {
    return (
        <div className="rounded-2xl bg-surface-emphasized p-5 flex items-center gap-4">
            {Icon && (
                <div className="w-9 h-9 rounded-xl bg-surface-default flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
                </div>
            )}
            <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-content-default">{label}</p>
                <p className="text-[12px] text-content-deemphasized mt-0.5">
                    {connected ? "Connected" : "Not connected"}
                </p>
            </div>
            <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? "bg-success" : "bg-content-deemphasized/25"}`} />
        </div>
    );
}

function ActionCard({ icon: Icon, title, description, buttonLabel, onClick, danger }) {
    return (
        <div className={`rounded-2xl p-5 flex items-center justify-between gap-4 ${danger ? "bg-danger/6" : "bg-surface-emphasized"}`}>
            <div className="flex items-start gap-4 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${danger ? "bg-danger/10" : "bg-surface-default"}`}>
                    <Icon className={`w-4 h-4 ${danger ? "text-danger" : "text-content-deemphasized"}`} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                    <p className={`text-[14px] font-medium ${danger ? "text-danger" : "text-content-default"}`}>{title}</p>
                    <p className="text-[13px] text-content-deemphasized mt-1 leading-relaxed">{description}</p>
                </div>
            </div>
            <Button
                onClick={onClick}
                variant={danger ? "outlined" : "contained"}
                disableElevation
                size="small"
                disabled={!onClick}
                sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    ...(danger
                        ? { color: "var(--color-danger)", borderColor: "var(--color-danger)" }
                        : { bgcolor: "var(--color-primary)", "&:hover": { bgcolor: "var(--color-primary-hover)" } }),
                }}
            >
                {buttonLabel}
            </Button>
        </div>
    );
}

function UsageRing({ icon: Icon, label, used, total }) {
    const progress = total > 0 ? Math.min(1, used / total) : 0;
    const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
    const color = ringColor(used, total);

    return (
        <div className="rounded-2xl bg-surface-emphasized p-6 flex flex-col items-center text-center">
            <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
                    <circle
                        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                        fill="none" strokeWidth={RING_STROKE}
                        className="stroke-surface-default"
                    />
                    <circle
                        cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
                        fill="none" strokeWidth={RING_STROKE} strokeLinecap="round"
                        stroke={color}
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={dashOffset}
                        style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16, 1, 0.3, 1)" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <Icon className="w-4 h-4 text-content-deemphasized" strokeWidth={1.75} />
                    <span className="text-[17px] font-semibold text-content-default tabular-nums tracking-[-0.01em]">
                        {used}/{total}
                    </span>
                </div>
            </div>
            <p className="text-[13px] font-medium text-content-default mt-4">{label}</p>
        </div>
    );
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser); // apne store mein na ho toh safe rahega (optional-chained)
    const handleLogout = useAuthStore((state) => state.handleLogout);

    const [activeTab, setActiveTab] = useState("overview");
    const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useUsageQuery();
    const updateProfile = useUpdateProfile();

    const [isEditingName, setIsEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState(user?.username || user?.name || "");
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (isEditingName) {
            nameInputRef.current?.focus();
            nameInputRef.current?.select();
        }
    }, [isEditingName]);

    const handleSaveName = async () => {
        const trimmed = nameDraft.trim();
        setIsEditingName(false);

        const currentName = user?.username || user?.name || "";
        if (!trimmed || trimmed === currentName) {
            setNameDraft(currentName);
            return;
        }

        try {
            await updateProfile.mutateAsync({ username: trimmed });
            setUser?.({ ...user, username: trimmed });
            toast.success("Name updated");
        } catch (err) {
            setNameDraft(currentName);
            toast.error(err?.response?.data?.detail?.message || "Could not update name");
        }
    };

    const linkedProviders = user?.auth_providers || [];
    
    const isLinked = (provider) => linkedProviders.some((p) => p === provider);

    return (
        <div className="min-h-screen w-full bg-surface-default">
            <Header />

            <div className="mx-auto max-w-3xl px-6 py-10 sm:px-0">
                {/* Hero */}
                <div className="rounded-3xl bg-surface-emphasized p-7 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 mb-8">
                    <img
                        src={user?.avatar || default_avatar}
                        alt=""
                        className="w-20 h-20 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        {isEditingName ? (
                            <input
                                ref={nameInputRef}
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                onBlur={handleSaveName}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") e.target.blur();
                                    if (e.key === "Escape") { setNameDraft(user?.username || user?.name || ""); setIsEditingName(false); }
                                }}
                                className="text-[24px] font-semibold bg-surface-default outline outline-primary/50 rounded-lg px-3 py-1 text-content-default tracking-[-0.01em] w-full max-w-sm"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => { setNameDraft(user?.username || user?.name || ""); setIsEditingName(true); }}
                                className="group flex items-center gap-2 text-left"
                            >
                                <span className="text-[24px] font-semibold text-content-default tracking-[-0.01em] truncate">
                                    {user?.username || user?.name || "Your account"}
                                </span>
                                <Pencil className="w-4 h-4 text-content-deemphasized opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </button>
                        )}
                        <p className="text-[14px] text-content-deemphasized mt-1">{user?.email}</p>
                        <span className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-full bg-surface-default text-[12px] font-medium text-content-deemphasized">
                            <Calendar className="w-3 h-3" />
                            Member since {formatMemberSince(user?.created_at)}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="inline-flex items-center gap-0.5 rounded-lg bg-surface-emphasized p-1 mb-7">
                    {TABS.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            onClick={() => setActiveTab(t.value)}
                            className={`px-5 py-2 rounded-md text-[13px] font-medium transition-all duration-200 ${activeTab === t.value
                                ? "bg-surface-default text-content-default shadow-sm"
                                : "text-content-deemphasized hover:text-content-default"
                                }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Overview */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoCard icon={Mail} label="Email" value={user?.email} />
                            <InfoCard icon={Calendar} label="Member since" value={formatMemberSince(user?.created_at)} />
                        </div>

                        <div>
                            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-content-deemphasized mb-3">
                                Connected accounts
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ConnectedAccountCard icon={GoogleIcon} label="Google" connected={isLinked("google")} />
                                <ConnectedAccountCard icon={GitHubIcon} label="GitHub" connected={isLinked("github")} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Security */}
                {activeTab === "security" && (
                    <div className="space-y-4">
                        <ActionCard
                            icon={KeyRound}
                            title="Change password"
                            description="We'll email you a one-time code to reset your password."
                            buttonLabel="Change"
                            onClick={() => navigate("/forgot-password")}
                        />
                        <ActionCard
                            icon={LogOut}
                            title="Log out"
                            description="Sign out of DocLens on this device."
                            buttonLabel="Log out"
                            onClick={handleLogout}
                        />

                        <div className="pt-4">
                            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-danger mb-3">
                                Danger zone
                            </h2>
                            <ActionCard
                                icon={Trash2}
                                title="Delete account"
                                description="Permanently delete your account and all notebooks. This can't be undone."
                                buttonLabel="Coming soon"
                                onClick={null}
                                danger
                            />
                        </div>
                    </div>
                )}

                {/* Usage */}
                {activeTab === "usage" && (
                    <div>
                        <div className="flex items-center justify-end mb-4">
                            <span className="text-[12px] text-content-deemphasized">
                                Resets in {formatCountdown(getMsUntilMidnightUTC())}
                            </span>
                        </div>

                        {usageLoading ? (
                            <div className="rounded-2xl bg-surface-emphasized py-16 flex items-center justify-center">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-content-deemphasized/30 border-t-primary" />
                            </div>
                        ) : usageError ? (
                            <div className="rounded-2xl bg-surface-emphasized py-16 flex flex-col items-center justify-center gap-2">
                                <p className="text-[13px] text-content-deemphasized">Couldn't load usage.</p>
                                <button
                                    type="button"
                                    onClick={() => refetchUsage()}
                                    className="text-[13px] font-medium text-primary hover:bg-primary/10 rounded-lg px-3 py-1.5"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <UsageRing
                                    icon={FileText}
                                    label="Documents uploaded"
                                    used={usage?.documents?.used ?? 0}
                                    total={usage?.documents?.total ?? 0}
                                />
                                <UsageRing
                                    icon={MessageSquare}
                                    label="Questions asked"
                                    used={usage?.questions?.used ?? 0}
                                    total={usage?.questions?.total ?? 0}
                                />
                            </div>
                        )}

                        <p className="text-center text-[12px] text-content-deemphasized/80 mt-5">
                            Higher limits with Pro — coming soon
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}