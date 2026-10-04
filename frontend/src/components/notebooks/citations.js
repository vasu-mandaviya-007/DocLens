// Citation format ka single source of truth (frontend side). Backend: app/services/citations.py
// Format: [S1], [S1][S3], [S1, S3]

const CITATION_SOURCE = String.raw`[\[【]S(\d+(?:\s*,\s*S?\d+)*)(?:†[^\]】]*)?[\]】]`;

// Global regex ko share nahi karte (lastIndex state bug), isliye har baar fresh instance.
export const makeCitationRe = () => new RegExp(CITATION_SOURCE, "g");

export const parseCitationIds = (group) => (group.match(/\d+/g) ?? []).map(Number);

// Copy karte time markers hatao (marker ke pehle ka space bhi)
export const stripCitations = (text) =>
    text.replace(new RegExp(String.raw`[ \t]*` + CITATION_SOURCE, "g"), "");

// Streaming ke beech adhura marker ("[", "[S", "[S1,") chhupao taaki flicker na ho
export const hidePartialCitation = (text) => text.replace(/[\[【](?:S\d*(?:\s*,\s*S?\d*)*)?$/, "");