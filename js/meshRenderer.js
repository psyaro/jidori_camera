// meshRenderer.js - 顔メッシュ描画モジュール

import { FaceLandmarker, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

/**
 * 顔メッシュを描画
 */
export function drawFaceMesh(ctx, landmarks) {
  const drawingUtils = new DrawingUtils(ctx);

  // 鼻筋と小鼻のコネクタ定義
  const noseConnectors = [
    { start: 168, end: 6 },
    { start: 6, end: 197 },
    { start: 197, end: 195 },
    { start: 195, end: 5 },
    { start: 5, end: 4 }, // 鼻筋
    { start: 102, end: 64 },
    { start: 64, end: 59 },
    { start: 59, end: 60 },
    { start: 60, end: 20 }, // 右小鼻
    { start: 331, end: 294 },
    { start: 294, end: 289 },
    { start: 289, end: 290 },
    { start: 290, end: 250 } // 左小鼻
  ];

  drawingUtils.drawConnectors(landmarks, noseConnectors, {
    color: "#E0E0E0",
    lineWidth: 1
  });

  // 鼻の頭にドットを表示
  drawingUtils.drawLandmarks([landmarks[4]], {
    color: "#FFFFFF",
    radius: 3
  });

  // 各パーツの描画
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
    color: "#FF3030"
  });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
    color: "#FF3030"
  });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
    color: "#30FF30"
  });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
    color: "#30FF30"
  });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
    color: "#E0E0E0",
    lineWidth: 2
  });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
    color: "#E0E0E0",
    lineWidth: 2
  });

  // 口角を強調（笑顔の認識用）
  drawingUtils.drawLandmarks([landmarks[61], landmarks[291]], {
    color: "#FF3030",
    radius: 3
  });
}

/**
 * 目のランドマークをハイライト（EAR検出用）
 */
export function highlightEyeLandmarks(ctx, landmarks) {
  const drawingUtils = new DrawingUtils(ctx);

  // 右目のEAR用ランドマーク
  const rightEyePoints = [33, 133, 159, 158, 145, 144].map(i => landmarks[i]);

  // 左目のEAR用ランドマーク
  const leftEyePoints = [263, 362, 386, 385, 374, 373].map(i => landmarks[i]);

  drawingUtils.drawLandmarks(rightEyePoints, {
    color: "#FFFF00",
    radius: 2
  });

  drawingUtils.drawLandmarks(leftEyePoints, {
    color: "#FFFF00",
    radius: 2
  });
}
