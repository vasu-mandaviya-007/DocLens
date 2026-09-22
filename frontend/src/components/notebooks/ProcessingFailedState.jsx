import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@mui/material";

export default function ProcessingFailedState({ errorMessage, onRetry }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" strokeWidth={1.75} />
            </div>

            <div className="space-y-1 max-w-sm">
                <h3 className="text-[15px] font-semibold text-content-default">Processing failed</h3>
                <p className="text-[13px] text-content-deemphasized leading-relaxed">
                    {errorMessage || "We couldn't process this document. Try uploading it again."}
                </p>
            </div>

            <Button
                variant="text"
                onClick={onRetry}
                startIcon={<RefreshCw className="w-3.5 h-3.5" />}
                sx={{
                    borderRadius: "10px",
                    textTransform: "none",
                    fontWeight: 500,
                    color: "var(--color-primary)",
                }}
            >
                Upload again
            </Button>
        </div>
    );
}