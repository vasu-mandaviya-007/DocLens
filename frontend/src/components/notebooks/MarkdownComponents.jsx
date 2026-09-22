// import { Sparkles, Hash, Copy, Check } from "lucide-react";
// import { memo, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// // Code block ke liye alag component — kyunki isme apna state chahiye (copy button ke liye)
// function CodeBlock({ inline, className, children }) {
//     const [copied, setCopied] = useState(false);

//     // className kuch aisa hota he: "language-python" — usse language nikal rahe hain
//     const match = /language-(\w+)/.exec(className || "");
//     const language = match ? match[1] : null;
//     const codeText = String(children).replace(/\n$/, "");

//     if (inline) {
//         return (
//             <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900/60 text-brand-primary dark:text-blue-400 text-[13px] font-mono">
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
//         <div className="mb-2 last:mb-0 rounded-xl overflow-hidden bg-zinc-900 dark:bg-black/60 border border-zinc-800">
//             {/* Header bar: language name + copy button — jaisa ChatGPT/Claude karte hain */}
//             <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/80 dark:bg-zinc-900/80 border-b border-zinc-700/50">
//                 <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
//                     {language || "text"}
//                 </span>
//                 <button
//                     onClick={handleCopy}
//                     className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors"
//                 >
//                     {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
//                     {copied ? "Copied" : "Copy"}
//                 </button>
//             </div>
//             <pre className="px-3 py-2.5 text-[13px] font-mono overflow-x-auto text-zinc-100">
//                 <code>{codeText}</code>
//             </pre>
//         </div>
//     );
// }

// // export const markdownComponents = {
// //     p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
// //     strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-50">{children}</strong>,
// //     em: ({ children }) => <em className="italic">{children}</em>,
// //     ul: ({ children }) => <ul className="list-disc pl-5 mb-2 last:mb-0 space-y-1">{children}</ul>,
// //     ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 last:mb-0 space-y-1">{children}</ol>,
// //     li: ({ children, className }) => {
// //         // task list items (- [ ] / - [x]) ko remarkGfm ek special class deta he
// //         if (className === "task-list-item") {
// //             return <li className="leading-relaxed list-none -ml-5 flex items-start gap-2">{children}</li>;
// //         }
// //         return <li className="leading-relaxed">{children}</li>;
// //     },
// //     input: ({ checked }) => (
// //         // checkbox list items ke liye (- [x] Done)
// //         <input
// //             type="checkbox"
// //             checked={checked}
// //             readOnly
// //             className="mt-1 accent-brand-primary"
// //         />
// //     ),
// //     a: ({ href, children }) => (
// //         <a
// //             href={href}
// //             target="_blank"
// //             rel="noopener noreferrer"
// //             className="text-brand-primary dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
// //         >
// //             {children}
// //         </a>
// //     ),
// //     code: CodeBlock,
// //     // 'pre' ko yahan explicitly render nahi karna — CodeBlock khud <pre> return karta he,
// //     // warna double-wrap ho jaayega (<pre><pre>...)
// //     pre: ({ children }) => <>{children}</>,
// //     blockquote: ({ children }) => (
// //         <blockquote className="border-l-2 border-brand-primary/40 pl-3 italic text-zinc-600 dark:text-zinc-400 mb-2 last:mb-0">
// //             {children}
// //         </blockquote>
// //     ),
// //     h1: ({ children }) => <h1 className="text-base font-bold mb-1.5 mt-1">{children}</h1>,
// //     h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5 mt-1">{children}</h2>,
// //     h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-1">{children}</h3>,

// //     // --- YE NAYA HAI: table support ---
// //     hr: () => <hr className="my-3 border-zinc-200 dark:border-zinc-700/60" />,

// //     table: ({ children }) => (
// //         // overflow-x-auto zaroori he — warna mobile pe wide table layout todegi
// //         <div className="mb-2 last:mb-0 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700/60">
// //             <table className="w-full text-xs sm:text-sm border-collapse">{children}</table>
// //         </div>
// //     ),
// //     thead: ({ children }) => (
// //         <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-700/60">
// //             {children}
// //         </thead>
// //     ),
// //     tbody: ({ children }) => (
// //         <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</tbody>
// //     ),
// //     tr: ({ children }) => <tr>{children}</tr>,
// //     th: ({ children }) => (
// //         <th className="px-3 py-2 text-left font-semibold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">
// //             {children}
// //         </th>
// //     ),
// //     td: ({ children }) => (
// //         <td className="px-3 py-2 text-zinc-600 dark:text-zinc-300 align-top">
// //             {children}
// //         </td>
// //     ),
// // };




// export const markdownComponents = {
//     p: ({ children }) => (
//         <p className="mb-3 last:mb-0 text-[14.5px] leading-[1.7]">{children}</p>
//     ),

//     strong: ({ children }) => (
//         <strong className="font-semibold text-content-deemphasized">{children}</strong>
//     ),

//     em: ({ children }) => <em className="italic text-zinc-700 dark:text-zinc-300">{children}</em>,

//     ul: ({ children }) => (
//         <ul className="mb-3 last:mb-0 space-y-1.5">{children}</ul>
//     ),
//     ol: ({ children }) => (
//         <ol className="mb-3 last:mb-0 space-y-1.5 list-decimal pl-5 marker:text-brand-primary marker:font-semibold">
//             {children}
//         </ol>
//     ),
//     li: ({ children, className }) => {
//         if (className === "task-list-item") {
//             return <li className="leading-relaxed list-none -ml-5 flex items-start gap-2">{children}</li>;
//         }
//         // custom bullet instead of default disc — thoda zyada "designed" lagta he
//         return (
//             <li className="leading-relaxed flex gap-2.5 text-[14.5px]">
//                 <span className="text-brand-primary mt-2 w-1 h-1 rounded-full bg-brand-primary shrink-0" />
//                 <span>{children}</span>
//             </li>
//         );
//     },

//     input: ({ checked }) => (
//         <input type="checkbox" checked={checked} readOnly className="mt-1 accent-brand-primary" />
//     ),

//     a: ({ href, children }) => ( 
//         <a
//             href={href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-brand-primary dark:text-blue-400 underline decoration-brand-primary/30 underline-offset-2 hover:decoration-brand-primary transition-colors"
//         >
//             {children}
//         </a>
//     ),

//     code: CodeBlock, // same as before
//     pre: ({ children }) => <>{children}</>, 

//     blockquote: ({ children }) => (
//         <blockquote className="my-3 pl-4 py-1 border-l-[3px] border-brand-primary/50 bg-brand-primary/5 dark:bg-brand-primary/10 rounded-r-lg text-zinc-600 dark:text-zinc-300 italic">
//             {children} 
//         </blockquote>
//     ),

//     // --- HEADINGS: ab colored accent bar + zyada spacing + subtle icon feel ---
//     h1: ({ children }) => (
//         <h1 className="text-lg font-bold mt-5 mb-2.5 first:mt-0 text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-700/60">
//             {children}
//         </h1>
//     ),
//     h2: ({ children }) => ( 
//         <h2 className="flex items-center gap-2 text-[15px] font-bold mt-5 mb-2 first:mt-0 text-zinc-900 dark:text-white">
//             <span className="w-1 h-4 rounded-full bg-linear-to-b from-brand-primary to-brand-secondary" />
//             {children}
//         </h2>
//     ),
//     h3: ({ children }) => ( 
//         <h3 className="text-base font-semibold mt-4 mb-1.5 first:mt-0 text-brand-primary dark:text-blue-400">
//             {children}
//         </h3>
//     ),

//     hr: () => <hr className="my-4 border-zinc-200 dark:border-zinc-700/60" />,

//     // --- TABLE: zyada polish — soft shadow, rounded, alternating rows, hover ---
//     table: ({ children }) => (
//         <div className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm"> 
//             <table className="w-full text-[13px] border-collapse">{children}</table>
//         </div>
//     ),
//     thead: ({ children }) => (
//         <thead className="bg-linear-to-r from-brand-primary/10 to-brand-secondary/10 dark:from-brand-primary/15 dark:to-brand-secondary/15">
//             {children}
//         </thead>
//     ),
//     tbody: ({ children }) => (
//         <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</tbody>
//     ),
//     tr: ({ children }) => (
//         <tr className="odd:bg-white even:bg-zinc-50/60 dark:odd:bg-transparent dark:even:bg-zinc-900/30 hover:bg-brand-primary/5 dark:hover:bg-brand-primary/10 transition-colors">
//             {children}
//         </tr>
//     ),
//     th: ({ children }) => (
//         <th className="px-3.5 py-2.5 text-left font-semibold text-zinc-800 dark:text-zinc-100 whitespace-nowrap text-[12.5px] uppercase tracking-wide">
//             {children}
//         </th>
//     ),
//     td: ({ children }) => (
//         <td className="px-3.5 py-2.5 text-zinc-600 dark:text-zinc-300 align-top">{children}</td>
//     ),
// };














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
//         <th className="px-4 py-2.5 font-semibold text-content-default align-top">{children}</th>
//     ),
//     td: ({ children }) => (
//         <td className="px-4 py-2.5 text-content-deemphasized align-top">{children}</td>
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






import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({ inline, className, children, ...props }) {
    const [copied, setCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "text";
    const codeText = String(children).replace(/\n$/, "");

    // --- Inline Code (e.g. `const x = 5`) ---
    if (inline) {
        return (
            <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-brand-primary dark:text-blue-400 text-[0.85em] font-mono" {...props}>
                {children}
            </code>
        );
    }

    // --- Multi-line Code Block with Syntax Highlighting ---
    const handleCopy = () => {
        navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-6 rounded-xl overflow-hidden bg-[#1e1e1e] border border-zinc-800/80 shadow-lg group">
            {/* Header / Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
                <span className="text-xs font-mono lowercase tracking-wide text-zinc-300">
                    {language}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            {/* The Actual Code (Syntax Highlighted) */}
            <div className="text-[13.5px]">
                <SyntaxHighlighter
                    style={vscDarkPlus} // VS Code Dark Theme jaisa look
                    language={language}
                    PreTag="div"
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: 'transparent',
                        fontSize: '13.5px',
                        lineHeight: '1.6',
                    }}
                    {...props}
                >
                    {codeText}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

export const markdownComponents = {
    code: CodeBlock,
    // Baaki sab kuch Tailwind Typography automatically handle karega!
};