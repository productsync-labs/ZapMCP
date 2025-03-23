import { readFile } from "fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { fetch } from "undici";
import { ImageContent } from "./types.js";

/**
 * Generates an image content object from a URL, file path, or buffer.
 */
export const imageContent = async (
  input: { url: string } | { path: string } | { buffer: Buffer },
): Promise<ImageContent> => {
  let rawData: Buffer;

  if ("url" in input) {
    const response = await fetch(input.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }

    rawData = Buffer.from(await response.arrayBuffer());
  } else if ("path" in input) {
    rawData = await readFile(input.path);
  } else if ("buffer" in input) {
    rawData = input.buffer;
  } else {
    throw new Error(
      "Invalid input: Provide a valid 'url', 'path', or 'buffer'",
    );
  }

  const mimeType = await fileTypeFromBuffer(rawData);

  const base64Data = rawData.toString("base64");

  return {
    type: "image",
    data: base64Data,
    mimeType: mimeType?.mime ?? "image/png",
  } as const;
};