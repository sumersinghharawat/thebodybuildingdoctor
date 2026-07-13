/** Shim so Faceplugin uses the CDN/UMD `ort` already on window. */
export const InferenceSession = globalThis.ort.InferenceSession;
export const Tensor = globalThis.ort.Tensor;
export const env = globalThis.ort.env;
export default globalThis.ort;
