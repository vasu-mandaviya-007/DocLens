
// export const parseApiError = (err) => {
//     const errorObj = err?.response?.data?.error;

//     if (errorObj) {
//         return {
//             message: errorObj.message || "Something went wrong",
//             fields: errorObj.fields || {},
//         };
//     }

//     // Response aaya hi nahi — network down, server unreachable, CORS block, etc.
//     if (!err?.response) {
//         return {
//             message: "Network error. Please check your connection.",
//             fields: {},
//         };
//     }

//     // Backend se koi unexpected shape aaya (jo humare handlers cover nahi karte)
//     return {
//         message: "Something went wrong. Please try again.", 
//         fields: {},
//     };
// };









// src/utils/errorHandler.js

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

// Raw FastAPI HTTPException ke shapes: { detail: "..." } | { detail: { message } } | { detail: [{ msg }] }
const messageFromDetail = (detail) => {
    if (typeof detail === "string") return detail;
    if (detail?.message) return detail.message;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    return null;
};

/**
 * Backend ke dono error shapes ko ek hi shape me badalta hai:
 *   { message, fields, status, code }
 * fields hamesha object hota hai (kabhi null/undefined nahi), to `fields.otp` safe hai.
 */
export const parseApiError = (err) => { 
    const response = err?.response;

    // Response aaya hi nahi: network down, server unreachable, ya CORS block
    if (!response) {
        return {
            message: "Network error. Please check your connection.",
            fields: {},
            status: null,
            code: null,
        };
    }

    const { status, data } = response;

    // Hamara standard shape: { success:false, error:{ code, message, fields } }
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