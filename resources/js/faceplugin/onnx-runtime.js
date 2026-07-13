import { env } from 'onnxruntime-web';

const wasmBase = `${window.location.origin}/onnxruntime/`;

env.wasm.wasmPaths = wasmBase;
env.wasm.numThreads = 1;
env.wasm.proxy = false;
env.logLevel = 'warning';

export { env };
