



// import { UploadCloud, Zap, Plus, Loader2 } from "lucide-react";
// import FileUploadBox from "../FileUploadBox.jsx";

// export default function UploadPrompt({ pendingFile, setPendingFile, uploading, progress, handleUpload }) {
//     return (
//         <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">

//             <div className="w-full max-w-lg flex flex-col items-center gap-6">

//                 <div className="relative">
//                     <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/30">
//                         <UploadCloud className="w-9 h-9 text-white" />
//                     </div>
//                     <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
//                         <Zap className="w-3 h-3 text-white" />
//                     </div>
//                 </div>

//                 <div className="text-center space-y-2">
//                     <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
//                         Add your first source
//                     </h2>
//                     <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
//                         Upload a PDF, Word document, or text file and start asking questions.
//                         Our AI reads every page to give you precise answers.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap justify-center gap-2">
//                     {["Instant answers", "Page citations", "Smart summaries"].map((f) => (
//                         <span
//                             key={f}
//                             className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary dark:text-blue-400 border border-brand-primary/20"
//                         >
//                             {f}
//                         </span>
//                     ))}
//                 </div>

//                 <div className="w-full">
//                     <FileUploadBox onFileChange={setPendingFile} />
//                 </div>

//                 <button
//                     id="upload-source-btn"
//                     onClick={handleUpload}
//                     disabled={!pendingFile || uploading}
//                     className={`flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${pendingFile && !uploading
//                         ? "bg-linear-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5"
//                         : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
//                         }`}
//                 >
//                     {uploading
//                         ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 <span>Uploading{progress ? ` ${Math.round(progress)}%` : "..."}</span>
//                             </>
//                         )
//                         : <><Plus className="w-4 h-4" /><span>Add source</span></>
//                     }
//                 </button>
//             </div>
//         </div>
//     );
// }









// import { UploadCloud, Zap, Plus, Loader2 } from "lucide-react";
// import { LinearProgress } from "@mui/material";
// import FileUploadBox from "../FileUploadBox.jsx";

// export default function UploadPrompt({ pendingFile, setPendingFile, uploading, progress, handleUpload }) {
//     return (
//         <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
//             <div className="w-full max-w-lg flex flex-col items-center gap-6">
//                 <div className="relative">
//                     <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow-2xl shadow-brand-primary/30">
//                         <UploadCloud className="w-9 h-9 text-white" />
//                     </div>
//                     <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
//                         <Zap className="w-3 h-3 text-white" />
//                     </div>
//                 </div>

//                 <div className="text-center space-y-2">
//                     <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
//                         Add your first source
//                     </h2>
//                     <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
//                         Upload a PDF, Word document, or text file and start asking questions.
//                         Our AI reads every page to give you precise answers.
//                     </p>
//                 </div>

//                 <div className="flex flex-wrap justify-center gap-2">
//                     {["Instant answers", "Page citations", "Smart summaries"].map((f) => (
//                         <span
//                             key={f}
//                             className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary dark:text-blue-400 border border-brand-primary/20"
//                         >
//                             {f}
//                         </span>
//                     ))}
//                 </div>

//                 <div className="w-full">
//                     <FileUploadBox onFileChange={setPendingFile} />
//                 </div>

//                 {uploading && (
//                     <div className="w-full">
//                         <LinearProgress
//                             variant={progress > 0 ? "determinate" : "indeterminate"}
//                             value={progress}
//                             sx={{
//                                 height: 6,
//                                 borderRadius: 999,
//                                 backgroundColor: "var(--color-surface-emphasized)",
//                                 "& .MuiLinearProgress-bar": { borderRadius: 999 },
//                             }}
//                         />
//                     </div>
//                 )}

//                 <button
//                     type="button"
//                     id="upload-source-btn"
//                     onClick={handleUpload}
//                     disabled={!pendingFile || uploading}
//                     aria-busy={uploading}
//                     className={`flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold transition-all duration-200 ${pendingFile && !uploading
//                         ? "bg-linear-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5"
//                         : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
//                         }`}
//                 >
//                     {uploading
//                         ? (
//                             <>
//                                 <Loader2 className="w-4 h-4 animate-spin" />
//                                 <span>Uploading{progress ? ` ${Math.round(progress)}%` : "..."}</span>
//                             </>
//                         )
//                         : <><Plus className="w-4 h-4" /><span>Add source</span></>
//                     }
//                 </button>
//             </div>
//         </div>
//     );
// }









// import { UploadCloud, Plus, Loader2 } from "lucide-react";
// import FileUploadBox from "../FileUploadBox.jsx";

// export default function UploadPrompt({ pendingFile, setPendingFile, uploading, progress, handleUpload }) {
//     return (
//         <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto animate-fade-in">
//             <div className="w-full max-w-lg flex flex-col items-center gap-10">

//                 <div className="text-center space-y-4">
//                     <div className="w-16 h-16 mx-auto rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
//                         <UploadCloud className="w-6 h-6 text-zinc-900 dark:text-white" strokeWidth={1.5} />
//                     </div>
//                     <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
//                         Add a source document
//                     </h2>
//                     <p className="text-[15px] text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mx-auto">
//                         Upload a PDF or text file. The AI will read every page to give you precise, cited answers.
//                     </p>
//                 </div>

//                 <div className="w-full">
//                     <FileUploadBox onFileChange={setPendingFile} />
//                 </div>

//                 <button
//                     type="button"
//                     id="upload-source-btn"
//                     onClick={handleUpload}
//                     disabled={!pendingFile || uploading}
//                     aria-busy={uploading}
//                     className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-[15px] font-medium transition-all duration-300 ${pendingFile && !uploading
//                             ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:scale-[1.02] shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
//                             : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
//                         }`}
//                 >
//                     {uploading ? (
//                         <>
//                             <Loader2 className="w-4 h-4 animate-spin" />
//                             <span>Uploading{progress ? ` ${Math.round(progress)}%` : "..."}</span>
//                         </>
//                     ) : (
//                         <>
//                             <Plus className="w-4 h-4" strokeWidth={2} />
//                             <span>Process Document</span>
//                         </>
//                     )}
//                 </button>
//             </div>
//         </div>
//     );
// }










import { UploadCloud, Plus, Loader2 } from "lucide-react";
import { LinearProgress } from "@mui/material";
import FileUploadBox from "./FileUploadBox.jsx";

export default function UploadPrompt({ pendingFile, setPendingFile, uploading, progress, handleUpload }) {

    return (

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">

            <div className="w-full max-w-md flex flex-col items-center gap-7">

                <div className="w-14 h-14 rounded-2xl bg-surface-emphasized flex items-center justify-center">
                    <UploadCloud className="w-6 h-6 text-content-deemphasized" strokeWidth={1.75} />
                </div>

                <div className="text-center space-y-1.5">

                    <h2 className="text-[19px] font-semibold text-content-default tracking-[-0.01em]">
                        Add your first source
                    </h2>

                    <p className="text-[13px] text-content-deemphasized max-w-sm leading-relaxed">
                        Upload a PDF, Word document, or text file to start asking questions —
                        every answer is grounded in the page.
                    </p>

                </div>

                <div className="w-full">
                    <FileUploadBox onFileChange={setPendingFile} uploading={uploading} />
                </div>

                {uploading && (

                    <div className="w-full">

                        <LinearProgress
                            variant={progress > 0 ? "determinate" : "indeterminate"}
                            value={progress}
                            sx={{
                                height: 3,
                                borderRadius: 999,
                                backgroundColor: "var(--color-surface-emphasized)",
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 999,
                                    backgroundColor: "var(--color-primary)",
                                },
                            }}
                        />

                    </div>

                )}

                <button
                    type="button"
                    id="upload-source-btn"
                    onClick={handleUpload}
                    disabled={!pendingFile || uploading}
                    aria-busy={uploading}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 active:scale-[0.97] ${pendingFile && !uploading
                        ? "bg-primary text-white hover:bg-primary-hover"
                        : "bg-surface-emphasized text-content-deemphasized cursor-not-allowed"
                        }`}
                >
                    {uploading
                        ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading{progress ? ` ${Math.round(progress)}%` : "..."}</span>
                            </>
                        )
                        : <><Plus className="w-3.5 h-3.5" /><span>Add source</span></>
                    }
                </button>
            </div>
        </div>
    );
}