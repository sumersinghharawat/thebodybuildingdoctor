#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODEL_DIR="${ROOT_DIR}/public/models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "${MODEL_DIR}"

FILES=(
  "tiny_face_detector_model-weights_manifest.json"
  "tiny_face_detector_model-shard1"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
)

echo "Downloading face-api.js model weights to ${MODEL_DIR}"

for file in "${FILES[@]}"; do
  target="${MODEL_DIR}/${file}"
  if [[ -f "${target}" ]]; then
    echo "  ✓ ${file} (exists)"
    continue
  fi

  echo "  ↓ ${file}"
  curl -fsSL "${BASE_URL}/${file}" -o "${target}"
done

echo "Done. Models are ready at /models"
