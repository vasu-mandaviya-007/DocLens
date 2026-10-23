
import { forwardRef } from "react";
import DocxPreviewPanel from "./DocxPreviewPanel.jsx";
import TextPreviewPanel from "./TextPreviewPanel.jsx";
import MarkdownPreviewPanel from "./MarkdownPreviewPanel.jsx";
import HeadlessPdfViewer from "./customPdfViewer/HeadlessPdfViewer.jsx"; 
import { inferFileType } from "../../utils/fileType.js";


const DocumentPreviewPanel = forwardRef(function DocumentPreviewPanel(
    { document, documentUrl, onExplain, onReady },
    ref
) {
    const fileType = inferFileType(document?.filename);

    if (fileType === "docx") {
        return <DocxPreviewPanel ref={ref} documentUrl={documentUrl} onReady={onReady} />;
    }
    if (fileType === "markdown") {
        return <MarkdownPreviewPanel ref={ref} documentUrl={documentUrl} onReady={onReady} />;
    }
    if (fileType === "text") {
        return <TextPreviewPanel ref={ref} documentUrl={documentUrl} onReady={onReady} />;
    }
    return <HeadlessPdfViewer ref={ref} documentUrl={documentUrl} onExplain={onExplain} onReady={onReady} />;
});

export default DocumentPreviewPanel;





