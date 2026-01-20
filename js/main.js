// main.js - エントリーポイント、各モジュールの連携

import { startCamera } from './camera.js';
import { initFaceDetector, detectFaces } from './faceDetector.js';
import { analyzeSmileWithBlendshapes } from './smileAnalyzer.js';
import { analyzeSmile as analyzeSmileForGym } from './face_gymnastics.js';
import { initAutoShutter, processAutoShutter, cancelCountdown } from './autoShutter.js';
import { drawFaceMesh } from './meshRenderer.js';
import { initUI, appSettings, setShutterHandler, takePhoto, updateSmileDisplay, updateFaceGymDisplay, getElements } from './ui.js';
import { saveToGallery, loadGallery } from './gallery.js';

// DOM要素
const video = document.getElementById("webcam");
const canvas = document.getElementById("output_canvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("viewport");
const countdownEl = document.getElementById("countdown");

// Service Worker の登録と更新通知
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('./sw.js');
    
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新しいSWがインストールされたが、まだ待機中の場合
          if (confirm('新しいバージョンが利用可能です。更新して再読み込みしますか？')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      });
    });
  });

  // 新しいSWが制御を開始したらリロード
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

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

      if (appSettings.appMode === 'selfie') {
        const blendshapes = results.faceBlendshapes ? results.faceBlendshapes[i] : null;

        // Blendshapesを使った笑顔分析
        const smileData = analyzeSmileWithBlendshapes(landmarks, blendshapes, appSettings.smileThreshold);

        // UI表示更新
        updateSmileDisplay(smileData);

        // 自動シャッター処理
        if (appSettings.autoShutter) {
          // 総合判定: 自然な笑顔であり、かつ作り笑い（Fake Smile）ではない場合のみシャッターを許可
          const canTrigger = smileData.isGenuineSmile && !smileData.isFakeSmile;
          processAutoShutter(canTrigger, window.takePhoto);
        }
      } else if (appSettings.appMode === 'face_gym') {
        // 顔の体操モードの処理
        const gymData = analyzeSmileForGym(landmarks);
        updateFaceGymDisplay(gymData);
      }
      
      // 撮影中でない場合のみ、メッシュを描画
      if (!appSettings.isCapturing && appSettings.showMesh) {
        drawFaceMesh(ctx, landmarks, appSettings.appMode);
      }
    }
  }

  requestAnimationFrame(predictWebcam);
}

// アプリケーション開始
init();