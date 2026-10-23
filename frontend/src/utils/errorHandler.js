
const GENERIC_MESSAGE = "Something went wrong. Please try again.";

const messageFromDetail = (detail) => {
    if (typeof detail === "string") return detail;
    if (detail?.message) return detail.message;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return null;
};


export const parseApiError = (err) => { 
    const response = err?.response;

    if (!response) {
        return {
            message: "Network error. Please check your connection.",
            fields: {},
            status: null,
            code: null,
        };
    }

    const { status, data } = response;

    if (data?.error) {
        return {
            message: data.error.message || GENERIC_MESSAGE, 
            fields: data.error.fields || {},
            status,
            code: data.error.code ?? null,
        };
    }

    return {
        message: messageFromDetail(data?.detail) || GENERIC_MESSAGE,
        fields: {},
        status,
        code: null,
    };
};