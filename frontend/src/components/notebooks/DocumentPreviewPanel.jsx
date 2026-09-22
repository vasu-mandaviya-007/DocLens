// import { forwardRef } from "react";
// import PdfPreviewPanel from "./PdfPreviewPanel.jsx";
// import DocxPreviewPanel from "./DocxPreviewPanel.jsx";
// import TextPreviewPanel from "./TextPreviewPanel.jsx";
// import { inferFileType } from "../../../../backend/app/utils/fileType.js";


// // Dispatcher — filename ke extension se decide karta hai konsa preview
// // component dikhana hai. NotebookSidebar isi ko render karta hai, ab
// // seedha PdfPreviewPanel ko nahi (jo sirf PDF handle kar sakta hai).
// const DocumentPreviewPanel = forwardRef(function DocumentPreviewPanel(
//     { document, documentUrl },
//     ref
// ) {
//     const fileType = inferFileType(document?.filename);

//     if (fileType === "docx") {
//         return <DocxPreviewPanel documentUrl={documentUrl} />;
//     }
//     if (fileType === "text") {
//         return <TextPreviewPanel documentUrl={documentUrl} />;
//     }
//     // PDF ke liye purana viewer as-is — jumpToPage/highlightText ref
//     // methods sirf isi case mein meaningful hain.
//     return <PdfPreviewPanel ref={ref} document={document} documentUrl={documentUrl} />;
// });

// export default DocumentPreviewPanel;











import { PDFViewer } from "@/components/extend/pdf-viewer";
import { DocxViewerPreview } from "@/components/extend/docx-viewer"; // TODO: agar install ke baad
// pata chale ki export ka naam
// alag hai (e.g. "DOCXViewerPreview"),
// isi line ko fix kar dena
import TextPreviewPanel from "./TextPreviewPanel.jsx";
import { inferFileType } from "../../../../backend/app/utils/fileType.js";

// Dispatcher — filename ke extension se decide karta hai konsa viewer
// dikhana hai. PDF aur DOCX ke liye Extend UI ke shadcn components,
// TXT ke liye apna lightweight fetch+<pre> viewer (Extend UI TXT nahi
// deta).
export default function DocumentPreviewPanel({ document, documentUrl }) {
    const fileType = inferFileType(document?.filename);

    if (fileType === "text") {
        return <TextPreviewPanel documentUrl={documentUrl} />;
    }

    if (fileType === "docx") {
        return (
            <DocxViewerPreview
                // TODO: prop naam "src" hai ya "file" ya "url" — installed
                // src/components/ui/docx-viewer.tsx kholke confirm karo,
                // (PDF viewer ke liye docs se "src" confirmed mila tha,
                // DOCX viewer ke liye nahi mila).
                src={documentUrl}
                fileName={document?.filename}
                className="w-full"
            />
        );
    }

    // Default: PDF
    return (
        <PDFViewer
            src={documentUrl}
            fileName={document?.filename}
            className="h-full"
        />
    );
}