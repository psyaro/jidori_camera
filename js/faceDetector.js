// faceDetector.js - MediaPipe初期化と顔検出モジュール

import { FaceLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

let faceLandmarker = null;

export async function initFaceDetector() {
  const filesetResolver = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
    },
    runningMode: "VIDEO",
    numFaces: 1,
    outputFaceBlendshapes: true  // Blendshapes有効化
  });
  return faceLandmarker;
}

export function detectFaces(video) {
  if (!faceLandmarker) return null;
  return faceLandmarker.detectForVideo(video, performance.now());
}

export function getFaceLandmarker() {
  return faceLandmarker;
}
