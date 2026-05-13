/** Must match backend `backend/constants/evidenceFileTypes.js` */
export const EVIDENCE_TYPE_EXTENSIONS = {
  "Document (PDF/Word)": [".pdf", ".doc", ".docx"],
  Image: [".png", ".jpg", ".jpeg", ".webp", ".gif"],
};

export const EVIDENCE_TYPE_LABELS = Object.keys(EVIDENCE_TYPE_EXTENSIONS);

export const DEFAULT_EVIDENCE_TYPE = "Document (PDF/Word)";

export function fileAllowedForEvidenceType(file, evidenceType) {
  if (!file || !file.name) return false;
  const name = String(file.name).toLowerCase();
  const key = EVIDENCE_TYPE_EXTENSIONS[evidenceType] ? evidenceType : DEFAULT_EVIDENCE_TYPE;
  return EVIDENCE_TYPE_EXTENSIONS[key].some((ext) => name.endsWith(ext));
}

/** HTML `accept` attribute for the hidden file input */
export function acceptAttributeForEvidenceType(evidenceType) {
  const key = EVIDENCE_TYPE_EXTENSIONS[evidenceType] ? evidenceType : DEFAULT_EVIDENCE_TYPE;
  if (key === "Document (PDF/Word)") {
    return ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (key === "Image") {
    return "image/png,image/jpeg,image/jpg,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif";
  }
  return ".pdf,.doc,.docx";
}
