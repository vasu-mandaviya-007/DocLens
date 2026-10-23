
import { UploadCloud, Plus, Loader2, Ban } from "lucide-react";
import { LinearProgress } from "@mui/material";
import FileUploadBox from "./FileUploadBox.jsx";

export default function UploadPrompt({ 
    pendingFile,
    setPendingFile, 
    uploading,
    progress,
    handleUpload,
    documentsExhausted = false,
    documentsRemaining = null, 
}) {

    return (

        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">

            <div className="w-full max-w-md flex flex-col items-center gap-7">

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${documentsExhausted ? "bg-danger/10" : "bg-surface-emphasized"}`}>
                    {documentsExhausted ? (
                        <Ban className="w-6 h-6 text-danger" strokeWidth={1.75} />
                    ) : (
                        <UploadCloud className="w-6 h-6 text-content-deemphasized" strokeWidth={1.75} />
                    )}
                </div>

                <div className="text-center space-y-1.5">

                    <h2 className="text-[19px] font-semibold text-content-default tracking-[-0.01em]">
                        {documentsExhausted ? "Daily upload limit reached" : "Add your first source"}
                    </h2>

                    <p className="text-[13px] text-content-deemphasized max-w-sm leading-relaxed">
                        {documentsExhausted
                            ? "You've used today's uploads. More open up tomorrow — check back after midnight UTC."
                            : "Upload a PDF, Word document, text, or Markdown file to start asking questions — every answer is grounded in the page."}
                    </p>

                </div>

                {/* Limit khatam hone par upload box hi mat dikhaओ — user ko
                    file select karke phir "disabled" button dekhne ka
                    confusing flow avoid karo, seedha saaf state dikhाओ. */}
                {!documentsExhausted && (
                    <div className="w-full">
                        <FileUploadBox onFileChange={setPendingFile} uploading={uploading} />
                    </div>
                )}

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

                {!documentsExhausted && (
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
                )}

                {!documentsExhausted && documentsRemaining !== null && (
                    <p className="text-[11px] text-content-deemphasized/70 font-medium -mt-3">
                        {documentsRemaining} upload{documentsRemaining === 1 ? "" : "s"} left today
                    </p>
                )}
            </div>
        </div>
    );
}