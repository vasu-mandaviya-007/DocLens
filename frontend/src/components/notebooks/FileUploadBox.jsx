// import React, { useRef, useState, useCallback, useEffect } from "react";
// import { UploadCloud, X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
// import { pdfFileIcon } from "../assets/assets.js";


// const CATEGORY_MAP = {
//     pdf: { exts: ["pdf"], mimes: ["application/pdf"], icon: pdfFileIcon },
// };

// const ALL_ALLOWED_EXTS = Object.values(CATEGORY_MAP).flatMap((c) => c.exts);

// function getExt(name = "") {
//     return name.split(".").pop().toLowerCase();
// }

// function getCategory(file) {
//     const ext = getExt(file.name);
//     for (const [key, cfg] of Object.entries(CATEGORY_MAP)) {
//         if (cfg.exts.includes(ext)) return key;
//         if (cfg.mimes.some((m) => file.type?.startsWith(m))) return key;
//     }
//     return null;
// }

// function formatBytes(bytes) {
//     if (bytes === 0) return "0 B";
//     const k = 1024;
//     const sizes = ["B", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
// }

// export default function FileUploadBox({ maxSizeMB = 20, acceptedExts = ALL_ALLOWED_EXTS, onFileChange }) {
//     const [item, setItem] = useState(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [error, setError] = useState("");

//     const inputRef = useRef(null);
//     const dragCounter = useRef(0);
//     const timerRef = useRef(null);
//     const maxSizeBytes = maxSizeMB * 1024 * 1024;

//     useEffect(() => {
//         onFileChange?.(item?.file ?? null);
//     }, [item, onFileChange]);

//     useEffect(() => {
//         return () => clearInterval(timerRef.current);
//     }, []);

//     const validate = (file) => {
//         const ext = getExt(file.name);
//         if (file.size === 0) return "File is empty.";
//         if (!acceptedExts.includes(ext)) {
//             return `".${ext || "unknown"}" is not supported. Allowed: ${acceptedExts.join(", ").toUpperCase()}.`;
//         }
//         if (file.size > maxSizeBytes) return `File exceeds the ${maxSizeMB}MB limit.`;
//         return null;
//     };

//     const simulateUpload = () => {
//         let progress = 0;
//         clearInterval(timerRef.current);
//         timerRef.current = setInterval(() => {
//             progress += Math.random() * 20 + 10;
//             if (progress >= 100) {
//                 clearInterval(timerRef.current);
//                 setItem((prev) => (prev ? { ...prev, progress: 100, status: "success" } : null));
//             } else {
//                 setItem((prev) => (prev ? { ...prev, progress } : null));
//             }
//         }, 150);
//     };

//     const setFile = useCallback(
//         (file) => {
//             if (!file) return;
//             setError("");

//             const err = validate(file);
//             if (err) {
//                 setError(err);
//                 return;
//             }

//             setItem({ file, category: getCategory(file), progress: 0, status: "uploading" });
//             simulateUpload();
//         },
//         [maxSizeBytes, acceptedExts]
//     );

//     const onInputChange = (e) => {
//         setFile(e.target.files?.[0]);
//         e.target.value = "";
//     };

//     const onDrop = (e) => {
//         e.preventDefault();
//         dragCounter.current = 0;
//         setIsDragging(false);
//         setFile(e.dataTransfer.files?.[0]);
//     };

//     const onDragEnter = (e) => {
//         e.preventDefault();
//         dragCounter.current += 1;
//         setIsDragging(true);
//     };

//     const onDragLeave = (e) => {
//         e.preventDefault();
//         dragCounter.current -= 1;
//         if (dragCounter.current <= 0) {
//             dragCounter.current = 0;
//             setIsDragging(false);
//         }
//     };

//     const removeFile = () => {
//         clearInterval(timerRef.current);
//         setItem(null);
//         setError("");
//     };

//     return (
//         <div
//             className="w-full"
//             onPaste={(e) => {
//                 if (e.clipboardData?.files?.length) setFile(e.clipboardData.files[0]);
//             }}
//         >
//             {!item ? (
//                 <div
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => inputRef.current?.click()}
//                     onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
//                     onDrop={onDrop}
//                     onDragEnter={onDragEnter}
//                     onDragLeave={onDragLeave}
//                     onDragOver={(e) => e.preventDefault()}
//                     className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 outline-none
//                         ${isDragging
//                             ? "border-blue-500 bg-blue-50"
//                             : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/5"
//                         }`}
//                 >
//                     <input
//                         ref={inputRef}
//                         type="file"
//                         className="hidden"
//                         onChange={onInputChange}
//                         accept={acceptedExts.map((e) => `.${e}`).join(",")}
//                     />

//                     <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
//                         <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <p className="text-sm font-medium text-content-default">
//                         <span className="text-blue-600 dark:text-blue-400 hover:underline">Click to upload</span> or drag and drop
//                     </p>
//                     <p className="mt-1 text-xs text-content-deemphasized">
//                         {acceptedExts.join(", ").toUpperCase()} &middot; Max {maxSizeMB}MB
//                     </p>
//                 </div>
//             ) : (
//                 <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-zinc-800 p-4 border border-slate-200 dark:border-zinc-700">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-700">
//                         <img
//                             src={CATEGORY_MAP[item.category].icon}
//                             alt="file icon"
//                             className="h-5 w-5 object-contain"
//                         />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <div className="flex items-center gap-2">
//                             <p className="truncate text-sm font-medium text-content-default">
//                                 {item.file.name}
//                             </p>
//                             {item.status === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
//                             {item.status === "error" && <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />}
//                         </div>

//                         <p className="text-xs text-content-deemphasized mt-0.5">
//                             {formatBytes(item.file.size)}
//                         </p>

//                         {item.status === "uploading" && (
//                             <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
//                                 <div
//                                     className="h-full rounded-full bg-blue-500 transition-all duration-150 ease-out"
//                                     style={{ width: `${item.progress}%` }}
//                                 />
//                             </div>
//                         )}
//                     </div>

//                     <div className="flex shrink-0 items-center gap-1">
//                         {item.status === "uploading" ? (
//                             <Loader2 className="h-4 w-4 animate-spin text-blue-500 mr-2" />
//                         ) : (
//                             <button
//                                 onClick={removeFile}
//                                 className="rounded-lg p-1.5 text-content-deemphasized hover:bg-rose-50 hover:text-rose-600 transition-colors"
//                             >
//                                 <X className="h-4 w-4" />
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             )}

//             {error && (
//                 <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-500 font-medium">
//                     <AlertTriangle className="h-4 w-4 shrink-0" />
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }









// import React, { useRef, useState, useCallback } from "react";
// import { UploadCloud, X, AlertTriangle } from "lucide-react";

// import { pdfFileIcon } from "../assets/assets.js";
// import { IconButton } from "@mui/material";

// const CATEGORY_MAP = {
//     pdf: { exts: ["pdf"], mimes: ["application/pdf"], icon: pdfFileIcon },
// };

// const ALL_ALLOWED_EXTS = Object.values(CATEGORY_MAP).flatMap((c) => c.exts);

// function getExt(name = "") {
//     return name.split(".").pop().toLowerCase();
// }

// function getCategory(file) {
//     const ext = getExt(file.name);
//     for (const [key, cfg] of Object.entries(CATEGORY_MAP)) {
//         if (cfg.exts.includes(ext)) return key;
//         if (cfg.mimes.some((m) => file.type?.startsWith(m))) return key;
//     }
//     return null;
// }

// function formatBytes(bytes) {
//     if (bytes === 0) return "0 B";
//     const k = 1024;
//     const sizes = ["B", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
// }

// export default function FileUploadBox({
//     maxSizeMB = 20,
//     acceptedExts = ALL_ALLOWED_EXTS,
//     uploading,
//     onFileChange,
// }) {
//     const [item, setItem] = useState(null); // { file, category } | null
//     const [isDragging, setIsDragging] = useState(false);
//     const [error, setError] = useState("");

//     const inputRef = useRef(null);
//     const dragCounter = useRef(0);
//     const maxSizeBytes = maxSizeMB * 1024 * 1024;

//     const validate = (file) => {
//         const ext = getExt(file.name);
//         if (file.size === 0) return "File is empty.";
//         if (!acceptedExts.includes(ext)) {
//             return `".${ext || "unknown"}" is not supported. Allowed: ${acceptedExts.join(", ").toUpperCase()}.`;
//         }
//         if (file.size > maxSizeBytes) return `File exceeds the ${maxSizeMB}MB limit.`;
//         return null;
//     };

//     const setFile = useCallback(
//         (file) => {
//             if (!file) return;
//             setError("");

//             const err = validate(file);
//             if (err) {
//                 setError(err);
//                 onFileChange?.(null);
//                 return;
//             }

//             const newItem = { file, category: getCategory(file) };
//             setItem(newItem);
//             onFileChange?.(file);
//         },
//         [maxSizeBytes, acceptedExts, onFileChange]
//     );

//     const onInputChange = (e) => {
//         setFile(e.target.files?.[0]);
//         e.target.value = "";
//     };

//     const onDrop = (e) => {
//         e.preventDefault();
//         dragCounter.current = 0;
//         setIsDragging(false);
//         setFile(e.dataTransfer.files?.[0]);
//     };

//     const onDragEnter = (e) => {
//         e.preventDefault();
//         dragCounter.current += 1;
//         setIsDragging(true);
//     };

//     const onDragLeave = (e) => {
//         e.preventDefault();
//         dragCounter.current -= 1;
//         if (dragCounter.current <= 0) {
//             dragCounter.current = 0;
//             setIsDragging(false);
//         }
//     };

//     const removeFile = () => {
//         setItem(null);
//         setError("");
//         onFileChange?.(null);
//     };

//     return (
//         <div
//             className="w-full"
//             onPaste={(e) => {
//                 if (e.clipboardData?.files?.length) setFile(e.clipboardData.files[0]);
//             }}
//         >
//             {!item ? (
//                 <div
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => inputRef.current?.click()}
//                     onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
//                     onDrop={onDrop}
//                     onDragEnter={onDragEnter}
//                     onDragLeave={onDragLeave}
//                     onDragOver={(e) => e.preventDefault()}
//                     className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors duration-200 outline-none
//                         ${isDragging
//                             ? "border-blue-500 bg-blue-50"
//                             : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-white/20 dark:hover:bg-white/5"
//                         }`}
//                 >
//                     <input
//                         ref={inputRef}
//                         type="file"
//                         className="hidden"
//                         onChange={onInputChange}
//                         accept={acceptedExts.map((e) => `.${e}`).join(",")}
//                     />

//                     <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10">
//                         <UploadCloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                     </div>
//                     <p className="text-sm font-medium text-content-default">
//                         <span className="text-blue-600 dark:text-blue-400 hover:underline">Click to upload</span> or drag and drop
//                     </p>
//                     <p className="mt-1 text-xs text-content-deemphasized">
//                         {acceptedExts.join(", ").toUpperCase()} &middot; Max {maxSizeMB}MB
//                     </p>

//                 </div>

//             ) : (

//                 <div className="flex animate-fade-in items-center gap-3 rounded-xl bg-slate-50 dark:bg-zinc-800 p-4 border border-slate-200 dark:border-zinc-700">

//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-zinc-700">
//                         <img
//                             src={CATEGORY_MAP[item.category].icon}
//                             alt="file icon"
//                             className="h-5 w-5 object-contain"
//                         />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <p className="truncate text-sm font-medium text-content-default">
//                             {item.file.name}
//                         </p>
//                         <p className="text-xs text-content-deemphasized mt-0.5">
//                             {formatBytes(item.file.size)}
//                         </p>
//                     </div>

//                     <IconButton
//                         onClick={removeFile}
//                         disabled={uploading}
//                     >
//                         <X size={16} />
//                     </IconButton>

//                     {/* <button
//                         onClick={removeFile}
//                         disabled={!uploading}
//                         className="rounded-lg p-1.5 text-content-deemphasized hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500 dark:hover:text-white transition-colors shrink-0"
//                     >
//                         <X className="h-4 w-4" />
//                     </button> */}

//                 </div>

//             )}

//             {error && (
//                 <p className="mt-2 flex items-center gap-1.5 text-sm text-rose-500 font-medium">
//                     <AlertTriangle className="h-4 w-4 shrink-0" />
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }













// import React, { useRef, useState, useCallback } from "react";
// import { UploadCloud, X, AlertTriangle } from "lucide-react"; 
// import { pdfFileIcon } from "../../assets/assets.js";
// import { IconButton } from "@mui/material";

// const CATEGORY_MAP = {
//     pdf: { exts: ["pdf"], mimes: ["application/pdf"], icon: pdfFileIcon },
// };

// const ALL_ALLOWED_EXTS = Object.values(CATEGORY_MAP).flatMap((c) => c.exts);

// function getExt(name = "") {
//     return name.split(".").pop().toLowerCase();
// }

// function getCategory(file) {
//     const ext = getExt(file.name);
//     for (const [key, cfg] of Object.entries(CATEGORY_MAP)) {
//         if (cfg.exts.includes(ext)) return key;
//         if (cfg.mimes.some((m) => file.type?.startsWith(m))) return key;
//     }
//     return null;
// }

// function formatBytes(bytes) {
//     if (bytes === 0) return "0 B";
//     const k = 1024;
//     const sizes = ["B", "KB", "MB", "GB"];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
// }

// export default function FileUploadBox({
//     maxSizeMB = 20,
//     acceptedExts = ALL_ALLOWED_EXTS,
//     uploading,
//     onFileChange,
// }) {
//     const [item, setItem] = useState(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [error, setError] = useState("");

//     const inputRef = useRef(null);
//     const dragCounter = useRef(0);
//     const maxSizeBytes = maxSizeMB * 1024 * 1024;

//     const validate = (file) => {
//         const ext = getExt(file.name);
//         if (file.size === 0) return "File is empty.";
//         if (!acceptedExts.includes(ext)) {
//             return `".${ext || "unknown"}" is not supported. Allowed: ${acceptedExts.join(", ").toUpperCase()}.`;
//         }
//         if (file.size > maxSizeBytes) return `File exceeds the ${maxSizeMB}MB limit.`;
//         return null;
//     };

//     const setFile = useCallback(
//         (file) => {
//             if (!file || uploading) return; // upload chalte hue naya file select/drop block
//             setError("");

//             const err = validate(file);
//             if (err) {
//                 setError(err);
//                 onFileChange?.(null);
//                 return;
//             }

//             setItem({ file, category: getCategory(file) });
//             onFileChange?.(file);
//         },
//         [maxSizeBytes, acceptedExts, onFileChange, uploading]
//     );

//     const onInputChange = (e) => {
//         setFile(e.target.files?.[0]);
//         e.target.value = "";
//     };

//     const onDrop = (e) => {
//         e.preventDefault();
//         dragCounter.current = 0;
//         setIsDragging(false);
//         setFile(e.dataTransfer.files?.[0]);
//     };

//     const onDragEnter = (e) => {
//         e.preventDefault();
//         if (uploading) return;
//         dragCounter.current += 1;
//         setIsDragging(true);
//     };

//     const onDragLeave = (e) => {
//         e.preventDefault();
//         dragCounter.current -= 1;
//         if (dragCounter.current <= 0) {
//             dragCounter.current = 0;
//             setIsDragging(false);
//         }
//     };

//     const removeFile = () => {
//         setItem(null);
//         setError("");
//         onFileChange?.(null);
//     };

//     return (
//         <div
//             className="w-full"
//             onPaste={(e) => {
//                 if (!uploading && e.clipboardData?.files?.length) setFile(e.clipboardData.files[0]);
//             }}
//         >
//             {!item ? (
//                 <div
//                     role="button"
//                     tabIndex={uploading ? -1 : 0}
//                     aria-disabled={uploading}
//                     onClick={() => !uploading && inputRef.current?.click()}
//                     onKeyDown={(e) => !uploading && (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
//                     onDrop={onDrop}
//                     onDragEnter={onDragEnter}
//                     onDragLeave={onDragLeave}
//                     onDragOver={(e) => e.preventDefault()}
//                     className={`rounded-xl border border-dashed p-8 text-center transition-colors duration-200 outline-none
//                         ${uploading ? "opacity-50 cursor-not-allowed border-lines-divider" : "cursor-pointer border-lines-divider hover:border-primary/40 hover:bg-primary/3"}
//                         ${isDragging ? "border-primary bg-primary/5" : ""}`}
//                 >
//                     <input
//                         ref={inputRef}
//                         type="file"
//                         className="hidden"
//                         onChange={onInputChange}
//                         accept={acceptedExts.map((e) => `.${e}`).join(",")}
//                         disabled={uploading}
//                     />

//                     <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
//                         <UploadCloud className="h-5 w-5 text-primary" strokeWidth={1.75} />
//                     </div>
//                     <p className="text-[13px] font-medium text-content-default">
//                         <span className="text-primary">Click to upload</span> or drag and drop
//                     </p>
//                     <p className="mt-1 text-[12px] text-content-deemphasized">
//                         {acceptedExts.join(", ").toUpperCase()} &middot; Max {maxSizeMB}MB
//                     </p>
//                 </div>
//             ) : (
//                 <div className="flex animate-fade-in items-center gap-3 rounded-xl bg-surface-emphasized p-3.5">
//                     <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-default">
//                         <img src={CATEGORY_MAP[item.category].icon} alt="" className="h-5 w-5 object-contain" />
//                     </div>

//                     <div className="min-w-0 flex-1">
//                         <p className="truncate text-[13px] font-medium text-content-default">
//                             {item.file.name}
//                         </p>
//                         <p className="text-[11px] text-content-deemphasized mt-0.5">
//                             {formatBytes(item.file.size)}
//                         </p>
//                     </div>

//                     <IconButton onClick={removeFile} disabled={uploading} size="small">
//                         <X size={16} />
//                     </IconButton>
//                 </div>
//             )}

//             {error && (
//                 <p className="mt-2 flex items-center gap-1.5 text-[13px] text-danger font-medium" role="alert">
//                     <AlertTriangle className="h-4 w-4 shrink-0" />
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }








 
import React, { useRef, useState, useCallback } from "react";
import { UploadCloud, X, AlertTriangle } from "lucide-react";
import { pdfFileIcon, docsFileIcon, noteIcon } from "../../assets/assets.js";
import { IconButton } from "@mui/material";

const CATEGORY_MAP = {
    pdf: {
        exts: ["pdf"],
        mimes: ["application/pdf"],
        icon: pdfFileIcon,
    },
    docx: {
        exts: ["docx"],
        mimes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        icon: docsFileIcon,
    },
    txt: {
        exts: ["txt"],
        mimes: ["text/plain"],
        icon: noteIcon,
    },
};

const ALL_ALLOWED_EXTS = Object.values(CATEGORY_MAP).flatMap((c) => c.exts);

function getExt(name = "") {
    return name.split(".").pop().toLowerCase();
}

function getCategory(file) {
    const ext = getExt(file.name);
    for (const [key, cfg] of Object.entries(CATEGORY_MAP)) {
        if (cfg.exts.includes(ext)) return key;
        if (cfg.mimes.some((m) => file.type?.startsWith(m))) return key;
    }
    return null;
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FileUploadBox({
    maxSizeMB = 20,
    acceptedExts = ALL_ALLOWED_EXTS,
    uploading,
    onFileChange,
}) {
    const [item, setItem] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState("");

    const inputRef = useRef(null);
    const dragCounter = useRef(0);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validate = (file) => {
        const ext = getExt(file.name);
        if (file.size === 0) return "File is empty.";
        if (!acceptedExts.includes(ext)) {
            return `".${ext || "unknown"}" is not supported. Allowed: ${acceptedExts.join(", ").toUpperCase()}.`;
        }
        if (file.size > maxSizeBytes) return `File exceeds the ${maxSizeMB}MB limit.`;
        return null;
    };

    const setFile = useCallback(
        (file) => {
            if (!file || uploading) return; // upload chalte hue naya file select/drop block
            setError("");

            const err = validate(file);
            if (err) {
                setError(err);
                onFileChange?.(null);
                return;
            }

            setItem({ file, category: getCategory(file) });
            onFileChange?.(file);
        },
        [maxSizeBytes, acceptedExts, onFileChange, uploading]
    );

    const onInputChange = (e) => {
        setFile(e.target.files?.[0]);
        e.target.value = "";
    };

    const onDrop = (e) => {
        e.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        setFile(e.dataTransfer.files?.[0]);
    };

    const onDragEnter = (e) => {
        e.preventDefault();
        if (uploading) return;
        dragCounter.current += 1;
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragging(false);
        }
    };

    const removeFile = () => {
        setItem(null);
        setError("");
        onFileChange?.(null);
    };

    return (
        <div
            className="w-full"
            onPaste={(e) => {
                if (!uploading && e.clipboardData?.files?.length) setFile(e.clipboardData.files[0]);
            }}
        >
            {!item ? (
                <div
                    role="button"
                    tabIndex={uploading ? -1 : 0}
                    aria-disabled={uploading}
                    onClick={() => !uploading && inputRef.current?.click()}
                    onKeyDown={(e) => !uploading && (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
                    onDrop={onDrop}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDragOver={(e) => e.preventDefault()}
                    className={`rounded-xl border border-dashed p-8 text-center transition-colors duration-200 outline-none
                        ${uploading ? "opacity-50 cursor-not-allowed border-lines-divider" : "cursor-pointer border-lines-divider hover:border-primary/40 hover:bg-primary/[0.03]"}
                        ${isDragging ? "border-primary bg-primary/[0.05]" : ""}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        className="hidden"
                        onChange={onInputChange}
                        accept={acceptedExts.map((e) => `.${e}`).join(",")}
                        disabled={uploading}
                    />

                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                        <UploadCloud className="h-5 w-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <p className="text-[13px] font-medium text-content-default">
                        <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-[12px] text-content-deemphasized">
                        {acceptedExts.join(", ").toUpperCase()} &middot; Max {maxSizeMB}MB
                    </p>
                </div>
            ) : (
                <div className="flex animate-fade-in items-center gap-3 rounded-xl bg-surface-emphasized p-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-default">
                        <img src={CATEGORY_MAP[item.category].icon} alt="" className="h-5 w-5 object-contain" />
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-content-default">
                            {item.file.name}
                        </p>
                        <p className="text-[11px] text-content-deemphasized mt-0.5">
                            {formatBytes(item.file.size)}
                        </p>
                    </div>

                    <IconButton onClick={removeFile} disabled={uploading} size="small">
                        <X size={16} />
                    </IconButton>
                </div>
            )}

            {error && (
                <p className="mt-2 flex items-center gap-1.5 text-[13px] text-danger font-medium" role="alert">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                </p>
            )}
        </div>
    );
}