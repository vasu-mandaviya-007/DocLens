import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { FileText, Loader2 } from "lucide-react";
import remarkGfm from "remark-gfm";

export default function MarkdownPreviewPanel({ documentUrl }) {
    const [markdown, setMarkdown] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!documentUrl) return;

        let cancelled = false;
        setLoading(true);
        setError(false);

        fetch(documentUrl)
            .then((res) => {
                if (!res.ok) throw new Error("Could not fetch document");
                return res.text();
            })
            .then((body) => {
                if (!cancelled) setMarkdown(body);
            })
            .catch(() => {
                if (!cancelled) setError(true);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [documentUrl]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-content-deemphasized animate-spin" />
            </div>
        );
    }

    if (error || markdown === null) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-2.5 text-center px-6">
                <FileText className="w-6 h-6 text-content-deemphasized" strokeWidth={1.5} />
                <p className="text-xs font-medium text-content-deemphasized">Preview unavailable</p>
            </div>
        );
    }

    return (
        <div className="h-full prose prose-zinc dark:prose-invert prose-p:leading-relaxed overflow-y-auto px-6 py-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
    );
}