import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractResume } from "@/lib/resume-parser";

const fixturesDir = path.join(process.cwd(), "packages/core/test/fixtures");

function fixtureFile(name: string): File {
  const buf = readFileSync(path.join(fixturesDir, name));
  return new File([buf], name);
}

describe("resume parser", () => {
  it("extracts text from a PDF", async () => {
    const result = await extractResume(fixtureFile("resume.pdf"));
    expect(result.fileType).toBe("pdf");
    expect(result.text.toLowerCase()).toContain("technical program manager");
  }, 30_000);

  it("extracts text from a DOCX", async () => {
    const result = await extractResume(fixtureFile("resume.docx"));
    expect(result.fileType).toBe("docx");
    expect(result.text.toLowerCase()).toContain("program manager");
  }, 30_000);

  it("extracts text from a TXT file", async () => {
    const result = await extractResume(
      new File(["Hello TPM resume"], "resume.txt")
    );
    expect(result.fileType).toBe("txt");
    expect(result.text).toContain("Hello TPM resume");
  });

  it("rejects unsupported file types", async () => {
    await expect(
      extractResume(new File(["data"], "resume.exe"))
    ).rejects.toThrow("Unsupported file type");
  });

  it("rejects oversized files", async () => {
    const big = new File([new Uint8Array(6 * 1024 * 1024)], "resume.pdf");
    await expect(extractResume(big)).rejects.toThrow("too large");
  });
});
