#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG="${ROOT_DIR}/node_modules/faceplugin-face-recognition-js"
ORT="${ROOT_DIR}/node_modules/onnxruntime-web/dist"
DEST="${ROOT_DIR}/public/faceplugin"
ORT_DEST="${ROOT_DIR}/storage/app/onnxruntime"

if [[ ! -d "${PKG}" ]]; then
  echo "faceplugin-face-recognition-js is not installed. Run: npm install"
  exit 1
fi

mkdir -p "${DEST}/model" "${DEST}/js" "${ORT_DEST}"

for model in fr_detect.onnx fr_landmark.onnx fr_liveness.onnx fr_feature.onnx; do
  cp "${PKG}/model/${model}" "${DEST}/model/"
done

cp "${PKG}/js/opencv.js" "${PKG}/js/opencv_js.wasm" "${DEST}/js/"

# onnxruntime-web@1.14 WASM assets
cp "${ORT}/ort-wasm.wasm" \
   "${ORT}/ort-wasm-simd.wasm" \
   "${ORT}/ort-wasm-simd-threaded.wasm" \
   "${ORT}/ort-wasm-threaded.wasm" \
   "${ORT}/ort-wasm-threaded.js" \
   "${ORT}/ort-wasm-threaded.worker.js" \
   "${ORT_DEST}/"

echo "Faceplugin assets copied to public/faceplugin"
echo "ONNX Runtime WASM copied to storage/app/onnxruntime"
