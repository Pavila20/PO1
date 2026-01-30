import * as ExpoCrypto from "expo-crypto";

// Ensure global.crypto exists
if (typeof global.crypto === "undefined") {
  // @ts-ignore
  global.crypto = {};
}

// Ensure getRandomValues exists
if (typeof (global as any).crypto.getRandomValues !== "function") {
  (global as any).crypto.getRandomValues = (buffer: Uint8Array) => {
    const bytes = ExpoCrypto.getRandomBytes(buffer.length);
    buffer.set(bytes);
    return buffer;
  };
}
