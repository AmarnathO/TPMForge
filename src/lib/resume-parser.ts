import { extractText } from "unpdf";
import { MAX_RESUME_BYTES } from "@/lib/limits";

export type ResumeFileType = "pdf" | "docx" | "txt";

export interface ExtractedResume {
  text: string;
  fileType: ResumeFileType;
}

function detectFileType(fileName: string): ResumeFileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (ext === "txt") return "txt";
  return null;
}

export async function extractResume(file: File): Promise<ExtractedResume> {
  const fileType = detectFileType(file.name);
  if (!fileType) {
    throw new Error("Unsupported file type. Upload a PDF, DOCX, or TXT file.");
  }
  if (file.size > MAX_RESUME_BYTES) {
    throw new Error("File is too large. Maximum size is 5 MB.");
  }

  if (fileType === "txt") {
    return { text: await file.text(), fileType };
  }

  const arrayBuffer = await file.arrayBuffer();

  if (fileType === "pdf") {
    const result = await extractText(new Uint8Array(arrayBuffer));
    return { text: result.text.join("\n\n"), fileType };
  }

  // DOCX — unzip and extract raw text.
  const { extractRawText } = await import("mammoth");
  const result = await extractRawText({ buffer: Buffer.from(arrayBuffer) });
  return { text: result.value, fileType };
}
