
// import api from "./axiosClient.js";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// export const createNotebook = () => api.post("/api/notebook");

// export const uploadDocument = (notebookId, file, onProgress) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     return api.post(`/api/notebook/${notebookId}/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         onUploadProgress: (event) => {
//             if (onProgress && event.total) {
//                 onProgress(Math.round((event.loaded * 100) / event.total));
//             }
//         },
//     });
// };

// export const renameNotebook = (notebookId, title) =>
//     api.patch(`/api/notebook/${notebookId}`, { title });

// export const pinnNotebook = (notebookId) => api.post(`/api/pin-notebook/${notebookId}`);

// export const deleteNotebook = (notebookId) =>
//     api.delete(`/api/notebook/${notebookId}`);

// export const getNotebook = (notebookId) => api.get(`/api/notebook/${notebookId}`);

// export const getNotebooks = () => api.get("/api/notebooks");

// export const getNotebookStatus = (notebookId) =>
//     api.get(`/api/notebook/${notebookId}/status`);

// export const getMessages = (notebookId) => api.get(`/api/notebook/${notebookId}/messages`);

// export const getUsage = () => api.get("/api/auth/usage");

// export const sendMessage = (notebookId, text) =>
//     api.post(`/api/notebook/${notebookId}/chat`, { text });


// export async function sendMessageStream(notebookId, text, { onCitations, onToken, onReset, onDone, onError }) {
//     let response;
//     try {
//         response = await fetch(`${API_BASE_URL}/api/notebook/${notebookId}/chat`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" }, 
//             credentials: "include",
//             body: JSON.stringify({ text }),
//         });
//     } catch (err) {
//         onError?.("Network error. Please check your connection.");
//         return;
//     }

//     // Quota/validation errors backend me stream shuru hone se PEHLE fail
//     // hote hain (normal JSON response, event-stream nahi). Yahan poora
//     // error object pass karo (message ke saath code/fields bhi), taaki
//     // caller RATE_LIMIT_EXCEEDED jaisे specific cases handle kar sake —
//     // pehle sirf message string jaati thi, code/fields discard ho jaate the.
//     if (!response.ok || !response.body) {
//         let errorPayload = null;
//         try {
//             errorPayload = await response.json();
//         } catch { }

//         const err = errorPayload?.error;
//         onError?.(err?.message || "Failed to connect", err ?? null);
//         return;
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder();
//     let buffer = "";
//     let terminated = false;

//     try {
//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;

//             buffer += decoder.decode(value, { stream: true });

//             const parts = buffer.split("\n\n");
//             buffer = parts.pop();

//             for (const part of parts) {
//                 const eventMatch = part.match(/^event: (.+)$/m);
//                 const dataMatch = part.match(/^data: ([\s\S]+)$/m);
//                 if (!eventMatch || !dataMatch) continue;

//                 const eventType = eventMatch[1];
//                 const dataRaw = dataMatch[1];

//                 if (eventType === "token") {
//                     const parsed = JSON.parse(dataRaw);
//                     onToken?.(parsed.content);
//                 } else if (eventType === "citations") {
//                     onCitations?.(JSON.parse(dataRaw).citations); 
//                 } else if (eventType === "reset") {
//                     onReset?.();
//                 } else if (eventType === "done") { 
//                     terminated = true;
//                     onDone?.(JSON.parse(dataRaw));
//                 } else if (eventType === "error") {
//                     terminated = true;
//                     const parsed = JSON.parse(dataRaw);
//                     onError?.(parsed.message, parsed);
//                 }
//             }
//         }
//     } catch (err) {
//         console.log(err);

//         onError?.("Connection interrupted. Please try again."); 
//         return;
//     }

//     if (!terminated) {
//         onError?.("The response ended unexpectedly. Please try again.");
//     }
// }





















import api from "./axiosClient.js";
import { useAuthStore } from "../store/authStore.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createNotebook = () => api.post("/api/notebook");

export const uploadDocument = (notebookId, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/notebook/${notebookId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
            if (onProgress && event.total) {
                onProgress(Math.round((event.loaded * 100) / event.total));
            }
        },
    });
};

export const renameNotebook = (notebookId, title) =>
    api.patch(`/api/notebook/${notebookId}`, { title });

export const pinnNotebook = (notebookId) => api.post(`/api/pin-notebook/${notebookId}`);

export const deleteNotebook = (notebookId) =>
    api.delete(`/api/notebook/${notebookId}`);

export const getNotebook = (notebookId) => api.get(`/api/notebook/${notebookId}`);

export const getNotebooks = () => api.get("/api/notebooks");

export const getNotebookStatus = (notebookId) =>
    api.get(`/api/notebook/${notebookId}/status`);

export const getMessages = (notebookId) => api.get(`/api/notebook/${notebookId}/messages`);

export const getUsage = () => api.get("/api/auth/usage");

export const sendMessage = (notebookId, text) =>
    api.post(`/api/notebook/${notebookId}/chat`, { text }); 


export const deleteChat = (notebookId) => api.delete(`/api/notebook/delete-chat/${notebookId}`)  

// fetch par axios interceptor kaam nahi karta, isliye refresh yahan manually handle karte hain.
// Axios interceptor wali hi refresh call use karte hain (api.post), taaki
// isRefreshing/pendingQueue logic ek hi jagah rahe aur parallel refresh na ho.
let streamRefreshPromise = null;

async function refreshSession() {
    // Agar multiple stream requests ek saath 401 khayen to sirf ek refresh chale
    if (!streamRefreshPromise) {
        streamRefreshPromise = api
            .post("/api/auth/refresh")
            .finally(() => {
                streamRefreshPromise = null;
            });
    }
    return streamRefreshPromise;
}

function doStreamFetch(notebookId, text) {
    return fetch(`${API_BASE_URL}/api/notebook/${notebookId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
    });
}

export async function sendMessageStream(notebookId, text, { onCitations, onToken, onReset, onDone, onError }) {
    let response;
    try {
        response = await doStreamFetch(notebookId, text);

        // Access token expire ho gaya -> ek baar refresh karke retry karo
        if (response.status === 401) {
            try {
                await refreshSession();
            } catch (refreshError) {
                // Refresh bhi fail: session truly khatam
                useAuthStore.getState().clearAuth();
                window.dispatchEvent(new CustomEvent("doclens:session-expired"));
                onError?.("Session expired. Please log in again.");
                return;
            }
            response = await doStreamFetch(notebookId, text);
        }
    } catch (err) {
        onError?.("Network error. Please check your connection.");
        return;
    }

    // Quota/validation errors backend me stream shuru hone se PEHLE fail
    // hote hain (normal JSON response, event-stream nahi). Poora error object
    // pass karo (message ke saath code/fields bhi), taaki caller
    // RATE_LIMIT_EXCEEDED jaisे specific cases handle kar sake.
    if (!response.ok || !response.body) {
        let errorPayload = null;
        try {
            errorPayload = await response.json();
        } catch { }

        const err = errorPayload?.error;
        onError?.(err?.message || "Failed to connect", err ?? null);
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
                    const parsed = JSON.parse(dataRaw);
                    onError?.(parsed.message, parsed);
                }
            }
        }
    } catch (err) {
        console.log(err);

        onError?.("Connection interrupted. Please try again.");
        return;
    }

    if (!terminated) {
        onError?.("The response ended unexpectedly. Please try again.");
    }
}