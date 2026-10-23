
const CITATION_SOURCE = String.raw`[\[【]S(\d+(?:\s*,\s*S?\d+)*)(?:†[^\]】]*)?[\]】]`;

export const makeCitationRe = () => new RegExp(CITATION_SOURCE, "g");

export const parseCitationIds = (group) => (group.match(/\d+/g) ?? []).map(Number);

export const stripCitations = (text) =>
    text.replace(new RegExp(String.raw`[ \t]*` + CITATION_SOURCE, "g"), "");

export const hidePartialCitation = (text) => text.replace(/[\[【](?:S\d*(?:\s*,\s*S?\d*)*)?$/, "");