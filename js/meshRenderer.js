// meshRenderer.js - 顔メッシュ描画モジュール

import { FaceLandmarker, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

/**
 * 顔メッシュを描画
 */
export function drawFaceMesh(ctx, landmarks, appMode = 'selfie') {
  const drawingUtils = new DrawingUtils(ctx);

  // 各パーツの描画（口元以外）
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, { color: "#FF3030" });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, { color: "#FF3030" });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, { color: "#30FF30" });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, { color: "#30FF30" });
  drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, { color: "#E0E0E0", lineWidth: 2 });
  
  // 鼻の描画
  drawingUtils.drawLandmarks([landmarks[4]], { color: "#FFFFFF", radius: 2 });


  // 口元の描画（モードによって変える）
  if (appMode === 'face_gym') {
    // 体操モードでは、現在の口の形と理想の形の両方を描画
    // 1. 現在の口の形を薄く描画
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: "rgba(255, 255, 255, 0.4)",
        lineWidth: 1
    });
    // 2. 理想の笑顔ガイドを描画
    drawSmileGuide(ctx, landmarks);
  } else {
    // 自撮りモードでは、通常の口の形を描画
    drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: "#E0E0E0",
        lineWidth: 2
    });
  }

  // 口角を強調表示
  drawingUtils.drawLandmarks([landmarks[61], landmarks[291]], {
    color: "rgba(255, 50, 50, 0.8)",
    radius: 3
  });
}


/**
 * 笑顔のガイドライン（理想の唇の形）を描画
 */
function drawSmileGuide(ctx, landmarks) {
    const canvas = ctx.canvas;

    // --- 基準となるランドマークを取得 ---
    const leftCorner = landmarks[61];
    const rightCorner = landmarks[291];
    const upperLipTop = landmarks[0];
    const lowerLipBottom = landmarks[17];

    // --- 描画設定 ---
    ctx.strokeStyle = "rgba(0, 255, 255, 0.9)"; // 明るいシアン色
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // 影
    ctx.shadowColor = "rgba(0, 255, 255, 0.7)";
    ctx.shadowBlur = 5;


    // --- 理想の口角位置を計算 ---
    // 基準単位（鼻の底辺から上唇上部までの距離を参考に）
    const unit = Math.abs(landmarks[2].y - landmarks[0].y);
    const smileLift = unit * 0.8; // 口角を上げる高さ
    const smileWidth = unit * 0.2; // 口角を横に広げる幅

    const idealLeftCorner = {
        x: (leftCorner.x + smileWidth) * canvas.width,
        y: (leftCorner.y - smileLift) * canvas.height
    };
    const idealRightCorner = {
        x: (rightCorner.x - smileWidth) * canvas.width,
        y: (rightCorner.y - smileLift) * canvas.height
    };
    
    // --- 理想の上唇ラインを描画 (ベジェ曲線) ---
    // 制御点: 現在の上唇のカーブを維持しつつ、全体的に上に持ち上げる
    const topControlX1 = landmarks[40].x * canvas.width;
    const topControlY1 = (landmarks[40].y - smileLift) * canvas.height;
    const topControlX2 = landmarks[270].x * canvas.width;
    const topControlY2 = (landmarks[270].y - smileLift) * canvas.height;
    const topAnchorX = upperLipTop.x * canvas.width;
    const topAnchorY = (upperLipTop.y - smileLift) * canvas.height;

    ctx.beginPath();
    ctx.moveTo(idealRightCorner.x, idealRightCorner.y);
    ctx.quadraticCurveTo(topControlX1, topControlY1, topAnchorX, topAnchorY);
    ctx.quadraticCurveTo(topControlX2, topControlY2, idealLeftCorner.x, idealLeftCorner.y);
    ctx.stroke();

    // --- 理想の下唇ラインを描画 (ベジェ曲線) ---
    // 口を閉じさせるため、下唇は少しだけ上げる
    const mouthCloseLift = unit * 0.1;
    const bottomControlX1 = landmarks[181].x * canvas.width;
    const bottomControlY1 = (landmarks[181].y - mouthCloseLift) * canvas.height;
    const bottomControlX2 = landmarks[405].x * canvas.width;
    const bottomControlY2 = (landmarks[405].y - mouthCloseLift) * canvas.height;
    const bottomAnchorX = lowerLipBottom.x * canvas.width;
    const bottomAnchorY = (lowerLipBottom.y - mouthCloseLift) * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(idealRightCorner.x, idealRightCorner.y);
    ctx.quadraticCurveTo(bottomControlX1, bottomControlY1, bottomAnchorX, bottomAnchorY);
    ctx.quadraticCurveTo(bottomControlX2, bottomControlY2, idealLeftCorner.x, idealLeftCorner.y);
    ctx.stroke();

    // 描画設定をリセット
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
}


/**
 * 目のランドマークをハイライト（EAR検出用）
 */
export function highlightEyeLandmarks(ctx, landmarks) {
  const drawingUtils = new DrawingUtils(ctx);
  // (中身は変更なし)
  const rightEyePoints = [33, 133, 159, 158, 145, 144].map(i => landmarks[i]);
  const leftEyePoints = [263, 362, 386, 385, 374, 373].map(i => landmarks[i]);
  drawingUtils.drawLandmarks(rightEyePoints, { color: "#FFFF00", radius: 2 });
  drawingUtils.drawLandmarks(leftEyePoints, { color: "#FFFF00", radius: 2 });
}
