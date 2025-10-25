
import type { Part } from '@google/genai';

function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function fileToGenerativePart(dataUrl: string, mimeType: string): Promise<Part> {
  const base64Data = dataUrl.split(',')[1];
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}
