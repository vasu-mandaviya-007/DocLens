
export const parseApiError = (err) => {
    const errorObj = err?.response?.data?.error;

    if (errorObj) {
        return {
            message: errorObj.message || "Something went wrong",
            fields: errorObj.fields || {},
        };
    }

    // Response aaya hi nahi — network down, server unreachable, CORS block, etc.
    if (!err?.response) {
        return {
            message: "Network error. Please check your connection.",
            fields: {},
        };
    }

    // Backend se koi unexpected shape aaya (jo humare handlers cover nahi karte)
    return {
        message: "Something went wrong. Please try again.",
        fields: {},
    };
};