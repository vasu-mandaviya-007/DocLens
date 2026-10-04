// import { visit } from 'unist-util-visit';

// export function remarkCitations() {
//     return (tree) => {
//         visit(tree, 'text', (node, index, parent) => {
//             if (!parent || index === null) return;

//             // ASCII [1] aur full-width 【1】 dono handle karo — Gemini
//             // kabhi-kabhi CJK-style full-width brackets use kar deta hai
//             // jabki Groq consistently ASCII use karta hai.
//             const regex = /\[(\d+)\]|【(\d+)】/g;
//             const value = node.value;
//             const matches = [...value.matchAll(regex)];
//             if (matches.length === 0) return;

//             const newNodes = [];
//             let cursor = 0;

//             for (const match of matches) {
//                 const start = match.index;
//                 const number = match[1] ?? match[2]; // jo bhi group match hua
//                 if (start > cursor) {
//                     newNodes.push({ type: 'text', value: value.slice(cursor, start) });
//                 }
//                 newNodes.push({
//                     type: 'citationMarker',
//                     children: [],
//                     data: {
//                         hName: 'citation-marker',
//                         hProperties: { number: Number(number) },
//                     },
//                 });
//                 cursor = start + match[0].length;
//             }
//             if (cursor < value.length) {
//                 newNodes.push({ type: 'text', value: value.slice(cursor) });
//             }

//             parent.children.splice(index, 1, ...newNodes);
//         });
//     };
// }









import { findAndReplace } from "mdast-util-find-and-replace";
import { makeCitationRe, parseCitationIds } from "./citations.js";

export const CITE_PREFIX = "#cite-";

// Markdown AST ke sirf *text* nodes me [S1] ko link me badalta hai.
// `code` aur `inlineCode` nodes me children/text nahi hote, isliye code kabhi corrupt nahi hota.
export default function remarkCitations() {
    return (tree) => {
        findAndReplace(tree, [
            [
                makeCitationRe(),
                (_match, group) =>
                    parseCitationIds(group).map((id) => ({
                        type: "link",
                        url: `${CITE_PREFIX}${id}`,
                        children: [{ type: "text", value: String(id) }],
                    })),
            ],
        ]);
    };
}