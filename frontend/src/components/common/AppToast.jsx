import toast from "react-hot-toast";
import Toast from "./Toast.jsx"; 

/**
 * Drop-in replacement for react-hot-toast's default toast object.
 * Usage is identical: appToast.success("Notebook created")
 * Supports an optional second arg for a description line:
 *   appToast.success("Notebook created", { description: "You can start asking questions now." })
 */
const appToast = {
    success: (title, opts = {}) =>
        toast.custom(
            (t) => <Toast t={t} variant="success" title={title} description={opts.description} />,
            { duration: opts.duration ?? 3000, position : opts.position ?? "top-center" } 
        ),

    error: (title, opts = {}) =>
        toast.custom(
            (t) => <Toast t={t} variant="error" title={title} description={opts.description} />,
            { duration: opts.duration ?? 4000, position : opts.position ?? "top-center" }
        ),

    info: (title, opts = {}) =>
        toast.custom(
            (t) => <Toast t={t} variant="info" title={title} description={opts.description} />,
            { duration: opts.duration ?? 3000, position : opts.position ?? "top-center" }
        ),

    loading: (title, opts = {}) =>
        toast.custom(
            (t) => <Toast t={t} variant="loading" title={title} description={opts.description} />,
            { duration: opts.duration ?? Infinity, position : opts.position ?? "top-center" }
        ),

    dismiss: (id) => toast.dismiss(id),

    // For async flows: appToast.promise(apiCall(), { loading: "...", success: "...", error: "..." })
    promise: (promise, messages, opts = {}) => {
        const id = appToast.loading(messages.loading);
        promise
            .then((res) => {
                toast.dismiss(id);
                const successMsg =
                    typeof messages.success === "function" ? messages.success(res) : messages.success;
                appToast.success(successMsg, opts);
                return res;
            })
            .catch((err) => {
                toast.dismiss(id);
                const errorMsg =
                    typeof messages.error === "function" ? messages.error(err) : messages.error;
                appToast.error(errorMsg, opts);
                throw err;
            });
        return promise;
    },
};

export default appToast;