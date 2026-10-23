
const CODE_EXTENSIONS = new Set([
    "py", "js", "jsx", "ts", "tsx", "java", "c", "cpp", "h", "hpp", "cs", "go", "rs", "rb", "php",
    "kt", "swift", "sql", "sh", "html", "css", "json", "yaml", "yml", "xml", "toml", "ini", "csv",
]);

export function inferFileType(filename = "") {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (ext === "docx") return "docx";
    if (ext === "md") return "markdown";
    if (ext === "txt" || CODE_EXTENSIONS.has(ext)) return "text";
    return "pdf";
}