// Filename ke extension se file type nikalta hai — Home.jsx (notebook card
// icon) aur preview panel dono isi ek jagah se use karte hain, taaki "pdf
// hardcoded" jaisi duplication/inconsistency dobara na ho.
export function inferFileType(filename = "") {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (ext === "docx") return "docx";
    if (ext === "txt") return "text";
    return "pdf";  
}