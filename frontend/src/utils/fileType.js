// export function inferFileType(filename = "") {
//     const ext = filename?.split(".").pop()?.toLowerCase();
//     if (ext === "docx") return "docx";
//     if (ext === "md") return "markdown";
//     if (ext === "txt") return "text";
//     return "pdf";
// } 







// Backend (document_extractor.py) ke _CODE_EXTENSIONS se match — isi list
// ko FileUploadBox.jsx me bhi duplicate rakha hai, dono jagah sync rakhna
// zaroori hai jab backend me naya extension add/remove ho.
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