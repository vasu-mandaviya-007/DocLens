import "katex/dist/katex.min.css";
import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import CitationChip from "./CitationChip.jsx";
import { markdownComponents } from "./MarkdownComponents.jsx";
import remarkCitations, { CITE_PREFIX } from "./remarkCitations.js";  

// Module-level constants: plugin arrays stable rehte hain, to har render pe markdown re-parse setup nahi hota.
const REMARK_PLUGINS = [remarkGfm, remarkMath, remarkCitations];
const REHYPE_PLUGINS = [rehypeKatex];

const MarkdownRenderer = memo(function MarkdownRenderer({ text, citations, onCitationClick }) {

    const components = useMemo(
        () => ({
            ...markdownComponents,
            a: ({ href, children }) => { 
                if (href?.startsWith(CITE_PREFIX)) {
                    const id = Number(href.slice(CITE_PREFIX.length));
                    const citation = citations?.find((c) => c.id === id);
                    // Model ne invented id likha ho to chup-chaap hata do
                    return citation ? <CitationChip citation={citation} onViewSource={onCitationClick} /> : null;
                }
                return (
                    <a href={href} target="_blank" rel="noreferrer noopener">
                        {children}
                    </a>
                );
            },
        }),
        [citations, onCitationClick]
    );

    return (
        <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={components}>
            {text}
        </ReactMarkdown>
    );
});

export default MarkdownRenderer;