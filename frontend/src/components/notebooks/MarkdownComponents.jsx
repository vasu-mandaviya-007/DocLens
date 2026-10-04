

// import { Copy, Check } from "lucide-react"; 
// import { useState } from "react";

// function CodeBlock({ inline, className, children }) {
//     const [copied, setCopied] = useState(false);

//     const match = /language-(\w+)/.exec(className || "");
//     const language = match ? match[1] : null;
//     const codeText = String(children).replace(/\n$/, "");

//     // INLINE CODE (e.g., `const x = 5`)
//     if (inline) {
//         return (
//             <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-[0.875em] font-mono whitespace-pre-wrap">
//                 {children}
//             </code>
//         );
//     }

//     // MULTILINE CODE BLOCK (ChatGPT/Claude style)
//     const handleCopy = () => {
//         navigator.clipboard.writeText(codeText);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <div className="my-4 rounded-lg overflow-hidden bg-[#0d0d0d] border border-zinc-800 shadow-sm">
//             {/* Header */}
//             <div className="flex items-center justify-between px-4 py-2 bg-[#2f2f2f] text-zinc-400">
//                 <span className="text-xs font-mono lowercase tracking-wider">
//                     {language || "text"}
//                 </span>
//                 <button
//                     onClick={handleCopy}
//                     className="flex items-center gap-1.5 text-xs font-medium hover:text-zinc-100 transition-colors"
//                 >
//                     {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
//                     {copied ? "Copied!" : "Copy code"}
//                 </button>
//             </div>
//             {/* Code Body */}
//             <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono text-zinc-100">
//                 <code>{children}</code>
//             </div>
//         </div>
//     );
// }

// export const markdownComponents = {
//     // PARAGRAPHS & TEXT
//     p: ({ children }) => (
//         <p className="mb-4 last:mb-0 text-[15px] leading-[1.75] text-zinc-800 dark:text-zinc-200">
//             {children}
//         </p>
//     ),
//     strong: ({ children }) => (
//         <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
//             {children}
//         </strong>
//     ),
//     em: ({ children }) => (
//         <em className="italic text-zinc-800 dark:text-zinc-200">{children}</em>
//     ),

//     // LISTS (Standard, clean, exactly like ChatGPT)
//     ul: ({ children }) => (
//         <ul className="mb-4 pl-6 space-y-2 list-disc marker:text-zinc-400 dark:marker:text-zinc-500 text-[15px] text-zinc-800 dark:text-zinc-200">
//             {children}
//         </ul>
//     ),
//     ol: ({ children }) => (
//         <ol className="mb-4 pl-6 space-y-2 list-decimal marker:text-zinc-500 dark:marker:text-zinc-400 text-[15px] text-zinc-800 dark:text-zinc-200">
//             {children}
//         </ol>
//     ),
//     li: ({ children, className }) => {
//         if (className === "task-list-item") {
//             return <li className="list-none -ml-6 flex items-start gap-3 my-1">{children}</li>;
//         }
//         return <li className="leading-[1.75] pl-1">{children}</li>;
//     },
//     input: ({ checked }) => (
//         <input
//             type="checkbox"
//             checked={checked}
//             readOnly
//             className="mt-1.5 w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
//         />
//     ),

//     // LINKS
//     a: ({ href, children }) => (
//         <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-600/30 hover:decoration-blue-600 transition-colors"
//         >
//             {children}
//         </a>
//     ),

//     // CODE
//     code: CodeBlock,
//     pre: ({ children }) => <>{children}</>,

//     // BLOCKQUOTES
//     blockquote: ({ children }) => (
//         <blockquote className="my-4 pl-4 border-l-4 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
//             {children}
//         </blockquote>
//     ),

//     // HEADINGS (Pure typography, no graphics)
//     h1: ({ children }) => (
//         <h1 className="text-2xl font-bold mt-8 mb-4 first:mt-0 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-800 pb-2">
//             {children}
//         </h1>
//     ),
//     h2: ({ children }) => (
//         <h2 className="text-xl font-semibold mt-6 mb-3 first:mt-0 text-zinc-900 dark:text-zinc-100">
//             {children}
//         </h2>
//     ),
//     h3: ({ children }) => (
//         <h3 className="text-lg font-semibold mt-5 mb-2 first:mt-0 text-zinc-900 dark:text-zinc-100">
//             {children}
//         </h3>
//     ),
//     h4: ({ children }) => (
//         <h4 className="text-base font-semibold mt-4 mb-2 first:mt-0 text-zinc-900 dark:text-zinc-100">
//             {children}
//         </h4>
//     ),

//     hr: () => <hr className="my-6 border-zinc-200 dark:border-zinc-800" />,

//     // TABLES (Simple, border-collapse, clean headers)
//     table: ({ children }) => (
//         <div className="my-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
//             <table className="w-full text-[14px] text-left border-collapse">
//                 {children}
//             </table>
//         </div>
//     ),
//     thead: ({ children }) => (
//         <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
//             {children}
//         </thead>
//     ),
//     tbody: ({ children }) => (
//         <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
//             {children}
//         </tbody>
//     ),
//     tr: ({ children }) => (
//         <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
//             {children}
//         </tr>
//     ),
//     th: ({ children }) => (
//         <th className="px-4 py-3 font-semibold text-zinc-900 dark:text-zinc-100 align-top">
//             {children}
//         </th>
//     ),
//     td: ({ children }) => (
//         <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 align-top">
//             {children}
//         </td>
//     ),
// };








// import { Copy, Check } from "lucide-react";
// import { useState } from "react";

// function CodeBlock({ inline, className, children }) {
//     const [copied, setCopied] = useState(false);

//     const match = /language-(\w+)/.exec(className || "");
//     const language = match ? match[1] : null;
//     const codeText = String(children).replace(/\n$/, "");

//     if (inline) {
//         return (
//             <code className="px-1.5 py-0.5 rounded-md bg-surface-emphasized text-content-default text-[0.875em] font-mono whitespace-pre-wrap">
//                 {children}
//             </code>
//         );
//     }

//     const handleCopy = () => {
//         navigator.clipboard.writeText(codeText);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1500);
//     };

//     return (
//         <div className="group my-4 rounded-xl overflow-hidden border border-lines-divider">
//             <div className="flex items-center justify-between px-4 py-2 bg-surface-emphasized">
//                 <span className="text-[11px] font-mono lowercase tracking-wider text-content-deemphasized">
//                     {language || "text"}
//                 </span>
//                 <button
//                     onClick={handleCopy}
//                     className="flex items-center gap-1.5 text-[11px] font-medium text-content-deemphasized hover:text-content-default transition-colors"
//                 >
//                     {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
//                     {copied ? "Copied" : "Copy"}
//                 </button>
//             </div>
//             <div className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-content-default bg-surface-default">
//                 <code>{children}</code>
//             </div>
//         </div>
//     );
// }

// export const markdownComponents = { 
//     p: ({ children }) => (
//         <p className="mb-4 last:mb-0 text-[14px] leading-[1.75] text-content-default">
//             {children}
//         </p>
//     ),
//     strong: ({ children }) => (
//         <strong className="font-semibold text-content-default">{children}</strong>
//     ),
//     em: ({ children }) => <em className="italic text-content-default">{children}</em>,

//     ul: ({ children }) => (
//         <ul className="mb-4 pl-6 space-y-2 list-disc marker:text-content-deemphasized text-[14px] text-content-default">
//             {children}
//         </ul>
//     ),
//     ol: ({ children }) => (
//         <ol className="mb-4 pl-6 space-y-2 list-decimal marker:text-content-deemphasized text-[14px] text-content-default">
//             {children}
//         </ol>
//     ),
//     li: ({ children, className }) => {
//         if (className === "task-list-item") {
//             return <li className="list-none -ml-6 flex items-start gap-3 my-1">{children}</li>;
//         }
//         return <li className="leading-[1.75] pl-1">{children}</li>;
//     },
//     input: ({ checked }) => (
//         <input
//             type="checkbox"
//             checked={checked}
//             readOnly
//             className="mt-1.5 w-4 h-4 rounded border-lines-divider text-primary focus:ring-primary"
//         />
//     ),

//     a: ({ href, children }) => (
//         <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-primary underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
//         >
//             {children}
//         </a>
//     ),

//     code: CodeBlock,
//     pre: ({ children }) => <>{children}</>,

//     blockquote: ({ children }) => (
//         <blockquote className="my-4 pl-4 border-l-2 border-lines-divider text-content-deemphasized">
//             {children}
//         </blockquote>
//     ),

//     h1: ({ children }) => (
//         <h1 className="text-[22px] font-semibold mt-8 mb-3 first:mt-0 text-content-default tracking-[-0.01em] border-b border-lines-divider pb-2">
//             {children}
//         </h1>
//     ),
//     h2: ({ children }) => (
//         <h2 className="text-[19px] font-semibold mt-6 mb-2.5 first:mt-0 text-content-default tracking-[-0.01em]">
//             {children}
//         </h2>
//     ),
//     h3: ({ children }) => (
//         <h3 className="text-[16px] font-semibold mt-5 mb-2 first:mt-0 text-content-default">
//             {children}
//         </h3>
//     ),
//     h4: ({ children }) => (
//         <h4 className="text-[14px] font-semibold mt-4 mb-2 first:mt-0 text-content-default">
//             {children}
//         </h4>
//     ),

//     hr: () => <hr className="my-6 border-lines-divider" />,

//     table: ({ children }) => (
//         <div className="my-4 overflow-x-auto rounded-xl border border-lines-divider">
//             <table className="w-full text-[13px] text-left border-collapse">{children}</table>
//         </div>
//     ),
//     thead: ({ children }) => (
//         <thead className="bg-surface-emphasized border-b border-lines-divider">{children}</thead>
//     ),
//     tbody: ({ children }) => (
//         <tbody className="divide-y divide-lines-divider">{children}</tbody>
//     ),
//     tr: ({ children }) => (
//         <tr className="hover:bg-surface-emphasized transition-colors">{children}</tr>
//     ),
//     th: ({ children }) => (
//         <th className="px-4 py-3.5 font-semibold text-content-default align-top">{children}</th>
//     ),
//     td: ({ children }) => (
//         <td className="px-4 py-2.5 text-content-deemphasized align-top">{children}</td>
//     ),
// };








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













// import { Copy, Check } from "lucide-react";
// import { isValidElement, useEffect, useRef, useState } from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// // ---------- Inline code: `like this` ----------
// // box-decoration-clone: chip wrap ho to bhi har line pe padding/border/radius sahi rahe
// function InlineCode({ children, className, node, ...props }) {
//     return (
//         <code
//             className="box-decoration-clone px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-[0.85em] font-mono font-medium break-words"
//             {...props}
//         >
//             {children}
//         </code>
//     );
// }

// // ---------- Block code: ```lang ... ``` ----------
// function CodeBlock({ language, code }) {
//     const [copied, setCopied] = useState(false);
//     const timeoutRef = useRef(null);

//     useEffect(() => () => clearTimeout(timeoutRef.current), []);

//     const handleCopy = async () => {
//         try {
//             await navigator.clipboard.writeText(code);
//             setCopied(true);
//             clearTimeout(timeoutRef.current);
//             timeoutRef.current = setTimeout(() => setCopied(false), 2000);
//         } catch {
//             // clipboard permission denied - silently ignore
//         }
//     };

//     return (
//         <div className="not-prose relative my-4 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800/80 shadow-lg">
//             <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
//                 <span className="text-xs font-mono lowercase tracking-wide text-blue-300">
//                     {language}
//                 </span>
//                 <button
//                     type="button"
//                     onClick={handleCopy}
//                     className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
//                 >
//                     {copied ? (
//                         <Check className="w-3.5 h-3.5 text-emerald-400" />
//                     ) : (
//                         <Copy className="w-3.5 h-3.5" />
//                     )}
//                     {copied ? "Copied" : "Copy"}
//                 </button>
//             </div>

//             <SyntaxHighlighter
//                 style={vscDarkPlus}
//                 language={language}
//                 PreTag="div"
//                 wrapLongLines
//                 customStyle={{
//                     margin: 0,
//                     padding: "1rem",
//                     background: "transparent",
//                     fontSize: "13.5px",
//                     lineHeight: "1.6",
//                 }}
//                 codeTagProps={{ style: { fontFamily: "inherit" } }}
//             >
//                 {code}
//             </SyntaxHighlighter>
//         </div>
//     );
// }

// // ---------- <pre> = hamesha block code ----------
// function Pre({ children }) {
//     const codeEl = Array.isArray(children) ? children[0] : children;

//     if (!isValidElement(codeEl)) {
//         return <pre>{children}</pre>;
//     }

//     const { className, children: codeChildren } = codeEl.props;
//     const match = /language-([\w-]+)/.exec(className || "");
//     const language = match ? match[1] : "text";
//     const code = String(codeChildren ?? "").replace(/\n$/, "");

//     return <CodeBlock language={language} code={code} />;
// }

// export const markdownComponents = {
//     pre: Pre,
//     code: InlineCode, // block code `pre` ke through jaata hai, yahan sirf inline aayega
// };













// import { Copy, Check } from "lucide-react";
// import { isValidElement, useEffect, useRef, useState } from "react";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// // Light language guess, sirf tab jab inline code ko block banana pade (language tag nahi hota)
// function guessLanguage(code) {
//     if (/=>|require\(|console\.|\b(const|let|var)\b|\bfunction\b/.test(code)) return "javascript";
//     if (/\bdef\b|\bprint\(|^\s*import\s|\belif\b/.test(code)) return "python";
//     if (/#include|\bstd::|\bint main\b|\bprintf\(/.test(code)) return "cpp";
//     if (/\bSELECT\b|\bINSERT\b|\bCREATE TABLE\b/i.test(code)) return "sql";
//     return "text";
// }

// // Inline chip ke liye "bahut lamba / statement jaisa" ka rule
// const isBlockLike = (text) => text.length > 45 || /=>|;|\n/.test(text);

// // ---------- Block code ----------
// // Saare tags <span> hain (display:block) taaki <p>/<li> ke andar bhi invalid HTML nesting na ho
// function CodeBlock({ language, code }) {
//     const [copied, setCopied] = useState(false);
//     const timeoutRef = useRef(null);

//     useEffect(() => () => clearTimeout(timeoutRef.current), []);

//     const handleCopy = async () => {
//         try {
//             await navigator.clipboard.writeText(code);
//             setCopied(true);
//             clearTimeout(timeoutRef.current);
//             timeoutRef.current = setTimeout(() => setCopied(false), 2000);
//         } catch {
//             // clipboard permission denied - ignore
//         }
//     };

//     return (
//         <span className="not-prose relative my-4 block rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800/80 shadow-lg">
//             <span className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
//                 <span className="text-xs font-mono lowercase tracking-wide text-blue-300">
//                     {language}
//                 </span>
//                 <button
//                     type="button"
//                     onClick={handleCopy}
//                     className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
//                 >
//                     {copied ? (
//                         <Check className="w-3.5 h-3.5 text-emerald-400" />
//                     ) : (
//                         <Copy className="w-3.5 h-3.5" />
//                     )}
//                     {copied ? "Copied" : "Copy"}
//                 </button>
//             </span>

//             <SyntaxHighlighter
//                 style={vscDarkPlus}
//                 language={language}
//                 PreTag="span"
//                 wrapLongLines
//                 customStyle={{
//                     display: "block",
//                     margin: 0,
//                     padding: "1rem",
//                     background: "transparent",
//                     fontSize: "13.5px",
//                     lineHeight: "1.6",
//                 }}
//                 codeTagProps={{ style: { fontFamily: "inherit" } }}
//             >
//                 {code}
//             </SyntaxHighlighter>
//         </span>
//     );
// }

// // ---------- Inline code: short names ke liye chip, lamba/statement ho to block ----------
// function InlineCode({ children, className, node, ...props }) {
//     const text = String(children ?? "");

//     if (isBlockLike(text)) {
//         return <CodeBlock language={guessLanguage(text)} code={text} />;
//     }

//     return (
//         <code
//             className="box-decoration-clone px-1.5 py-0.5 mx-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 text-blue-600 dark:text-blue-300 text-[0.85em] font-mono font-medium break-words"
//             {...props}
//         >
//             {children}
//         </code>
//     );
// }

// // ---------- <pre> = hamesha fenced block ----------
// function Pre({ children }) {
//     const codeEl = Array.isArray(children) ? children[0] : children;

//     if (!isValidElement(codeEl)) {
//         return <pre>{children}</pre>;
//     }

//     const { className, children: codeChildren } = codeEl.props;
//     const match = /language-([\w-]+)/.exec(className || "");
//     const code = String(codeChildren ?? "").replace(/\n$/, "");
//     const language = match ? match[1] : guessLanguage(code);

//     return <CodeBlock language={language} code={code} />;
// }

// export const markdownComponents = {
//     pre: Pre,
//     code: InlineCode,
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

// react-markdown v9+ me `inline` prop nahi hai. Block code hamesha <pre><code/></pre> hota hai,
// isliye `pre` ko override karke block handle karte hain, aur `code` sirf inline ke liye bachta hai.
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

// Wide tables page ko nahi todengi, apne container me scroll hongi
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