import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getNotebook } from "../apis/notebookApi.js";


export function useNotebookData(notebookId) {

    const navigate = useNavigate();

    const [pageLoading, setPageLoading] = useState(true); 
    const [doc, setDoc] = useState(null);
    const [documentUrl, setDocumentUrl] = useState(null); 
    const [title, setTitle] = useState(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setPageLoading(true);
            try {
                const response = await getNotebook(notebookId); 
                if (cancelled) return;
                const docData = response.data.data.document;
                if (docData?.document_url) setDocumentUrl(docData.document_url);
                setDoc(docData);
                setTitle(response.data.data.title);
            } catch (err) {
                if (cancelled) return;
                if (err?.response?.status === 404) {
                    toast.error("Notebook not found");
                    navigate("/", { replace: true });
                } else {
                    toast.error("Could not load notebook");
                }
            } finally { 
                if (!cancelled) setPageLoading(false); 
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [notebookId]);

    return { pageLoading, doc, setDoc, documentUrl, setDocumentUrl, title, setTitle };
}