// main.js - エントリーポイント、各モジュールの連携

import { startCamera } from './camera.js';
import { initFaceDetector, detectFaces } from './faceDetector.js';
import { analyzeSmileWithBlendshapes } from './smileAnalyzer.js';
import { initAutoShutter, processAutoShutter, cancelCountdown } from './autoShutter.js';
import { drawFaceMesh } from './meshRenderer.js';
import { initUI, appSettings, setShutterHandler, takePhoto, updateSmileDisplay, getElements } from './ui.js';
import { saveToGallery, loadGallery } from './gallery.js';

// DOM要素
const video = document.getElementById("webcam");
const canvas = document.getElementById("output_canvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("viewport");
const countdownEl = document.getElementById("countdown");

/**
 * アプリケーション初期化
 */
async function init() {
  // UI初期化
  initUI();

  // 自動シャッター初期化
  initAutoShutter(countdownEl);

  // 写真撮影関数を設定
  const doTakePhoto = () => {
    takePhoto(video, canvas, saveToGallery);
  };

  // シャッターボタンのハンドラを設定
  setShutterHandler(doTakePhoto);

  // グローバルに写真撮影関数を公開（自動シャッター用）
  window.takePhoto = doTakePhoto;

  // MediaPipe初期化
  await initFaceDetector();

  // カメラ起動
  startCamera(video, canvas, viewport, () => {
    // カメラ準備完了後、メインループ開始
    predictWebcam();
  });

  // ギャラリー読み込み
  loadGallery();
}

/**
 * メインループ - 顔検出と描画
 */
function predictWebcam() {
  const results = detectFaces(video);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (results && results.faceLandmarks) {
    for (let i = 0; i < results.faceLandmarks.length; i++) {
      const landmarks = results.faceLandmarks[i];
      const blendshapes = results.faceBlendshapes ? results.faceBlendshapes[i] : null;

      // Blendshapesを使った笑顔分析
      const smileData = analyzeSmileWithBlendshapes(landmarks, blendshapes);

      // UI表示更新
      updateSmileDisplay(smileData);

      // 自動シャッター処理
      if (appSettings.autoShutter) {
        // 総合判定: 口と目の両方が笑っている場合のみシャッター
        processAutoShutter(smileData.isGenuineSmile, window.takePhoto);
      }

      // 撮影中でない場合のみ、エフェクトやメッシュを描画
      if (!appSettings.isCapturing) {
        if (appSettings.showMesh) {
          drawFaceMesh(ctx, landmarks);
        }
      }
    }
  }

  requestAnimationFrame(predictWebcam);
}

// アプリケーション開始
init();
