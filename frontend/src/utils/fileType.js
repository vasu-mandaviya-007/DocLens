export function inferFileType(filename = "") {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (ext === "docx") return "docx";
    if (ext === "md") return "markdown";
    if (ext === "txt") return "text";
    return "pdf";
} 