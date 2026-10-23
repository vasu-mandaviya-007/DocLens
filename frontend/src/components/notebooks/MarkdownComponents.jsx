
// MAIN


// import { Copy, Check } from "lucide-react"; 
// import { useState } from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// function CodeBlock({ inline, className, children, ...props }) {
//     const [copied, setCopied] = useState(false);
//     const match = /language-(\w+)/.exec(className || "");
//     const language = match ? match[1] : "text";
//     const codeText = String(children).replace(/\n$/, "");

//     // --- Inline Code (e.g. `const x = 5`) ---
//     if (inline) {
//         return (
//             <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-brand-primary dark:text-blue-400 text-[0.85em] font-mono" {...props}>
//                 {children}
//             </code>
//         );
//     }

//     // --- Multi-line Code Block with Syntax Highlighting ---
//     const handleCopy = () => {
//         navigator.clipboard.writeText(codeText);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <div className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800/80 shadow-lg group">
//             {/* Header / Top Bar */}
//             <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
//                 <span className="text-xs font-mono lowercase tracking-wide text-zinc-300">
//                     {language}
//                 </span>
//                 <button
//                     onClick={handleCopy}
//                     className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
//                 >
//                     {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
//                     {copied ? "Copied" : "Copy"}
//                 </button>
//             </div>

//             {/* The Actual Code (Syntax Highlighted) */}
//             <div className="text-[13.5px]">
//                 <SyntaxHighlighter
//                     style={vscDarkPlus} // VS Code Dark Theme jaisa look
//                     language={language}
//                     PreTag="div"
//                     customStyle={{
//                         margin: 0,
//                         padding: '1rem',
//                         background: 'transparent',
//                         fontSize: '13.5px',
//                         lineHeight: '1.6',
//                     }}
//                     {...props}
//                 >
//                     {codeText}
//                 </SyntaxHighlighter>
//             </div>
//         </div>
//     );
// }

// export const markdownComponents = {
//     code: CodeBlock,   
// };













import { Check, Copy } from "lucide-react";
import { Children, isValidElement } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCopyToClipboard } from "../../hooks/useCopyToClipboard.js";


const LANGUAGE_RE = /language-([\w+#-]+)/;


function CodeBlock({ className, children }) {

    const { copied, copy } = useCopyToClipboard(2000);
    const language = LANGUAGE_RE.exec(className ?? "")?.[1] ?? "text"; 
    const code = String(children ?? "").replace(/\n$/, "");

    return (

        <div onPointerUp={(e)=> e.stopPropagation()} className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800/80 shadow-lg">
            
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <span className="text-xs font-mono lowercase tracking-wide text-zinc-300">{language}</span>
                <button
                    type="button"
                    onClick={() => copy(code)}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            <div className="text-[13.5px]">

                <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "13.5px",
                        lineHeight: "1.6",
                        overflowX: "auto",
                    }}
                >
                    {code}
                </SyntaxHighlighter>
                
            </div>

        </div>
    );
}


function PreBlock({ children }) {
    const child = Children.toArray(children)[0];
    if (!isValidElement(child)) return <pre>{children}</pre>;
    return <CodeBlock className={child.props.className}>{child.props.children}</CodeBlock>;
}


function InlineCode({ children }) {
    return (
        <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-brand-primary dark:text-blue-400 text-[0.85em] font-mono">
            {children}
        </code>
    );
}


function ScrollableTable({ children }) {
    return (
        <div className="my-4 w-full overflow-x-auto">
            <table>{children}</table>
        </div>
    );
}


export const markdownComponents = {
    pre: PreBlock,
    code: InlineCode,
    table: ScrollableTable,
};