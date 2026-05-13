/**
 * Evidence type labels (must match staff submit UI) → allowed file extensions (lowercase, with dot).
 */
const EVIDENCE_TYPE_EXTENSIONS = {
  "Document (PDF/Word)": [".pdf", ".doc", ".docx"],
  Image: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
};

const DEFAULT_TYPE = "Document (PDF/Word)";

function fileNameMatchesEvidenceType(originalFileName, evidenceType) {
  const name = String(originalFileName || "").toLowerCase();
  const key = EVIDENCE_TYPE_EXTENSIONS[evidenceType] ? evidenceType : DEFAULT_TYPE;
  const exts = EVIDENCE_TYPE_EXTENSIONS[key];
  return exts.some((ext) => name.endsWith(ext));
}

module.exports = {
  EVIDENCE_TYPE_EXTENSIONS,
  DEFAULT_EVIDENCE_TYPE: DEFAULT_TYPE,
  fileNameMatchesEvidenceType,
};
