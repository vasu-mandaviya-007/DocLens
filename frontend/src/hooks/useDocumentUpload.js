import { useState } from "react";
import toast from "react-hot-toast";
import { uploadDocument } from "../apis/notebookApi.js";

export function useDocumentUpload(notebook_id, setDoc, setDocumentUrl, documentsExhausted, setUsage) {

    const [pendingFile, setPendingFile] = useState(null); 
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [limitModal, setLimitModal] = useState({ open: false, limitType: "documents", used: 0, total: 0 });

    const handleUpload = async () => {
        if (!pendingFile) return;

        if (documentsExhausted) { 
            setLimitModal({
                open: true,
                limitType: "documents",
                used: usage.documents.used,
                total: usage.documents.total,
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        try {
            const res = await uploadDocument(notebook_id, pendingFile, (percent) => {
                setUploadProgress(percent);
            });

            setDoc({
                filename: res.data.data.filename,
                status: res.data.data.status,
                page_count: null,
            });
            setDocumentUrl(null);
            setPendingFile(null);
            toast.success("Document uploaded");

            setUsage((prev) => prev && {
                ...prev,
                documents: { ...prev.documents, used: prev.documents.used + 1 },
            });

        } catch (err) {
            console.log(err);
            
            const errorData = err?.response?.data?.error;
            if (errorData?.code === "RATE_LIMIT_EXCEEDED") {
                setLimitModal({
                    open: true,
                    limitType: "documents",
                    used: errorData.fields?.used ?? 0,
                    total: errorData.fields?.total ?? 0,
                });
            } else {
                toast.error(errorData?.message || "Upload failed");
            }
        } finally {
            setIsUploading(false);
        }
    };


    const handleRetryUpload = () => {
        setDoc(null);
        setDocumentUrl(null);
        setPendingFile(null);
    };


    return {
        pendingFile,
        setPendingFile,
        isUploading,
        uploadProgress,
        limitModal,
        setLimitModal,
        handleUpload,
        handleRetryUpload,
    };

}