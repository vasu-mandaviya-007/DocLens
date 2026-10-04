import { useEffect } from "react";
import toast from "react-hot-toast";
import { getNotebookStatus } from "../apis/notebookApi.js";

export function useDocumentStatusPolling(notebookId, doc, setDoc, setDocumentUrl) {  

    useEffect(() => {
        
        if (!doc || doc.status !== "processing") return;   

        let cancelled = false;
        let timeoutId;
        let errorAttempts = 0;
        const MAX_ERROR_ATTEMPTS = 15;  

        const poll = async () => {
            try {
                const res = await getNotebookStatus(notebookId);
                if (cancelled) return;

                errorAttempts = 0;
                const data = res.data.data;
                console.log(data);
                
                setDoc((prev) => (prev ? { ...prev, ...data } : prev));
                if (data.document_url) setDocumentUrl(data.document_url);

                if (data.status === "processing") {
                    timeoutId = setTimeout(poll, 3000);
                } else if (data.status === "ready") {
                    toast.success("Document is ready — you can start asking questions!");
                } else if (data.status === "failed") {
                    toast.error(data.error_message || "Document processing failed");
                }
            } catch (err) {
                if (cancelled) return;
                errorAttempts += 1;
                if (errorAttempts >= MAX_ERROR_ATTEMPTS) {
                    toast.error("Couldn't check document status. Please refresh the page.");
                    return;
                }
                timeoutId = setTimeout(poll, 5000);
            }
        };

        timeoutId = setTimeout(poll, 3000);

        return () => {
            cancelled = true;
            clearTimeout(timeoutId); 
        };
    }, [notebookId, doc?.status, setDoc, setDocumentUrl]); 

}