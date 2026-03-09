import toast from "react-hot-toast";

type ErrorResponse = {
    error?: string;
    detail?: string;
    message?: string;
    [key: string]: unknown;
};

export const handleApiError = (error: unknown, defaultMessage: string = "Something went wrong") => {
    console.error("API Error:", error);

    let message = defaultMessage;

    if (typeof error === "string") {
        message = error;
    } else if (error && typeof error === "object") {
        const err = error as Record<string, unknown>;
        if (err.response && typeof err.response === "object") {
            const data = (err.response as Record<string, unknown>).data as ErrorResponse | undefined;
            if (data) {
                message = (data.error || data.detail || data.message || defaultMessage) as string;
            }
        } else if (err.error || err.detail || err.message) {
            message = ((err.error || err.detail || err.message || defaultMessage) as string);
        }
    }

    toast.error(message);
    return message;
};
