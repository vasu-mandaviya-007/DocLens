import api from "./axiosClient.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createNotebook = () => api.post("/api/notebook");

export const uploadDocument = (notebookId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/notebook/${notebookId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const renameNotebook = (notebookId, title) =>
    api.patch(`/api/notebook/${notebookId}`, { title }); // TODO: backend route prefix mismatch — confirm "/notebook" vs "/notebooks" once fixed

export const pinnNotebook = (notebookId) => api.post(`/api/pin-notebook/${notebookId}`);


export const deleteNotebook = (notebookId) =>
    api.delete(`/api/notebook/${notebookId}`);


export const getNotebook = (notebookId) => api.get(`/api/notebook/${notebookId}`);

export const getNotebooks = () => api.get("/api/notebooks");

export const getNotebookStatus = (notebookId) =>
    api.get(`/api/notebook/${notebookId}/status`);

export const getMessages = (notebookId) => api.get(`/api/notebook/${notebookId}/messages`);

export const sendMessage = (notebookId, text) =>
    api.post(`/api/notebook/${notebookId}/chat`, { text });



export async function sendMessageStream(notebookId, text, { onCitations, onToken, onReset, onDone, onError }) {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api/notebook/${notebookId}/chat`, { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ text }),
        });
    } catch (err) {
        onError?.("Network error. Please check your connection.");
        return;
    }

    if (!response.ok || !response.body) { 
        let detail = "Failed to connect";  
        try {
            const errJson = await response.json();
            console.log(errJson);
            
            detail = errJson?.error?.message || detail;
        } catch { }
        onError?.(detail);
        return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let terminated = false;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const parts = buffer.split("\n\n");
            buffer = parts.pop();

            for (const part of parts) {
                const eventMatch = part.match(/^event: (.+)$/m);
                const dataMatch = part.match(/^data: ([\s\S]+)$/m);
                if (!eventMatch || !dataMatch) continue;

                const eventType = eventMatch[1];
                const dataRaw = dataMatch[1];

                if (eventType === "token") {
                    const parsed = JSON.parse(dataRaw);
                    onToken?.(parsed.content);
                } else if (eventType === "citations") {
                    onCitations?.(JSON.parse(dataRaw).citations);
                } else if (eventType === "reset") {
                    onReset?.();
                } else if (eventType === "done") {
                    terminated = true;
                    onDone?.(JSON.parse(dataRaw));
                } else if (eventType === "error") {
                    terminated = true;
                    onError?.(JSON.parse(dataRaw).message);
                }
            }
        }
    } catch (err) {
        onError?.("Connection interrupted. Please try again.");
        return;
    }

    if (!terminated) {
        onError?.("The response ended unexpectedly. Please try again.");
    }
}


