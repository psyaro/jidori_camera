// ui.js - UI操作モジュール

const minZoom = 1;
const maxZoom = 5;
const zoomStep = 0.1;
let zoomLevel = 1;
let deferredPrompt = null;

/**
 * UI要素への参照
 */
let elements = {
  viewport: null,
  video: null,
  canvas: null,
  flashEl: null,
  installBtn: null,
  toggleMeshBtn: null,
  toggleAutoShutterBtn: null,
  shutterBtn: null,
  smileEl: null,
  mouthEl: null,
  eyeSquintEl: null,
  cheekSquintEl: null,
  eyeStatusEl: null
};

/**
 * アプリ設定
 */
export const appSettings = {
  showMesh: false,
  autoShutter: false,
  isCapturing: false
};

/**
 * UIを初期化
 */
export function initUI() {
  elements.viewport = document.getElementById('viewport');
  elements.video = document.getElementById('webcam');
  elements.canvas = document.getElementById('output_canvas');
  elements.flashEl = document.getElementById('flash');
  elements.installBtn = document.getElementById('install_app');
  elements.toggleMeshBtn = document.getElementById('toggle_mesh');
  elements.toggleAutoShutterBtn = document.getElementById('toggle_auto_shutter');
  elements.shutterBtn = document.getElementById('shutter');
  elements.smileEl = document.getElementById('smile_val');
  elements.mouthEl = document.getElementById('mouth_val');
  elements.eyeSquintEl = document.getElementById('eye_squint_val');
  elements.cheekSquintEl = document.getElementById('cheek_squint_val');
  elements.eyeStatusEl = document.getElementById('eye_status');

  setupEventListeners();
  setupPWA();
  updateTransform(zoomLevel);
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
  // ズーム（ホイール）
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      zoomLevel = Math.min(zoomLevel + zoomStep, maxZoom);
    } else {
      zoomLevel = Math.max(zoomLevel - zoomStep, minZoom);
    }
    updateTransform(zoomLevel);
  }, { passive: false });

  // メッシュ表示切り替え
  if (elements.toggleMeshBtn) {
    elements.toggleMeshBtn.addEventListener('click', (e) => {
      appSettings.showMesh = !appSettings.showMesh;
      e.target.innerText = `メッシュ: ${appSettings.showMesh ? "ON" : "OFF"}`;
    });
  }

  // 自動シャッター切り替え
  if (elements.toggleAutoShutterBtn) {
    elements.toggleAutoShutterBtn.addEventListener('click', (e) => {
      appSettings.autoShutter = !appSettings.autoShutter;
      e.target.innerText = `自動シャッター: ${appSettings.autoShutter ? "ON" : "OFF"}`;
    });
  }
}

/**
 * PWAインストール機能を設定
 */
function setupPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (elements.installBtn) {
      elements.installBtn.style.display = 'block';
    }
  });

  if (elements.installBtn) {
    elements.installBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        deferredPrompt = null;
        elements.installBtn.style.display = 'none';
      }
    });
  }

  // サービスワーカーの登録
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(() => console.log('Service Worker Registered'));
  }
}

/**
 * ズームと回転を適用
 */
function updateTransform(zoom) {
  if (elements.viewport) {
    elements.viewport.style.transform = `scale(${zoom})`;
  }
}

/**
 * シャッターボタンのクリックハンドラを設定
 */
export function setShutterHandler(handler) {
  if (elements.shutterBtn) {
    elements.shutterBtn.addEventListener('click', handler);
  }
}

/**
 * 写真を撮る
 */
export function takePhoto(video, canvas, saveCallback) {
  console.log("Cheese!");

  // 撮影フラグを立てて画面上の描画を一時停止
  appSettings.isCapturing = true;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  // フラッシュ効果
  if (elements.flashEl) {
    elements.flashEl.style.opacity = "1";
    setTimeout(() => {
      elements.flashEl.style.opacity = "0";
      appSettings.isCapturing = false;
    }, 500);
  }

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tCtx = tempCanvas.getContext("2d");

  // 自撮り反転を考慮して保存
  tCtx.translate(tempCanvas.width, 0);
  tCtx.scale(-1, 1);
  tCtx.drawImage(video, 0, 0);
  tCtx.setTransform(1, 0, 0, 1, 0, 0);

  const dataUrl = tempCanvas.toDataURL();
  if (saveCallback) saveCallback(dataUrl);

  const link = document.createElement("a");
  link.download = `selfie-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * 笑顔データを表示更新
 */
export function updateSmileDisplay(smileData) {
  if (elements.smileEl) {
    elements.smileEl.innerText = smileData.avgMouthSmile.toFixed(2);
  }
  if (elements.mouthEl) {
    elements.mouthEl.innerText = smileData.mouthSmileValue.toFixed(2);
  }
  if (elements.eyeSquintEl) {
    elements.eyeSquintEl.innerText = smileData.avgEyeSquint.toFixed(2);
  }
  if (elements.cheekSquintEl) {
    elements.cheekSquintEl.innerText = smileData.avgCheekSquint.toFixed(2);
  }
  if (elements.eyeStatusEl) {
    // 目の笑顔状態を表示
    if (smileData.isGenuineSmile) {
      elements.eyeStatusEl.innerText = "genuine smile!";
      elements.eyeStatusEl.style.color = "#00FF00";
    } else if (smileData.isEyeSmiling) {
      elements.eyeStatusEl.innerText = "eyes OK";
      elements.eyeStatusEl.style.color = "#FFFF00";
    } else {
      elements.eyeStatusEl.innerText = "";
      elements.eyeStatusEl.style.color = "#FFFFFF";
    }
  }
}

/**
 * UI要素を取得
 */
export function getElements() {
  return elements;
}
