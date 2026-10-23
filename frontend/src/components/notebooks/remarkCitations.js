
import { findAndReplace } from "mdast-util-find-and-replace";
import { makeCitationRe, parseCitationIds } from "./citations.js";

export const CITE_PREFIX = "#cite-";


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