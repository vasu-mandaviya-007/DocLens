

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
                        {/* <ActionCard
                            icon={KeyRound}
                            title="Change password"
                            description="We'll email you a one-time code to reset your password."
                            buttonLabel="Change"
                            onClick={() => navigate("/forgot-password")}
                        /> */}
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








// =====================================================================================================
// COMPLETELY REDISIGNED 
// =====================================================================================================




// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//     Activity,
//     ArrowUpRight,
//     CalendarDays,
//     Check,
//     CheckCircle2,
//     ChevronRight,
//     CircleHelp,
//     Clock3,
//     FileText,
//     Fingerprint,
//     KeyRound,
//     LayoutDashboard,
//     LogOut,
//     Mail,
//     MessageSquareText,
//     Pencil,
//     RefreshCw,
//     ShieldCheck,
//     Sparkles,
//     Trash2,
//     X,
// } from "lucide-react";
// import Header from "../components/layout/Header.jsx";
// import default_avatar from "../assets/default-avatar.png";
// import { useAuthStore } from "../store/authStore.js";
// import { useUsageQuery, useUpdateProfile } from "../hooks/useUsage.js";
// import { GitHubIcon, GoogleIcon } from "../components/common/Icons.jsx";

// const TABS = [
//     { value: "overview", label: "Overview", icon: LayoutDashboard, description: "Your account at a glance" },
//     { value: "usage", label: "Usage & limits", icon: Activity, description: "Track your DocLens activity" },
//     { value: "security", label: "Security", icon: ShieldCheck, description: "Manage how you sign in" },
// ];

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(
//         Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
//     );
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const totalMinutes = Math.floor(ms / 60000);
//     return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
// }

// function formatMemberSince(dateString) {
//     if (!dateString) return "Not available";

//     const date = new Date(dateString);
//     if (Number.isNaN(date.getTime())) return "Not available";

//     return new Intl.DateTimeFormat("en-US", {
//         month: "long",
//         year: "numeric",
//     }).format(date);
// }

// function getDisplayName(user) {
//     return user?.username || user?.name || "Your account";
// }

// function SectionHeading({ eyebrow, title, description, action }) {
//     return (
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//                 {eyebrow && (
//                     <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
//                         {eyebrow}
//                     </p>
//                 )}
//                 <h2 className="text-xl font-semibold tracking-[-0.035em] text-content-default sm:text-[22px]">
//                     {title}
//                 </h2>
//                 {description && (
//                     <p className="mt-1.5 max-w-2xl text-sm leading-6 text-content-deemphasized">
//                         {description}
//                     </p>
//                 )}
//             </div>
//             {action}
//         </div>
//     );
// }

// function DetailRow({ icon: Icon, label, value, last = false }) {
//     return (
//         <div className={`flex items-center gap-3.5 py-4 ${last ? "" : "border-b border-content-deemphasized/10"}`}>
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-emphasized text-content-deemphasized">
//                 <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//             </div>
//             <div className="min-w-0 flex-1">
//                 <p className="text-xs text-content-deemphasized">{label}</p>
//                 <p className="mt-1 break-words text-sm font-medium text-content-default">{value || "Not available"}</p>
//             </div>
//         </div>
//     );
// }

// function ConnectedAccountRow({ icon: Icon, label, connected, description }) {
//     return (
//         <div className="flex items-center gap-3.5 rounded-2xl border border-content-deemphasized/10 bg-surface-default p-4 transition-colors hover:border-content-deemphasized/20 sm:p-5">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-emphasized">
//                 {Icon ? <Icon className="h-[19px] w-[19px] text-content-default" strokeWidth={1.8} /> : null}
//             </div>
//             <div className="min-w-0 flex-1">
//                 <p className="text-sm font-semibold text-content-default">{label}</p>
//                 <p className="mt-1 text-xs leading-5 text-content-deemphasized">{description}</p>
//             </div>
//             <span
//                 className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${connected
//                         ? "bg-success/10 text-success"
//                         : "bg-surface-emphasized text-content-deemphasized"
//                     }`}
//             >
//                 <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-content-deemphasized/40"}`} />
//                 {connected ? "Connected" : "Not linked"}
//             </span>
//         </div>
//     );
// }

// function SettingAction({ icon: Icon, title, description, buttonLabel, onClick, danger = false, disabled = false }) {
//     return (
//         <div className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${danger ? "border-danger/20 bg-danger/5" : "border-content-deemphasized/10 bg-surface-default"
//             }`}>
//             <div className="flex min-w-0 items-start gap-3.5">
//                 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-danger/10 text-danger" : "bg-surface-emphasized text-content-deemphasized"
//                     }`}>
//                     <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//                 </div>
//                 <div className="min-w-0">
//                     <h3 className={`text-sm font-semibold ${danger ? "text-danger" : "text-content-default"}`}>{title}</h3>
//                     <p className="mt-1 max-w-xl text-[13px] leading-5 text-content-deemphasized">{description}</p>
//                 </div>
//             </div>
//             <button
//                 type="button"
//                 onClick={onClick || undefined}
//                 disabled={disabled || !onClick}
//                 className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default disabled:cursor-not-allowed disabled:opacity-50 ${danger
//                         ? "border border-danger/30 text-danger hover:bg-danger/10"
//                         : "bg-surface-emphasized text-content-default hover:bg-primary/10 hover:text-primary"
//                     }`}
//             >
//                 {buttonLabel}
//                 {!danger && !disabled && <ChevronRight className="h-3.5 w-3.5" />}
//             </button>
//         </div>
//     );
// }

// function UsageMetric({ icon: Icon, title, description, used = 0, total = 0 }) {
//     const safeUsed = Number.isFinite(Number(used)) ? Math.max(0, Number(used)) : 0;
//     const safeTotal = Number.isFinite(Number(total)) ? Math.max(0, Number(total)) : 0;
//     const hasLimit = safeTotal > 0;
//     const progress = hasLimit ? Math.min(100, (safeUsed / safeTotal) * 100) : 0;
//     const isExceeded = hasLimit && safeUsed >= safeTotal;
//     const isNearLimit = hasLimit && progress >= 80 && !isExceeded;
//     const status = !hasLimit ? "Limit unavailable" : isExceeded ? "Limit reached" : isNearLimit ? "Almost at limit" : "Within limit";
//     const progressColor = isExceeded ? "bg-danger" : isNearLimit ? "bg-warning" : "bg-primary";
//     const statusStyle = isExceeded
//         ? "bg-danger/10 text-danger"
//         : isNearLimit
//             ? "bg-warning/10 text-warning"
//             : "bg-surface-emphasized text-content-deemphasized";

//     return (
//         <article className="rounded-2xl border border-content-deemphasized/10 bg-surface-default p-5 sm:p-6">
//             <div className="flex items-start justify-between gap-4">
//                 <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                         <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="text-sm font-semibold text-content-default">{title}</h3>
//                         <p className="mt-1 text-xs text-content-deemphasized">{description}</p>
//                     </div>
//                 </div>
//                 <span className={`hidden shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:inline-flex ${statusStyle}`}>
//                     {status}
//                 </span>
//             </div>

//             <div className="mt-7 flex items-end justify-between gap-3">
//                 <div className="flex items-baseline gap-1.5">
//                     <span className="text-[34px] font-semibold leading-none tracking-[-0.055em] text-content-default tabular-nums">
//                         {safeUsed.toLocaleString()}
//                     </span>
//                     <span className="text-sm text-content-deemphasized">/ {hasLimit ? safeTotal.toLocaleString() : "—"}</span>
//                 </div>
//                 {hasLimit && <span className="text-xs font-medium text-content-deemphasized tabular-nums">{Math.round(progress)}% used</span>}
//             </div>

//             <div
//                 className="mt-4 h-2 overflow-hidden rounded-full bg-surface-emphasized"
//                 role="progressbar"
//                 aria-label={`${title} usage`}
//                 aria-valuemin={0}
//                 aria-valuemax={hasLimit ? safeTotal : 100}
//                 aria-valuenow={hasLimit ? Math.min(safeUsed, safeTotal) : 0}
//             >
//                 <div
//                     className={`h-full rounded-full transition-[width] duration-700 ease-out ${progressColor}`}
//                     style={{ width: `${progress}%` }}
//                 />
//             </div>
//             <p className="mt-3 text-xs leading-5 text-content-deemphasized">
//                 {hasLimit
//                     ? `${Math.max(0, safeTotal - safeUsed).toLocaleString()} remaining this period.`
//                     : "Your current usage limit is not available."}
//             </p>
//             <span className={`mt-3 inline-flex rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:hidden ${statusStyle}`}>
//                 {status}
//             </span>
//         </article>
//     );
// }

// function LoadingPanel() {
//     return (
//         <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-14 text-center">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
//                 <RefreshCw className="h-5 w-5 animate-spin" />
//             </div>
//             <p className="mt-4 text-sm font-semibold text-content-default">Loading your activity</p>
//             <p className="mt-1.5 text-xs text-content-deemphasized">Getting the latest usage details.</p>
//         </div>
//     );
// }

// function ErrorPanel({ onRetry }) {
//     return (
//         <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-14 text-center">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
//                 <Activity className="h-5 w-5" />
//             </div>
//             <p className="mt-4 text-sm font-semibold text-content-default">Usage could not be loaded</p>
//             <p className="mt-1.5 max-w-sm text-xs leading-5 text-content-deemphasized">
//                 There was a problem retrieving your activity. Check your connection and try again.
//             </p>
//             <button
//                 type="button"
//                 onClick={onRetry}
//                 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
//             >
//                 <RefreshCw className="h-3.5 w-3.5" />
//                 Try again
//             </button>
//         </div>
//     );
// }

// export default function ProfilePage() {
//     const navigate = useNavigate();
//     const user = useAuthStore((state) => state.user);
//     const setUser = useAuthStore((state) => state.setUser);
//     const handleLogout = useAuthStore((state) => state.handleLogout);
//     const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useUsageQuery();
//     const updateProfile = useUpdateProfile();

//     const [activeTab, setActiveTab] = useState("overview");
//     const [isEditingName, setIsEditingName] = useState(false);
//     const [nameDraft, setNameDraft] = useState(() => getDisplayName(user));
//     const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnightUTC()));
//     const nameInputRef = useRef(null);

//     const displayName = getDisplayName(user);
//     const linkedProviders = Array.isArray(user?.auth_providers) ? user.auth_providers : [];
//     const isLinked = (provider) => linkedProviders.some((item) => item === provider);

//     useEffect(() => {
//         if (isEditingName) {
//             nameInputRef.current?.focus();
//             nameInputRef.current?.select();
//         }
//     }, [isEditingName]);

//     useEffect(() => {
//         const intervalId = window.setInterval(() => {
//             setCountdown(formatCountdown(getMsUntilMidnightUTC()));
//         }, 60000);
//         return () => window.clearInterval(intervalId);
//     }, []);

//     const cancelNameEdit = () => {
//         setNameDraft(displayName);
//         setIsEditingName(false);
//     };

//     const handleSaveName = async (event) => {
//         event?.preventDefault?.();
//         const trimmed = nameDraft.trim();
//         if (!trimmed) {
//             toast.error("Your name cannot be empty");
//             nameInputRef.current?.focus();
//             return;
//         }

//         if (trimmed === displayName) {
//             setIsEditingName(false);
//             return;
//         }

//         try {
//             await updateProfile.mutateAsync({ username: trimmed });
//             setUser?.({ ...user, username: trimmed });
//             setNameDraft(trimmed);
//             setIsEditingName(false);
//             toast.success("Your name has been updated");
//         } catch (error) {
//             const detail = error?.response?.data?.detail;
//             const message = typeof detail === "string" ? detail : detail?.message;
//             toast.error(message || "We couldn't update your name. Please try again.");
//         }
//     };

//     const renderOverview = () => (
//         <div className="space-y-6">
//             <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
//                 <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
//                     <div className="relative shrink-0">
//                         <img
//                             src={user?.avatar || default_avatar}
//                             alt={`${displayName}'s avatar`}
//                             onError={(event) => {
//                                 if (event.currentTarget.src !== default_avatar) event.currentTarget.src = default_avatar;
//                             }}
//                             className="h-[76px] w-[76px] rounded-[24px] border-4 border-surface-default object-cover shadow-sm sm:h-[88px] sm:w-[88px]"
//                         />
//                         <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-surface-default bg-success text-white">
//                             <Check className="h-3 w-3" strokeWidth={3} />
//                         </span>
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <div className="mb-2 flex flex-wrap items-center gap-2">
//                             <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
//                                 <Sparkles className="h-3 w-3" /> DocLens account
//                             </span>
//                             <span className="inline-flex items-center gap-1.5 text-[11px] text-content-deemphasized">
//                                 <CalendarDays className="h-3.5 w-3.5" /> Joined {formatMemberSince(user?.created_at)}
//                             </span>
//                         </div>

//                         {isEditingName ? (
//                             <form onSubmit={handleSaveName} className="flex flex-col gap-2 sm:flex-row sm:items-center">
//                                 <input
//                                     ref={nameInputRef}
//                                     value={nameDraft}
//                                     maxLength={80}
//                                     onChange={(event) => setNameDraft(event.target.value)}
//                                     onKeyDown={(event) => {
//                                         if (event.key === "Escape") cancelNameEdit();
//                                     }}
//                                     aria-label="Display name"
//                                     className="min-w-0 w-full max-w-sm rounded-xl border border-primary/35 bg-surface-default px-3 py-2 text-lg font-semibold tracking-[-0.03em] text-content-default outline-none ring-2 ring-primary/10 transition focus:border-primary/60"
//                                 />
//                                 <div className="flex items-center gap-2">
//                                     <button
//                                         type="submit"
//                                         disabled={updateProfile.isPending}
//                                         className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
//                                     >
//                                         {updateProfile.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
//                                         Save
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={cancelNameEdit}
//                                         disabled={updateProfile.isPending}
//                                         aria-label="Cancel editing name"
//                                         className="flex h-9 w-9 items-center justify-center rounded-xl text-content-deemphasized transition-colors hover:bg-surface-emphasized hover:text-content-default disabled:opacity-50"
//                                     >
//                                         <X className="h-4 w-4" />
//                                     </button>
//                                 </div>
//                             </form>
//                         ) : (
//                             <div className="flex min-w-0 flex-wrap items-center gap-2.5">
//                                 <h2 className="max-w-full truncate text-[25px] font-semibold tracking-[-0.05em] text-content-default sm:text-[30px]">
//                                     {displayName}
//                                 </h2>
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setNameDraft(displayName === "Your account" ? "" : displayName);
//                                         setIsEditingName(true);
//                                     }}
//                                     aria-label="Edit display name"
//                                     className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-content-deemphasized transition-colors hover:bg-surface-emphasized hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
//                                 >
//                                     <Pencil className="h-3.5 w-3.5" />
//                                 </button>
//                             </div>
//                         )}
//                         <p className="mt-1.5 break-all text-sm text-content-deemphasized">{user?.email || "No email address available"}</p>
//                     </div>

//                     <div className="hidden shrink-0 sm:block">
//                         <div className="flex items-center gap-2 rounded-2xl border border-content-deemphasized/10 bg-surface-default/80 px-3.5 py-3">
//                             <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success">
//                                 <CheckCircle2 className="h-4 w-4" />
//                             </span>
//                             <div>
//                                 <p className="text-xs font-semibold text-content-default">Account active</p>
//                                 <p className="mt-0.5 text-[10px] text-content-deemphasized">Ready to use DocLens</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Your details"
//                     title="Account information"
//                     description="The essential details associated with your DocLens account."
//                 />
//                 <div className="rounded-2xl border border-content-deemphasized/10 bg-surface-default px-4 sm:px-5">
//                     <DetailRow icon={Mail} label="Email address" value={user?.email} />
//                     <DetailRow icon={CalendarDays} label="Member since" value={formatMemberSince(user?.created_at)} last />
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Sign-in methods"
//                     title="Connected accounts"
//                     description="See which external accounts are linked to your profile."
//                 />
//                 <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
//                     <ConnectedAccountRow
//                         icon={GoogleIcon}
//                         label="Google"
//                         connected={isLinked("google")}
//                         description={isLinked("google") ? "You can sign in with Google." : "Google sign-in is not linked to this account."}
//                     />
//                     <ConnectedAccountRow
//                         icon={GitHubIcon}
//                         label="GitHub"
//                         connected={isLinked("github")}
//                         description={isLinked("github") ? "You can sign in with GitHub." : "GitHub sign-in is not linked to this account."}
//                     />
//                 </div>
//             </section>
//         </div>
//     );

//     const renderUsage = () => (
//         <div className="space-y-6">
//             <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
//                 <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//                     <div>
//                         <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
//                             <Activity className="h-3 w-3" /> Activity overview
//                         </span>
//                         <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-content-default sm:text-[30px]">Your usage, at a glance.</h2>
//                         <p className="mt-2 max-w-lg text-sm leading-6 text-content-deemphasized">
//                             Keep track of your document uploads and questions so you know where you stand.
//                         </p>
//                     </div>
//                     <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-content-deemphasized/10 bg-surface-default/80 px-4 py-3.5">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                             <Clock3 className="h-[18px] w-[18px]" />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-deemphasized">Daily reset</p>
//                             <p className="mt-1 text-sm font-semibold tabular-nums text-content-default">{countdown}</p>
//                             <p className="mt-0.5 text-[10px] text-content-deemphasized">Time remaining (UTC)</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {usageLoading ? (
//                 <LoadingPanel />
//             ) : usageError ? (
//                 <ErrorPanel onRetry={() => refetchUsage()} />
//             ) : (
//                 <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//                     <UsageMetric
//                         icon={FileText}
//                         title="Documents uploaded"
//                         description="Documents added to your workspace"
//                         used={usage?.documents?.used ?? 0}
//                         total={usage?.documents?.total ?? 0}
//                     />
//                     <UsageMetric
//                         icon={MessageSquareText}
//                         title="Questions asked"
//                         description="Questions sent to your documents"
//                         used={usage?.questions?.used ?? 0}
//                         total={usage?.questions?.total ?? 0}
//                     />
//                 </div>
//             )}

//             <div className="flex items-start gap-3 rounded-2xl border border-content-deemphasized/10 bg-surface-emphasized/60 p-4">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-default text-content-deemphasized">
//                     <CircleHelp className="h-4 w-4" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                     <p className="text-sm font-semibold text-content-default">Need more room to work?</p>
//                     <p className="mt-1 text-xs leading-5 text-content-deemphasized">
//                         Higher limits with DocLens Pro are planned. Your current limits are shown above when available.
//                     </p>
//                 </div>
//                 <span className="mt-0.5 shrink-0 rounded-full bg-surface-default px-2.5 py-1 text-[10px] font-semibold text-content-deemphasized">Coming soon</span>
//             </div>
//         </div>
//     );

//     const renderSecurity = () => (
//         <div className="space-y-6">
//             <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="flex items-start gap-4">
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
//                         <Fingerprint className="h-6 w-6" strokeWidth={1.7} />
//                     </div>
//                     <div>
//                         <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Account protection</p>
//                         <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-content-default">Your account, your control.</h2>
//                         <p className="mt-2 max-w-xl text-sm leading-6 text-content-deemphasized">
//                             Manage your current session and review the available sign-in options for your DocLens account.
//                         </p>
//                     </div>
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Access"
//                     title="Sign-in & sessions"
//                     description="Choose how you want to manage access to your account."
//                 />
//                 <SettingAction
//                     icon={KeyRound}
//                     title="Reset password"
//                     description="Request a password reset link if you sign in using an email and password."
//                     buttonLabel="Reset password"
//                     onClick={() => navigate("/forgot-password")}
//                 />
//                 <SettingAction
//                     icon={LogOut}
//                     title="Sign out of DocLens"
//                     description="End your current session on this device. You may need to sign in again to continue."
//                     buttonLabel="Sign out"
//                     onClick={handleLogout}
//                 />
//             </section>

//             <section className="space-y-3 pt-1">
//                 <SectionHeading
//                     eyebrow="Irreversible actions"
//                     title="Danger zone"
//                     description="These actions can affect your account and saved work."
//                 />
//                 <SettingAction
//                     icon={Trash2}
//                     title="Delete account"
//                     description="Permanently delete your account and its saved data. Account deletion is not available yet."
//                     buttonLabel="Coming soon"
//                     danger
//                     disabled
//                 />
//             </section>
//         </div>
//     );

//     const activeTabInfo = TABS.find((tab) => tab.value === activeTab) || TABS[0];
//     const ActiveTabIcon = activeTabInfo.icon;

//     return (
//         <div className="min-h-screen w-full bg-surface-default text-content-default">
//             <Header />

//             <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8">
//                 <div className="mb-8 flex flex-col gap-3 border-b border-content-deemphasized/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
//                     <div>
//                         <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-content-deemphasized">
//                             <span>DocLens</span>
//                             <span className="h-1 w-1 rounded-full bg-content-deemphasized/50" />
//                             <span>Settings</span>
//                         </div>
//                         <h1 className="text-[30px] font-semibold tracking-[-0.055em] text-content-default sm:text-[38px]">Account settings</h1>
//                         <p className="mt-2 max-w-2xl text-sm leading-6 text-content-deemphasized">
//                             Manage your profile, keep an eye on your activity, and control account access.
//                         </p>
//                     </div>
//                     <div className="inline-flex w-fit items-center gap-2 rounded-full border border-content-deemphasized/10 bg-surface-emphasized/70 px-3 py-2 text-xs font-medium text-content-deemphasized">
//                         <ShieldCheck className="h-3.5 w-3.5 text-success" /> Your account preferences
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8">
//                     <aside className="space-y-4 lg:sticky lg:top-6">
//                         <div className="rounded-3xl border border-content-deemphasized/10 bg-surface-default p-4 shadow-sm shadow-black/[0.02] sm:p-5">
//                             <div className="flex items-center gap-3">
//                                 <img
//                                     src={user?.avatar || default_avatar}
//                                     alt=""
//                                     onError={(event) => {
//                                         if (event.currentTarget.src !== default_avatar) event.currentTarget.src = default_avatar;
//                                     }}
//                                     className="h-12 w-12 shrink-0 rounded-2xl border border-content-deemphasized/10 object-cover"
//                                 />
//                                 <div className="min-w-0 flex-1">
//                                     <p className="truncate text-sm font-semibold text-content-default">{displayName}</p>
//                                     <p className="mt-1 truncate text-xs text-content-deemphasized">{user?.email || "No email available"}</p>
//                                 </div>
//                             </div>
//                             <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/8 px-3 py-2.5">
//                                 <span className="h-1.5 w-1.5 rounded-full bg-success" />
//                                 <span className="text-[11px] font-medium text-content-deemphasized">Profile settings</span>
//                             </div>

//                             <div className="mb-2 mt-6 px-2 text-[10px] font-bold uppercase tracking-[0.15em] text-content-deemphasized">Manage account</div>
//                             <nav aria-label="Account settings sections" className="space-y-1">
//                                 {TABS.map((tab) => {
//                                     const Icon = tab.icon;
//                                     const selected = activeTab === tab.value;
//                                     return (
//                                         <button
//                                             key={tab.value}
//                                             type="button"
//                                             onClick={() => setActiveTab(tab.value)}
//                                             aria-current={selected ? "page" : undefined}
//                                             className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${selected
//                                                     ? "bg-primary/10 text-primary"
//                                                     : "text-content-deemphasized hover:bg-surface-emphasized hover:text-content-default"
//                                                 }`}
//                                         >
//                                             <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${selected ? "bg-surface-default text-primary shadow-sm" : "bg-surface-emphasized text-content-deemphasized group-hover:text-content-default"
//                                                 }`}>
//                                                 <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//                                             </span>
//                                             <span className="min-w-0 flex-1">
//                                                 <span className="block text-[13px] font-semibold">{tab.label}</span>
//                                                 <span className={`mt-0.5 block text-[10px] leading-4 ${selected ? "text-primary/80" : "text-content-deemphasized"}`}>
//                                                     {tab.description}
//                                                 </span>
//                                             </span>
//                                             {selected && <ChevronRight className="h-4 w-4 shrink-0" />}
//                                         </button>
//                                     );
//                                 })}
//                             </nav>
//                         </div>

//                         <div className="rounded-2xl border border-content-deemphasized/10 bg-surface-emphasized/60 p-4">
//                             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-default text-primary">
//                                 <ShieldCheck className="h-[18px] w-[18px]" />
//                             </div>
//                             <p className="mt-3 text-xs font-semibold text-content-default">Your documents matter.</p>
//                             <p className="mt-1.5 text-[11px] leading-5 text-content-deemphasized">
//                                 Review your account details and sign-in methods to help keep your workspace accessible to you.
//                             </p>
//                         </div>

//                         <button
//                             type="button"
//                             onClick={() => navigate("/forgot-password")}
//                             className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-content-deemphasized transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
//                         >
//                             <CircleHelp className="h-3.5 w-3.5" />
//                             Need help signing in?
//                             <ArrowUpRight className="ml-auto h-3.5 w-3.5" />
//                         </button>
//                     </aside>

//                     <section className="min-w-0" aria-labelledby="active-settings-title">
//                         <div className="mb-6 flex items-center gap-3">
//                             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                                 <ActiveTabIcon className="h-[18px] w-[18px]" />
//                             </span>
//                             <div>
//                                 <h2 id="active-settings-title" className="text-sm font-semibold text-content-default">{activeTabInfo.label}</h2>
//                                 <p className="mt-0.5 text-xs text-content-deemphasized">{activeTabInfo.description}</p>
//                             </div>
//                         </div>

//                         {activeTab === "overview" && renderOverview()}
//                         {activeTab === "usage" && renderUsage()}
//                         {activeTab === "security" && renderSecurity()}

//                         <footer className="mt-9 flex flex-col gap-2 border-t border-content-deemphasized/10 pt-5 text-[10px] text-content-deemphasized sm:flex-row sm:items-center sm:justify-between">
//                             <span>DocLens · Account settings</span>
//                             <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Manage your account with care</span>
//                         </footer>
//                     </section>
//                 </div>
//             </main>
//         </div>
//     );
// }












// =====================================================================================================
// MOBILE VIEW CHANGES 
// =====================================================================================================







// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//     Activity,
//     ArrowUpRight,
//     CalendarDays,
//     Check,
//     CheckCircle2,
//     ChevronRight,
//     CircleHelp,
//     Clock3,
//     FileText,
//     Fingerprint,
//     KeyRound,
//     LayoutDashboard,
//     LogOut,
//     Mail,
//     MessageSquareText,
//     Pencil,
//     RefreshCw,
//     ShieldCheck,
//     Sparkles,
//     Trash2,
//     X,
// } from "lucide-react";
// import Header from "../components/layout/Header.jsx";
// import default_avatar from "../assets/default-avatar.png";
// import { useAuthStore } from "../store/authStore.js";
// import { useUsageQuery, useUpdateProfile } from "../hooks/useUsage.js";
// import { GitHubIcon, GoogleIcon } from "../components/common/Icons.jsx";

// const TABS = [
//     { value: "overview", label: "Overview", icon: LayoutDashboard, description: "Your account at a glance" },
//     { value: "usage", label: "Usage & limits", icon: Activity, description: "Track your DocLens activity" },
//     { value: "security", label: "Security", icon: ShieldCheck, description: "Manage how you sign in" },
// ];

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(
//         Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
//     );
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const totalMinutes = Math.floor(ms / 60000);
//     return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
// }

// function formatMemberSince(dateString) {
//     if (!dateString) return "Not available";

//     const date = new Date(dateString);
//     if (Number.isNaN(date.getTime())) return "Not available";

//     return new Intl.DateTimeFormat("en-US", {
//         month: "long",
//         year: "numeric",
//     }).format(date);
// }

// function getDisplayName(user) {
//     return user?.username || user?.name || "Your account";
// }

// function SectionHeading({ eyebrow, title, description, action }) {
//     return (
//         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//             <div>
//                 {eyebrow && (
//                     <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
//                         {eyebrow}
//                     </p>
//                 )}
//                 <h2 className="text-xl font-semibold tracking-[-0.035em] text-content-default sm:text-[22px]">
//                     {title}
//                 </h2>
//                 {description && (
//                     <p className="mt-1.5 max-w-2xl text-sm leading-6 text-content-deemphasized">
//                         {description}
//                     </p>
//                 )}
//             </div>
//             {action}
//         </div>
//     );
// }

// function DetailRow({ icon: Icon, label, value, last = false }) {
//     return (
//         <div className={`flex items-center gap-3.5 py-4 ${last ? "" : "border-b border-content-deemphasized/10"}`}>
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-emphasized text-content-deemphasized">
//                 <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//             </div>
//             <div className="min-w-0 flex-1">
//                 <p className="text-xs text-content-deemphasized">{label}</p>
//                 <p className="mt-1 break-words text-sm font-medium text-content-default">{value || "Not available"}</p>
//             </div>
//         </div>
//     );
// }

// function ConnectedAccountRow({ icon: Icon, label, connected, description }) {
//     return (
//         <div className="flex items-center gap-3.5 rounded-2xl border border-content-deemphasized/10 bg-surface-default p-4 transition-colors hover:border-content-deemphasized/20 sm:p-5">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-emphasized">
//                 {Icon ? <Icon className="h-[19px] w-[19px] text-content-default" strokeWidth={1.8} /> : null}
//             </div>
//             <div className="min-w-0 flex-1">
//                 <p className="text-sm font-semibold text-content-default">{label}</p>
//                 <p className="mt-1 text-xs leading-5 text-content-deemphasized">{description}</p>
//             </div>
//             <span
//                 className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${connected
//                         ? "bg-success/10 text-success"
//                         : "bg-surface-emphasized text-content-deemphasized"
//                     }`}
//             >
//                 <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success" : "bg-content-deemphasized/40"}`} />
//                 {connected ? "Connected" : "Not linked"}
//             </span>
//         </div>
//     );
// }

// function SettingAction({ icon: Icon, title, description, buttonLabel, onClick, danger = false, disabled = false }) {
//     return (
//         <div className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${danger ? "border-danger/20 bg-danger/5" : "border-content-deemphasized/10 bg-surface-default"
//             }`}>
//             <div className="flex min-w-0 items-start gap-3.5">
//                 <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-danger/10 text-danger" : "bg-surface-emphasized text-content-deemphasized"
//                     }`}>
//                     <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//                 </div>
//                 <div className="min-w-0">
//                     <h3 className={`text-sm font-semibold ${danger ? "text-danger" : "text-content-default"}`}>{title}</h3>
//                     <p className="mt-1 max-w-xl text-[13px] leading-5 text-content-deemphasized">{description}</p>
//                 </div>
//             </div>
//             <button
//                 type="button"
//                 onClick={onClick || undefined}
//                 disabled={disabled || !onClick}
//                 className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-default disabled:cursor-not-allowed disabled:opacity-50 ${danger
//                         ? "border border-danger/30 text-danger hover:bg-danger/10"
//                         : "bg-surface-emphasized text-content-default hover:bg-primary/10 hover:text-primary"
//                     }`}
//             >
//                 {buttonLabel}
//                 {!danger && !disabled && <ChevronRight className="h-3.5 w-3.5" />}
//             </button>
//         </div>
//     );
// }

// function UsageMetric({ icon: Icon, title, description, used = 0, total = 0 }) {
//     const safeUsed = Number.isFinite(Number(used)) ? Math.max(0, Number(used)) : 0;
//     const safeTotal = Number.isFinite(Number(total)) ? Math.max(0, Number(total)) : 0;
//     const hasLimit = safeTotal > 0;
//     const progress = hasLimit ? Math.min(100, (safeUsed / safeTotal) * 100) : 0;
//     const isExceeded = hasLimit && safeUsed >= safeTotal;
//     const isNearLimit = hasLimit && progress >= 80 && !isExceeded;
//     const status = !hasLimit ? "Limit unavailable" : isExceeded ? "Limit reached" : isNearLimit ? "Almost at limit" : "Within limit";
//     const progressColor = isExceeded ? "bg-danger" : isNearLimit ? "bg-warning" : "bg-primary";
//     const statusStyle = isExceeded
//         ? "bg-danger/10 text-danger"
//         : isNearLimit
//             ? "bg-warning/10 text-warning"
//             : "bg-surface-emphasized text-content-deemphasized";

//     return (
//         <article className="rounded-2xl border border-content-deemphasized/10 bg-surface-default p-5 sm:p-6">
//             <div className="flex items-start justify-between gap-4">
//                 <div className="flex min-w-0 items-center gap-3">
//                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                         <Icon className="h-[19px] w-[19px]" strokeWidth={1.8} />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="text-sm font-semibold text-content-default">{title}</h3>
//                         <p className="mt-1 text-xs text-content-deemphasized">{description}</p>
//                     </div>
//                 </div>
//                 <span className={`hidden shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:inline-flex ${statusStyle}`}>
//                     {status}
//                 </span>
//             </div>

//             <div className="mt-7 flex items-end justify-between gap-3">
//                 <div className="flex items-baseline gap-1.5">
//                     <span className="text-[34px] font-semibold leading-none tracking-[-0.055em] text-content-default tabular-nums">
//                         {safeUsed.toLocaleString()}
//                     </span>
//                     <span className="text-sm text-content-deemphasized">/ {hasLimit ? safeTotal.toLocaleString() : "—"}</span>
//                 </div>
//                 {hasLimit && <span className="text-xs font-medium text-content-deemphasized tabular-nums">{Math.round(progress)}% used</span>}
//             </div>

//             <div
//                 className="mt-4 h-2 overflow-hidden rounded-full bg-surface-emphasized"
//                 role="progressbar"
//                 aria-label={`${title} usage`}
//                 aria-valuemin={0}
//                 aria-valuemax={hasLimit ? safeTotal : 100}
//                 aria-valuenow={hasLimit ? Math.min(safeUsed, safeTotal) : 0}
//             >
//                 <div
//                     className={`h-full rounded-full transition-[width] duration-700 ease-out ${progressColor}`}
//                     style={{ width: `${progress}%` }}
//                 />
//             </div>
//             <p className="mt-3 text-xs leading-5 text-content-deemphasized">
//                 {hasLimit
//                     ? `${Math.max(0, safeTotal - safeUsed).toLocaleString()} remaining this period.`
//                     : "Your current usage limit is not available."}
//             </p>
//             <span className={`mt-3 inline-flex rounded-full px-2.5 py-1.5 text-[10px] font-semibold sm:hidden ${statusStyle}`}>
//                 {status}
//             </span>
//         </article>
//     );
// }

// function LoadingPanel() {
//     return (
//         <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-14 text-center">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
//                 <RefreshCw className="h-5 w-5 animate-spin" />
//             </div>
//             <p className="mt-4 text-sm font-semibold text-content-default">Loading your activity</p>
//             <p className="mt-1.5 text-xs text-content-deemphasized">Getting the latest usage details.</p>
//         </div>
//     );
// }

// function ErrorPanel({ onRetry }) {
//     return (
//         <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-14 text-center">
//             <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
//                 <Activity className="h-5 w-5" />
//             </div>
//             <p className="mt-4 text-sm font-semibold text-content-default">Usage could not be loaded</p>
//             <p className="mt-1.5 max-w-sm text-xs leading-5 text-content-deemphasized">
//                 There was a problem retrieving your activity. Check your connection and try again.
//             </p>
//             <button
//                 type="button"
//                 onClick={onRetry}
//                 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
//             >
//                 <RefreshCw className="h-3.5 w-3.5" />
//                 Try again
//             </button>
//         </div>
//     );
// }

// export default function ProfilePage() {
//     const navigate = useNavigate();
//     const user = useAuthStore((state) => state.user);
//     const setUser = useAuthStore((state) => state.setUser);
//     const handleLogout = useAuthStore((state) => state.handleLogout);
//     const { data: usage, isLoading: usageLoading, isError: usageError, refetch: refetchUsage } = useUsageQuery();
//     const updateProfile = useUpdateProfile();

//     const [activeTab, setActiveTab] = useState("overview");
//     const [isEditingName, setIsEditingName] = useState(false);
//     const [nameDraft, setNameDraft] = useState(() => getDisplayName(user));
//     const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnightUTC()));
//     const nameInputRef = useRef(null);

//     const displayName = getDisplayName(user);
//     const linkedProviders = Array.isArray(user?.auth_providers) ? user.auth_providers : [];
//     const isLinked = (provider) => linkedProviders.some((item) => item === provider);

//     useEffect(() => {
//         if (isEditingName) {
//             nameInputRef.current?.focus();
//             nameInputRef.current?.select();
//         }
//     }, [isEditingName]);

//     useEffect(() => {
//         const intervalId = window.setInterval(() => {
//             setCountdown(formatCountdown(getMsUntilMidnightUTC()));
//         }, 60000);
//         return () => window.clearInterval(intervalId);
//     }, []);

//     const cancelNameEdit = () => {
//         setNameDraft(displayName);
//         setIsEditingName(false);
//     };

//     const handleSaveName = async (event) => {
//         event?.preventDefault?.();
//         const trimmed = nameDraft.trim();
//         if (!trimmed) {
//             toast.error("Your name cannot be empty");
//             nameInputRef.current?.focus();
//             return;
//         }

//         if (trimmed === displayName) {
//             setIsEditingName(false);
//             return;
//         }

//         try {
//             await updateProfile.mutateAsync({ username: trimmed });
//             setUser?.({ ...user, username: trimmed });
//             setNameDraft(trimmed);
//             setIsEditingName(false);
//             toast.success("Your name has been updated");
//         } catch (error) {
//             const detail = error?.response?.data?.detail;
//             const message = typeof detail === "string" ? detail : detail?.message;
//             toast.error(message || "We couldn't update your name. Please try again.");
//         }
//     };

//     const renderOverview = () => (
//         <div className="space-y-6">
//             <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
//                 <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
//                     <div className="relative shrink-0">
//                         <img
//                             src={user?.avatar || default_avatar}
//                             alt={`${displayName}'s avatar`}
//                             onError={(event) => {
//                                 if (event.currentTarget.src !== default_avatar) event.currentTarget.src = default_avatar;
//                             }}
//                             className="h-[76px] w-[76px] rounded-[24px] border-4 border-surface-default object-cover shadow-sm sm:h-[88px] sm:w-[88px]"
//                         />
//                         <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-surface-default bg-success text-white">
//                             <Check className="h-3 w-3" strokeWidth={3} />
//                         </span>
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <div className="mb-2 flex flex-wrap items-center gap-2">
//                             <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
//                                 <Sparkles className="h-3 w-3" /> DocLens account
//                             </span>
//                             <span className="inline-flex items-center gap-1.5 text-[11px] text-content-deemphasized">
//                                 <CalendarDays className="h-3.5 w-3.5" /> Joined {formatMemberSince(user?.created_at)}
//                             </span>
//                         </div>

//                         {isEditingName ? (
//                             <form onSubmit={handleSaveName} className="flex flex-col gap-2 sm:flex-row sm:items-center">
//                                 <input
//                                     ref={nameInputRef}
//                                     value={nameDraft}
//                                     maxLength={80}
//                                     onChange={(event) => setNameDraft(event.target.value)}
//                                     onKeyDown={(event) => {
//                                         if (event.key === "Escape") cancelNameEdit();
//                                     }}
//                                     aria-label="Display name"
//                                     className="min-w-0 w-full max-w-sm rounded-xl border border-primary/35 bg-surface-default px-3 py-2 text-lg font-semibold tracking-[-0.03em] text-content-default outline-none ring-2 ring-primary/10 transition focus:border-primary/60"
//                                 />
//                                 <div className="flex items-center gap-2">
//                                     <button
//                                         type="submit"
//                                         disabled={updateProfile.isPending}
//                                         className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
//                                     >
//                                         {updateProfile.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
//                                         Save
//                                     </button>
//                                     <button
//                                         type="button"
//                                         onClick={cancelNameEdit}
//                                         disabled={updateProfile.isPending}
//                                         aria-label="Cancel editing name"
//                                         className="flex h-9 w-9 items-center justify-center rounded-xl text-content-deemphasized transition-colors hover:bg-surface-emphasized hover:text-content-default disabled:opacity-50"
//                                     >
//                                         <X className="h-4 w-4" />
//                                     </button>
//                                 </div>
//                             </form>
//                         ) : (
//                             <div className="flex min-w-0 flex-wrap items-center gap-2.5">
//                                 <h2 className="max-w-full truncate text-[25px] font-semibold tracking-[-0.05em] text-content-default sm:text-[30px]">
//                                     {displayName}
//                                 </h2>
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setNameDraft(displayName === "Your account" ? "" : displayName);
//                                         setIsEditingName(true);
//                                     }}
//                                     aria-label="Edit display name"
//                                     className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-content-deemphasized transition-colors hover:bg-surface-emphasized hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
//                                 >
//                                     <Pencil className="h-3.5 w-3.5" />
//                                 </button>
//                             </div>
//                         )}
//                         <p className="mt-1.5 break-all text-sm text-content-deemphasized">{user?.email || "No email address available"}</p>
//                     </div>

//                     <div className="hidden shrink-0 sm:block">
//                         <div className="flex items-center gap-2 rounded-2xl border border-content-deemphasized/10 bg-surface-default/80 px-3.5 py-3">
//                             <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-success/10 text-success">
//                                 <CheckCircle2 className="h-4 w-4" />
//                             </span>
//                             <div>
//                                 <p className="text-xs font-semibold text-content-default">Account active</p>
//                                 <p className="mt-0.5 text-[10px] text-content-deemphasized">Ready to use DocLens</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Your details"
//                     title="Account information"
//                     description="The essential details associated with your DocLens account."
//                 />
//                 <div className="rounded-2xl border border-content-deemphasized/10 bg-surface-default px-4 sm:px-5">
//                     <DetailRow icon={Mail} label="Email address" value={user?.email} />
//                     <DetailRow icon={CalendarDays} label="Member since" value={formatMemberSince(user?.created_at)} last />
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Sign-in methods"
//                     title="Connected accounts"
//                     description="See which external accounts are linked to your profile."
//                 />
//                 <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
//                     <ConnectedAccountRow
//                         icon={GoogleIcon}
//                         label="Google"
//                         connected={isLinked("google")}
//                         description={isLinked("google") ? "You can sign in with Google." : "Google sign-in is not linked to this account."}
//                     />
//                     <ConnectedAccountRow
//                         icon={GitHubIcon}
//                         label="GitHub"
//                         connected={isLinked("github")}
//                         description={isLinked("github") ? "You can sign in with GitHub." : "GitHub sign-in is not linked to this account."}
//                     />
//                 </div>
//             </section>
//         </div>
//     );

//     const renderUsage = () => (
//         <div className="space-y-6">
//             <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
//                 <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//                     <div>
//                         <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
//                             <Activity className="h-3 w-3" /> Activity overview
//                         </span>
//                         <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-content-default sm:text-[30px]">Your usage, at a glance.</h2>
//                         <p className="mt-2 max-w-lg text-sm leading-6 text-content-deemphasized">
//                             Keep track of your document uploads and questions so you know where you stand.
//                         </p>
//                     </div>
//                     <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-content-deemphasized/10 bg-surface-default/80 px-4 py-3.5">
//                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                             <Clock3 className="h-[18px] w-[18px]" />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-content-deemphasized">Daily reset</p>
//                             <p className="mt-1 text-sm font-semibold tabular-nums text-content-default">{countdown}</p>
//                             <p className="mt-0.5 text-[10px] text-content-deemphasized">Time remaining (UTC)</p>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {usageLoading ? (
//                 <LoadingPanel />
//             ) : usageError ? (
//                 <ErrorPanel onRetry={() => refetchUsage()} />
//             ) : (
//                 <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//                     <UsageMetric
//                         icon={FileText}
//                         title="Documents uploaded"
//                         description="Documents added to your workspace"
//                         used={usage?.documents?.used ?? 0}
//                         total={usage?.documents?.total ?? 0}
//                     />
//                     <UsageMetric
//                         icon={MessageSquareText}
//                         title="Questions asked"
//                         description="Questions sent to your documents"
//                         used={usage?.questions?.used ?? 0}
//                         total={usage?.questions?.total ?? 0}
//                     />
//                 </div>
//             )}

//             <div className="flex items-start gap-3 rounded-2xl border border-content-deemphasized/10 bg-surface-emphasized/60 p-4">
//                 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-default text-content-deemphasized">
//                     <CircleHelp className="h-4 w-4" />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                     <p className="text-sm font-semibold text-content-default">Need more room to work?</p>
//                     <p className="mt-1 text-xs leading-5 text-content-deemphasized">
//                         Higher limits with DocLens Pro are planned. Your current limits are shown above when available.
//                     </p>
//                 </div>
//                 <span className="mt-0.5 shrink-0 rounded-full bg-surface-default px-2.5 py-1 text-[10px] font-semibold text-content-deemphasized">Coming soon</span>
//             </div>
//         </div>
//     );

//     const renderSecurity = () => (
//         <div className="space-y-6">
//             <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized p-5 sm:p-7">
//                 <div className="flex items-start gap-4">
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
//                         <Fingerprint className="h-6 w-6" strokeWidth={1.7} />
//                     </div>
//                     <div>
//                         <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Account protection</p>
//                         <h2 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-content-default">Your account, your control.</h2>
//                         <p className="mt-2 max-w-xl text-sm leading-6 text-content-deemphasized">
//                             Manage your current session and review the available sign-in options for your DocLens account.
//                         </p>
//                     </div>
//                 </div>
//             </section>

//             <section className="space-y-3">
//                 <SectionHeading
//                     eyebrow="Access"
//                     title="Sign-in & sessions"
//                     description="Choose how you want to manage access to your account."
//                 />
//                 <SettingAction
//                     icon={KeyRound}
//                     title="Reset password"
//                     description="Request a password reset link if you sign in using an email and password."
//                     buttonLabel="Reset password"
//                     onClick={() => navigate("/forgot-password")}
//                 />
//                 <SettingAction
//                     icon={LogOut}
//                     title="Sign out of DocLens"
//                     description="End your current session on this device. You may need to sign in again to continue."
//                     buttonLabel="Sign out"
//                     onClick={handleLogout}
//                 />
//             </section>

//             <section className="space-y-3 pt-1">
//                 <SectionHeading
//                     eyebrow="Irreversible actions"
//                     title="Danger zone"
//                     description="These actions can affect your account and saved work."
//                 />
//                 <SettingAction
//                     icon={Trash2}
//                     title="Delete account"
//                     description="Permanently delete your account and its saved data. Account deletion is not available yet."
//                     buttonLabel="Coming soon"
//                     danger
//                     disabled
//                 />
//             </section>
//         </div>
//     );

//     const activeTabInfo = TABS.find((tab) => tab.value === activeTab) || TABS[0];
//     const ActiveTabIcon = activeTabInfo.icon;

//     return (
//         <div className="min-h-screen w-full bg-surface-default text-content-default">
//             <Header />

//             <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-8">
//                 <div className="mb-8 flex flex-col gap-3 border-b border-content-deemphasized/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
//                     <div>
//                         <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-content-deemphasized">
//                             <span>DocLens</span>
//                             <span className="h-1 w-1 rounded-full bg-content-deemphasized/50" />
//                             <span>Settings</span>
//                         </div>
//                         <h1 className="text-[30px] font-semibold tracking-[-0.055em] text-content-default sm:text-[38px]">Account settings</h1>
//                         <p className="mt-2 max-w-2xl text-sm leading-6 text-content-deemphasized">
//                             Manage your profile, keep an eye on your activity, and control account access.
//                         </p>
//                     </div>
//                     <div className="inline-flex w-fit items-center gap-2 rounded-full border border-content-deemphasized/10 bg-surface-emphasized/70 px-3 py-2 text-xs font-medium text-content-deemphasized">
//                         <ShieldCheck className="h-3.5 w-3.5 text-success" /> Your account preferences
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8">
//                     <aside className="space-y-4 lg:sticky lg:top-6">
//                         <div className="rounded-3xl border border-content-deemphasized/10 bg-surface-default p-4 shadow-sm shadow-black/[0.02] sm:p-5">
//                             <div className="flex items-center gap-3">
//                                 <img
//                                     src={user?.avatar || default_avatar}
//                                     alt=""
//                                     onError={(event) => {
//                                         if (event.currentTarget.src !== default_avatar) event.currentTarget.src = default_avatar;
//                                     }}
//                                     className="h-12 w-12 shrink-0 rounded-2xl border border-content-deemphasized/10 object-cover"
//                                 />
//                                 <div className="min-w-0 flex-1">
//                                     <p className="truncate text-sm font-semibold text-content-default">{displayName}</p>
//                                     <p className="mt-1 truncate text-xs text-content-deemphasized">{user?.email || "No email available"}</p>
//                                 </div>
//                             </div>
//                             <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/8 px-3 py-2.5">
//                                 <span className="h-1.5 w-1.5 rounded-full bg-success" />
//                                 <span className="text-[11px] font-medium text-content-deemphasized">Profile settings</span>
//                             </div>

//                             <div className="mb-3 mt-5 px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-content-deemphasized lg:mb-2 lg:mt-6 lg:px-2">
//                                 <span className="lg:hidden">Choose a section</span>
//                                 <span className="hidden lg:inline">Manage account</span>
//                             </div>
//                             <nav
//                                 aria-label="Account settings sections"
//                                 role="tablist"
//                                 className="grid grid-cols-3 gap-2 lg:block lg:space-y-1"
//                             >
//                                 {TABS.map((tab) => {
//                                     const Icon = tab.icon;
//                                     const selected = activeTab === tab.value;
//                                     return (
//                                         <button
//                                             key={tab.value}
//                                             id={`settings-tab-${tab.value}`}
//                                             type="button"
//                                             role="tab"
//                                             aria-selected={selected}
//                                             aria-controls="active-settings-panel"
//                                             tabIndex={selected ? 0 : -1}
//                                             onClick={() => setActiveTab(tab.value)}
//                                             onKeyDown={(event) => {
//                                                 const currentIndex = TABS.findIndex((item) => item.value === activeTab);
//                                                 let nextIndex = currentIndex;
//                                                 if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
//                                                 else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
//                                                 else if (event.key === "Home") nextIndex = 0;
//                                                 else if (event.key === "End") nextIndex = TABS.length - 1;
//                                                 else return;
//                                                 event.preventDefault();
//                                                 const nextTab = TABS[nextIndex];
//                                                 setActiveTab(nextTab.value);
//                                                 document.getElementById(`settings-tab-${nextTab.value}`)?.focus();
//                                             }}
//                                             className={`group relative flex min-h-[76px] min-w-0 flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:min-h-0 lg:flex-row lg:items-center lg:gap-3 lg:border-0 lg:px-3 lg:py-3 lg:text-left ${selected
//                                                     ? "border-primary bg-primary text-white shadow-sm shadow-primary/20 lg:bg-primary/10 lg:text-primary lg:shadow-none"
//                                                     : "border-content-deemphasized/10 bg-surface-emphasized text-content-deemphasized hover:border-primary/30 hover:bg-primary/5 hover:text-content-default lg:border-transparent lg:bg-transparent lg:hover:bg-surface-emphasized"
//                                                 }`}
//                                         >
//                                             <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors lg:h-9 lg:w-9 ${selected
//                                                     ? "bg-white/15 text-white lg:bg-surface-default lg:text-primary lg:shadow-sm"
//                                                     : "bg-surface-default text-content-deemphasized group-hover:text-content-default lg:bg-surface-emphasized"
//                                                 }`}>
//                                                 <Icon className="h-[17px] w-[17px]" strokeWidth={1.9} />
//                                             </span>
//                                             <span className="min-w-0 flex-1">
//                                                 <span className="block text-[11px] font-semibold leading-tight sm:text-xs lg:text-[13px]">{tab.label}</span>
//                                                 <span className={`mt-0.5 hidden text-[10px] leading-4 lg:block ${selected ? "text-primary/80" : "text-content-deemphasized"}`}>
//                                                     {tab.description}
//                                                 </span>
//                                             </span>
//                                             {selected && <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-white lg:hidden" />}
//                                             {selected && <ChevronRight className="ml-auto hidden h-4 w-4 shrink-0 lg:block" />}
//                                         </button>
//                                     );
//                                 })}
//                             </nav>
//                         </div>

//                         <div className="hidden rounded-2xl border border-content-deemphasized/10 bg-surface-emphasized/60 p-4 lg:block">
//                             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-default text-primary">
//                                 <ShieldCheck className="h-[18px] w-[18px]" />
//                             </div>
//                             <p className="mt-3 text-xs font-semibold text-content-default">Your documents matter.</p>
//                             <p className="mt-1.5 text-[11px] leading-5 text-content-deemphasized">
//                                 Review your account details and sign-in methods to help keep your workspace accessible to you.
//                             </p>
//                         </div>

//                         <button
//                             type="button"
//                             onClick={() => navigate("/forgot-password")}
//                             className="hidden w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-content-deemphasized transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 lg:flex"
//                         >
//                             <CircleHelp className="h-3.5 w-3.5" />
//                             Need help signing in?
//                             <ArrowUpRight className="ml-auto h-3.5 w-3.5" />
//                         </button>
//                     </aside>

//                     <section
//                         id="active-settings-panel"
//                         role="tabpanel"
//                         tabIndex={0}
//                         className="min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-default"
//                         aria-labelledby="active-settings-title"
//                     >
//                         <div className="mb-6 flex items-center gap-3">
//                             <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                                 <ActiveTabIcon className="h-[18px] w-[18px]" />
//                             </span>
//                             <div>
//                                 <h2 id="active-settings-title" className="text-sm font-semibold text-content-default">{activeTabInfo.label}</h2>
//                                 <p className="mt-0.5 text-xs text-content-deemphasized">{activeTabInfo.description}</p>
//                             </div>
//                         </div>

//                         {activeTab === "overview" && renderOverview()}
//                         {activeTab === "usage" && renderUsage()}
//                         {activeTab === "security" && renderSecurity()}

//                         <footer className="mt-9 flex flex-col gap-2 border-t border-content-deemphasized/10 pt-5 text-[10px] text-content-deemphasized sm:flex-row sm:items-center sm:justify-between">
//                             <span>DocLens · Account settings</span>
//                             <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Manage your account with care</span>
//                         </footer>
//                     </section>
//                 </div>
//             </main>
//         </div>
//     );
// }
























// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
// import {
//     Activity,
//     CalendarDays,
//     Check,
//     ChevronRight,
//     Clock3,
//     FileText,
//     LayoutDashboard,
//     LogOut,
//     MessageSquareText,
//     PencilLine,
//     RefreshCw,
//     ShieldCheck,
//     KeyRound,
//     Trash2,
//     X,
// } from "lucide-react";
// import Header from "../components/layout/Header.jsx";
// import default_avatar from "../assets/default-avatar.png";
// import { useAuthStore } from "../store/authStore.js";
// import { useUsageQuery, useUpdateProfile } from "../hooks/useUsage.js";
// import { GitHubIcon, GoogleIcon } from "../components/common/Icons.jsx";

// const TABS = [
//     { value: "overview", label: "Overview", icon: LayoutDashboard },
//     { value: "usage", label: "Usage & limits", icon: Activity },
//     { value: "security", label: "Security", icon: ShieldCheck },
// ];

// function getMsUntilMidnightUTC() {
//     const now = new Date();
//     const midnight = new Date(
//         Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
//     );
//     return midnight.getTime() - now.getTime();
// }

// function formatCountdown(ms) {
//     if (ms <= 0) return "0h 0m";
//     const minutes = Math.floor(ms / 60000);
//     return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
// }

// function formatMemberSince(dateString) {
//     if (!dateString) return "Not available";
//     const date = new Date(dateString);
//     if (Number.isNaN(date.getTime())) return "Not available";
//     return new Intl.DateTimeFormat("en-US", {
//         month: "long",
//         year: "numeric",
//     }).format(date);
// }

// function getDisplayName(user) {
//     return user?.username || user?.name || "Your account";
// }

// function Avatar({ user, displayName, size = "large" }) {
//     return (
//         <img
//             src={user?.avatar || default_avatar}
//             alt={`${displayName}'s avatar`}
//             onError={(event) => {
//                 event.currentTarget.onerror = null;
//                 event.currentTarget.src = default_avatar;
//             }}
//             className={
//                 size === "small"
//                     ? "h-10 w-10 shrink-0 rounded-xl border border-content-deemphasized/10 object-cover"
//                     : "h-[68px] w-[68px] shrink-0 rounded-2xl border border-content-deemphasized/10 object-cover sm:h-[76px] sm:w-[76px]"
//             }
//         />
//     );
// }

// function ProfileEditDialog({
//     name,
//     setName,
//     inputRef,
//     isSaving,
//     onClose,
//     onSave,
// }) {
//     useEffect(() => {
//         inputRef.current?.focus();
//         inputRef.current?.select();
//     }, [inputRef]);

//     return (
//         <div
//             className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-[3px]"
//             onMouseDown={(event) => {
//                 if (event.target === event.currentTarget && !isSaving) onClose();
//             }}
//         >
//             <section
//                 role="dialog"
//                 aria-modal="true"
//                 aria-labelledby="edit-profile-title"
//                 className="w-full max-w-md rounded-3xl border border-content-deemphasized/10 bg-surface-default p-5 shadow-2xl shadow-black/15 sm:p-6"
//             >
//                 <div className="flex items-start justify-between gap-4">
//                     <div>
//                         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                             <PencilLine className="h-[18px] w-[18px]" />
//                         </div>
//                         <h2 id="edit-profile-title" className="mt-4 text-lg font-semibold tracking-[-0.03em] text-content-default">
//                             Edit your profile
//                         </h2>
//                         <p className="mt-1.5 text-sm leading-5 text-content-deemphasized">
//                             Update the name displayed across DocLens.
//                         </p>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={onClose}
//                         disabled={isSaving}
//                         aria-label="Close edit profile"
//                         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-content-deemphasized transition-colors hover:bg-surface-emphasized hover:text-content-default disabled:opacity-50"
//                     >
//                         <X className="h-4 w-4" />
//                     </button>
//                 </div>

//                 <form onSubmit={onSave} className="mt-6">
//                     <label htmlFor="profile-display-name" className="mb-2 block text-xs font-semibold text-content-default">
//                         Display name
//                     </label>
//                     <input
//                         ref={inputRef}
//                         id="profile-display-name"
//                         value={name}
//                         maxLength={80}
//                         autoComplete="name"
//                         onChange={(event) => setName(event.target.value)}
//                         onKeyDown={(event) => {
//                             if (event.key === "Escape" && !isSaving) onClose();
//                         }}
//                         placeholder="Enter your name"
//                         className="w-full rounded-xl border border-content-deemphasized/15 bg-surface-default px-3.5 py-3 text-sm text-content-default outline-none transition placeholder:text-content-deemphasized/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
//                     />
//                     <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={isSaving}
//                             className="inline-flex items-center justify-center rounded-xl border border-content-deemphasized/15 px-4 py-2.5 text-sm font-medium text-content-default transition-colors hover:bg-surface-emphasized disabled:opacity-50"
//                         >
//                             Cancel
//                         </button>
//                         <button
//                             type="submit"
//                             disabled={isSaving || !name.trim()}
//                             className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//                         >
//                             {isSaving ? (
//                                 <RefreshCw className="h-4 w-4 animate-spin" />
//                             ) : (
//                                 <Check className="h-4 w-4" />
//                             )}
//                             {isSaving ? "Saving…" : "Save changes"}
//                         </button>
//                     </div>
//                 </form>
//             </section>
//         </div>
//     );
// }

// function ConnectedAccount({ icon: Icon, provider, connected }) {
//     return (
//         <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-content-deemphasized/10 bg-surface-default p-4 sm:p-5">
//             <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-emphasized">
//                 <Icon className="h-[19px] w-[19px] text-content-default" />
//             </span>
//             <span className="min-w-0 flex-1 text-sm font-semibold text-content-default">{provider}</span>
//             <span
//                 className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${connected
//                     ? "bg-success/10 text-success"
//                     : "bg-surface-emphasized text-content-deemphasized"
//                     }`}
//             >
//                 {connected ? "Connected" : "Not linked"}
//             </span>
//         </div>
//     );
// }

// function UsageMetric({ icon: Icon, title, description, used = 0, total = 0 }) {
//     const safeUsed = Number.isFinite(Number(used)) ? Math.max(0, Number(used)) : 0;
//     const safeTotal = Number.isFinite(Number(total)) ? Math.max(0, Number(total)) : 0;
//     const hasLimit = safeTotal > 0;
//     const progress = hasLimit ? Math.min(100, (safeUsed / safeTotal) * 100) : 0;
//     const isExceeded = hasLimit && safeUsed >= safeTotal;
//     const isNearLimit = hasLimit && progress >= 80 && !isExceeded;
//     const status = !hasLimit
//         ? "Limit unavailable"
//         : isExceeded
//             ? "Limit reached"
//             : isNearLimit
//                 ? "Almost at limit"
//                 : "Within limit";
//     const progressColor = isExceeded ? "bg-danger" : isNearLimit ? "bg-warning" : "bg-primary";
//     const statusStyle = isExceeded
//         ? "bg-danger/10 text-danger"
//         : isNearLimit
//             ? "bg-warning/10 text-warning"
//             : "bg-surface-emphasized text-content-deemphasized";

//     return (
//         <article className="rounded-2xl border border-content-deemphasized/10 bg-surface-default p-5 sm:p-6">
//             <div className="flex items-start gap-3">
//                 <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
//                     <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
//                 </span>
//                 <div className="min-w-0 flex-1">
//                     <h3 className="text-sm font-semibold text-content-default">{title}</h3>
//                     <p className="mt-1 text-xs leading-5 text-content-deemphasized">{description}</p>
//                 </div>
//                 <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${statusStyle}`}>
//                     {status}
//                 </span>
//             </div>

//             <div className="mt-7 flex items-end justify-between gap-3">
//                 <div className="flex items-baseline gap-1.5">
//                     <span className="text-[34px] font-semibold leading-none tracking-[-0.055em] text-content-default tabular-nums">
//                         {safeUsed.toLocaleString()}
//                     </span>
//                     <span className="text-sm text-content-deemphasized">
//                         / {hasLimit ? safeTotal.toLocaleString() : "—"}
//                     </span>
//                 </div>
//                 {hasLimit && (
//                     <span className="text-xs font-medium text-content-deemphasized tabular-nums">
//                         {Math.round(progress)}% used
//                     </span>
//                 )}
//             </div>

//             <div
//                 className="mt-4 h-2 overflow-hidden rounded-full bg-surface-emphasized"
//                 role="progressbar"
//                 aria-label={`${title} usage`}
//                 aria-valuemin={0}
//                 aria-valuemax={hasLimit ? safeTotal : 100}
//                 aria-valuenow={hasLimit ? Math.min(safeUsed, safeTotal) : 0}
//             >
//                 <div
//                     className={`h-full rounded-full transition-[width] duration-700 ease-out ${progressColor}`}
//                     style={{ width: `${progress}%` }}
//                 />
//             </div>
//             <p className="mt-3 text-xs text-content-deemphasized">
//                 {hasLimit
//                     ? `${Math.max(0, safeTotal - safeUsed).toLocaleString()} remaining this period`
//                     : "Your current usage limit is unavailable"}
//             </p>
//         </article>
//     );
// }

// function UsageState({ loading, error, onRetry }) {
//     if (loading) {
//         return (
//             <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-10 text-center">
//                 <RefreshCw className="h-5 w-5 animate-spin text-primary" />
//                 <p className="mt-3 text-sm font-medium text-content-default">Loading usage…</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-content-deemphasized/10 bg-surface-default px-6 py-10 text-center">
//                 <Activity className="h-5 w-5 text-danger" />
//                 <p className="mt-3 text-sm font-semibold text-content-default">Usage could not be loaded</p>
//                 <p className="mt-1 max-w-sm text-xs leading-5 text-content-deemphasized">
//                     Check your connection and try again.
//                 </p>
//                 <button
//                     type="button"
//                     onClick={onRetry}
//                     className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
//                 >
//                     <RefreshCw className="h-3.5 w-3.5" /> Try again
//                 </button>
//             </div>
//         );
//     }

//     return null;
// }

// function SecurityAction({ icon: Icon, title, description, buttonLabel, onClick, danger = false, disabled = false }) {
//     return (
//         <div
//             className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${danger
//                 ? "border-danger/20 bg-danger/5"
//                 : "border-content-deemphasized/10 bg-surface-default"
//                 }`}
//         >
//             <div className="flex min-w-0 items-start gap-3.5">
//                 <span
//                     className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-danger/10 text-danger" : "bg-surface-emphasized text-content-deemphasized"
//                         }`}
//                 >
//                     <Icon className="h-[17px] w-[17px]" strokeWidth={1.8} />
//                 </span>
//                 <div className="min-w-0">
//                     <h3 className={`text-sm font-semibold ${danger ? "text-danger" : "text-content-default"}`}>
//                         {title}
//                     </h3>
//                     <p className="mt-1 max-w-xl text-[13px] leading-5 text-content-deemphasized">
//                         {description}
//                     </p>
//                 </div>
//             </div>
//             <button
//                 type="button"
//                 onClick={onClick || undefined}
//                 disabled={disabled || !onClick}
//                 className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${danger
//                     ? "border border-danger/30 text-danger hover:bg-danger/10"
//                     : "bg-surface-emphasized text-content-default hover:bg-primary/10 hover:text-primary"
//                     }`}
//             >
//                 {buttonLabel}
//                 {!danger && !disabled && <ChevronRight className="h-3.5 w-3.5" />}
//             </button>
//         </div>
//     );
// }

// export default function ProfilePage() {
//     const navigate = useNavigate();
//     const user = useAuthStore((state) => state.user);
//     const setUser = useAuthStore((state) => state.setUser);
//     const handleLogout = useAuthStore((state) => state.handleLogout);
//     const {
//         data: usage,
//         isLoading: usageLoading,
//         isError: usageError,
//         refetch: refetchUsage,
//     } = useUsageQuery();
//     const updateProfile = useUpdateProfile();

//     const [activeTab, setActiveTab] = useState("overview");
//     const [isEditingProfile, setIsEditingProfile] = useState(false);
//     const [nameDraft, setNameDraft] = useState(() => getDisplayName(user));
//     const [countdown, setCountdown] = useState(() => formatCountdown(getMsUntilMidnightUTC()));
//     const nameInputRef = useRef(null);

//     const displayName = getDisplayName(user);
//     const linkedProviders = Array.isArray(user?.auth_providers) ? user.auth_providers : [];
//     const isLinked = (provider) =>
//         linkedProviders.some((item) => String(item).toLowerCase() === provider.toLowerCase());

//     useEffect(() => {
//         const intervalId = window.setInterval(() => {
//             setCountdown(formatCountdown(getMsUntilMidnightUTC()));
//         }, 60000);
//         return () => window.clearInterval(intervalId);
//     }, []);

//     const openProfileEditor = () => {
//         setNameDraft(displayName === "Your account" ? "" : displayName);
//         setIsEditingProfile(true);
//     };

//     const closeProfileEditor = () => {
//         if (updateProfile.isPending) return;
//         setNameDraft(displayName);
//         setIsEditingProfile(false);
//     };

//     const handleSaveName = async (event) => {
//         event.preventDefault();
//         const trimmed = nameDraft.trim();

//         if (!trimmed) {
//             toast.error("Your name cannot be empty");
//             nameInputRef.current?.focus();
//             return;
//         }

//         if (trimmed === displayName) {
//             setIsEditingProfile(false);
//             return;
//         }

//         try {
//             await updateProfile.mutateAsync({ username: trimmed });
//             setUser?.({ ...user, username: trimmed });
//             setNameDraft(trimmed);
//             setIsEditingProfile(false);
//             toast.success("Profile updated");
//         } catch (error) {
//             const detail = error?.response?.data?.detail;
//             const message = typeof detail === "string" ? detail : detail?.message;
//             toast.error(message || "We couldn't update your profile. Please try again.");
//         }
//     };

//     const renderOverview = () => (

//         <div className="space-y-7">
            
//             <section className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-surface-default to-surface-emphasized/70 p-5 sm:p-7">
//                 <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
//                     <Avatar user={user} displayName={displayName} />
//                     <div className="min-w-0 flex-1">
//                         <h2 className="break-words text-xl font-semibold tracking-[-0.04em] text-content-default sm:text-2xl">
//                             {displayName}
//                         </h2>
//                         <p className="mt-1.5 break-all text-sm text-content-deemphasized">
//                             {user?.email || "No email address available"}
//                         </p>
//                         <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-content-deemphasized">
//                             <CalendarDays className="h-3.5 w-3.5" />
//                             Member since {formatMemberSince(user?.created_at)}
//                         </p>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={openProfileEditor}
//                         className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-content-deemphasized/15 bg-surface-default px-4 py-2.5 text-sm font-semibold text-content-default transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
//                     >
//                         <PencilLine className="h-4 w-4" /> Edit profile
//                     </button>
//                 </div>
//             </section>

//             <section>
//                 <div className="mb-3">
//                     <h2 className="text-lg font-semibold tracking-[-0.03em] text-content-default">
//                         Connected accounts
//                     </h2>
//                     <p className="mt-1 text-sm text-content-deemphasized">
//                         Sign-in methods linked to your DocLens account.
//                     </p>
//                 </div>
//                 <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
//                     <ConnectedAccount
//                         icon={GoogleIcon}
//                         provider="Google"
//                         connected={isLinked("google")}
//                     />
//                     <ConnectedAccount
//                         icon={GitHubIcon}
//                         provider="GitHub"
//                         connected={isLinked("github")}
//                     />
//                 </div>
//             </section>
//         </div>
//     );

//     const renderUsage = () => (
//         <div className="space-y-5">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//                 <div>
//                     <h2 className="text-lg font-semibold tracking-[-0.03em] text-content-default">Your activity</h2>
//                     <p className="mt-1 text-sm text-content-deemphasized">
//                         A quick view of your current document and question usage.
//                     </p>
//                 </div>
//                 <div className="flex items-center gap-2 self-start rounded-xl border border-content-deemphasized/10 bg-surface-emphasized/60 px-3 py-2 sm:self-auto">
//                     <Clock3 className="h-4 w-4 text-primary" />
//                     <span className="text-xs text-content-deemphasized">Resets in</span>
//                     <span className="text-xs font-semibold tabular-nums text-content-default">{countdown}</span>
//                     <span className="text-[10px] text-content-deemphasized">UTC</span>
//                 </div>
//             </div>

//             {usageLoading || usageError ? (
//                 <UsageState
//                     loading={usageLoading}
//                     error={usageError}
//                     onRetry={() => refetchUsage()}
//                 />
//             ) : (
//                 <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
//                     <UsageMetric
//                         icon={FileText}
//                         title="Documents uploaded"
//                         description="Documents added to your workspace"
//                         used={usage?.documents?.used ?? 0}
//                         total={usage?.documents?.total ?? 0}
//                     />
//                     <UsageMetric
//                         icon={MessageSquareText}
//                         title="Questions asked"
//                         description="Questions sent to your documents"
//                         used={usage?.questions?.used ?? 0}
//                         total={usage?.questions?.total ?? 0}
//                     />
//                 </div>
//             )}

//             <p className="text-xs leading-5 text-content-deemphasized">
//                 Daily usage resets at midnight UTC. Higher limits with DocLens Pro are planned.
//             </p>
//         </div>
//     );

//     const renderSecurity = () => (
//         <div className="space-y-6">
//             <div>
//                 <h2 className="text-lg font-semibold tracking-[-0.03em] text-content-default">Sign-in & account access</h2>
//                 <p className="mt-1 text-sm text-content-deemphasized">
//                     Manage your password and current session.
//                 </p>
//             </div>

//             <div className="space-y-3">
//                 <SecurityAction
//                     icon={KeyRound}
//                     title="Reset password"
//                     description="Get a password reset link if you use email and password to sign in."
//                     buttonLabel="Reset password"
//                     onClick={() => navigate("/forgot-password")}
//                 />
//                 <SecurityAction
//                     icon={LogOut}
//                     title="Sign out"
//                     description="Sign out of DocLens on this device."
//                     buttonLabel="Sign out"
//                     onClick={handleLogout}
//                 />
//             </div>

//             <div className="border-t border-content-deemphasized/10 pt-5">
//                 <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.13em] text-danger">Danger zone</p>
//                 <SecurityAction
//                     icon={Trash2}
//                     title="Delete account"
//                     description="Account deletion is not available yet. Your account and saved data will remain intact."
//                     buttonLabel="Coming soon"
//                     danger
//                     disabled
//                 />
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen w-full bg-surface-default text-content-default">

//             <Header />

//             <main className="mx-auto w-full px-4 pb-12 pt-7 sm:px-6 sm:pt-10 lg:px-28">

//                 {/* <div className="mb-6 border-b border-content-deemphasized/10 pb-6 sm:mb-8 sm:pb-7">
//                     <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-content-deemphasized">
//                         DocLens / Settings
//                     </p>
//                     <h1 className="text-[28px] font-semibold tracking-[-0.055em] text-content-default sm:text-[36px]">
//                         Account settings
//                     </h1>
//                     <p className="mt-1.5 max-w-xl text-sm leading-6 text-content-deemphasized">
//                         Manage your profile, usage, and account access.
//                     </p>
//                 </div> */}

//                 <div className="mb-8 flex flex-col gap-3 border-b border-content-deemphasized/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
//                     <div>
//                         <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-content-deemphasized">
//                             <span>DocLens</span>
//                             <span className="h-1 w-1 rounded-full bg-content-deemphasized/50" />
//                             <span>Settings</span>
//                         </div>
//                         <h1 className="text-[30px] font-semibold tracking-[-0.055em] text-content-default sm:text-[38px]">Account settings</h1>
//                         <p className="mt-2 max-w-2xl text-sm leading-6 text-content-deemphasized">
//                             Manage your profile, keep an eye on your activity, and control account access.
//                         </p>
//                     </div>
//                     <div className="inline-flex w-fit items-center gap-2 rounded-full border border-content-deemphasized/10 bg-surface-emphasized/70 px-3 py-2 text-xs font-medium text-content-deemphasized">
//                         <ShieldCheck className="h-3.5 w-3.5 text-success" /> Your account preferences
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[275px_minmax(0,1fr)] lg:gap-8">

//                     <aside className="lg:sticky lg:top-6">

//                         <div className="rounded-2xl border border-content-deemphasized/10 bg-surface-default p-2 sm:p-3 sm:px-4">

//                             <div className="flex items-center gap-3 px-1 pt-2 mb-3">
//                                 <img
//                                     src={user?.avatar || default_avatar}
//                                     alt=""
//                                     onError={(event) => {
//                                         if (event.currentTarget.src !== default_avatar) event.currentTarget.src = default_avatar;
//                                     }}
//                                     className="h-12 w-12 shrink-0 rounded-2xl border border-content-deemphasized/10 object-cover"
//                                 />
//                                 <div className="min-w-0 flex-1">
//                                     <p className="truncate text-sm font-semibold text-content-default">{displayName}</p>
//                                     <p className="mt-1 truncate text-xs text-content-deemphasized">{user?.email || "No email available"}</p>
//                                 </div>
//                             </div>

//                             <p className="hidden px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-content-deemphasized lg:block">
//                                 Manage account
//                             </p>

//                             <nav aria-label="Account settings sections" role="tablist" className="grid grid-cols-3 gap-1 lg:block lg:space-y-1">
//                                 {TABS.map((tab) => {
//                                     const Icon = tab.icon;
//                                     const selected = activeTab === tab.value;
//                                     return (
//                                         <button
//                                             key={tab.value}
//                                             id={`settings-tab-${tab.value}`}
//                                             type="button"
//                                             role="tab"
//                                             aria-selected={selected}
//                                             aria-controls="active-settings-panel"
//                                             tabIndex={selected ? 0 : -1}
//                                             onClick={() => setActiveTab(tab.value)}
//                                             onKeyDown={(event) => {
//                                                 const currentIndex = TABS.findIndex((item) => item.value === activeTab);
//                                                 let nextIndex = currentIndex;
//                                                 if (event.key === "ArrowRight" || event.key === "ArrowDown") {
//                                                     nextIndex = (currentIndex + 1) % TABS.length;
//                                                 } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
//                                                     nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
//                                                 } else if (event.key === "Home") {
//                                                     nextIndex = 0;
//                                                 } else if (event.key === "End") {
//                                                     nextIndex = TABS.length - 1;
//                                                 } else {
//                                                     return;
//                                                 }
//                                                 event.preventDefault();
//                                                 const nextTab = TABS[nextIndex];
//                                                 setActiveTab(nextTab.value);
//                                                 document.getElementById(`settings-tab-${nextTab.value}`)?.focus();
//                                             }}
//                                             className={`group relative flex min-h-14.5 w-full min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:min-h-0 lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-3 lg:text-left ${selected
//                                                 ? "bg-primary text-white shadow-sm shadow-primary/15 lg:bg-primary/10 lg:text-primary lg:shadow-none"
//                                                 : "text-content-deemphasized hover:bg-surface-emphasized hover:text-content-default"
//                                                 }`}
//                                         >
//                                             <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg lg:h-8 lg:w-8 ${selected
//                                                 ? "bg-white/15 text-white lg:bg-surface-default lg:text-primary"
//                                                 : "bg-surface-emphasized text-content-deemphasized group-hover:text-content-default"
//                                                 }`}>
//                                                 <Icon className="h-4 w-4" strokeWidth={1.9} />
//                                             </span>
//                                             <span className="block min-w-0 text-[10px] font-semibold leading-tight sm:text-xs lg:text-[13px]">
//                                                 {tab.label}
//                                             </span>
//                                             {selected && <span className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-white lg:hidden" />}
//                                             {selected && <ChevronRight className="ml-auto hidden h-4 w-4 lg:block" />}
//                                         </button>
//                                     );
//                                 })}
//                             </nav>
//                         </div>


//                     </aside>

//                     <section
//                         id="active-settings-panel"
//                         role="tabpanel"
//                         tabIndex={0}
//                         aria-labelledby={`settings-tab-${activeTab}`}
//                         className="min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
//                     >
//                         {activeTab === "overview" && renderOverview()}
//                         {activeTab === "usage" && renderUsage()}
//                         {activeTab === "security" && renderSecurity()}
//                     </section>

//                 </div>


//             </main>

//             {isEditingProfile && (
//                 <ProfileEditDialog
//                     name={nameDraft}
//                     setName={setNameDraft}
//                     inputRef={nameInputRef}
//                     isSaving={Boolean(updateProfile.isPending)}
//                     onClose={closeProfileEditor}
//                     onSave={handleSaveName}
//                 />
//             )}
//         </div>
//     );
// }
