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
  menuToggle: null,
  menuContent: null,
  installBtn: null,
  toggleMeshBtn: null,
  toggleAutoShutterBtn: null,
  shutterBtn: null,
  smileEl: null,
  mouthEl: null,
  eyeSquintEl: null,
  cheekSquintEl: null,
  eyeStatusEl: null,
  thresholdSlider: null,
  thresholdVal: null
};

/**
 * アプリ設定
 */
export const appSettings = {
  showMesh: false,
  autoShutter: false,
  isCapturing: false,
  smileThreshold: 0.5,
  appMode: 'selfie'
};

/**
 * UIを初期化
 */
export function initUI() {
  elements.viewport = document.getElementById('viewport');
  elements.video = document.getElementById('webcam');
  elements.canvas = document.getElementById('output_canvas');
  elements.flashEl = document.getElementById('flash');
  elements.menuToggle = document.getElementById('menu_toggle');
  elements.menuContent = document.getElementById('menu_content');
  elements.installBtn = document.getElementById('install_app');
  elements.toggleMeshBtn = document.getElementById('toggle_mesh');
  elements.toggleAutoShutterBtn = document.getElementById('toggle_auto_shutter');
  elements.shutterBtn = document.getElementById('shutter');
  elements.smileEl = document.getElementById('smile_val');
  elements.mouthEl = document.getElementById('mouth_val');
  elements.eyeSquintEl = document.getElementById('eye_squint_val');
  elements.cheekSquintEl = document.getElementById('cheek_squint_val');
  elements.eyeStatusEl = document.getElementById('eye_status');
  elements.thresholdSlider = document.getElementById('smile_threshold');
  elements.thresholdVal = document.getElementById('threshold_val');

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
    elements.toggleMeshBtn.classList.toggle('active', appSettings.showMesh);
    elements.toggleMeshBtn.addEventListener('click', (e) => {
      appSettings.showMesh = !appSettings.showMesh;
      elements.toggleMeshBtn.classList.toggle('active', appSettings.showMesh);
    });
  }

  // 自動シャッター切り替え
  if (elements.toggleAutoShutterBtn) {
    elements.toggleAutoShutterBtn.classList.toggle('active', appSettings.autoShutter);
    elements.toggleAutoShutterBtn.addEventListener('click', (e) => {
      appSettings.autoShutter = !appSettings.autoShutter;
      elements.toggleAutoShutterBtn.classList.toggle('active', appSettings.autoShutter);
    });
  }

  // しきい値スライダー
  if (elements.thresholdSlider) {
    elements.thresholdSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      appSettings.smileThreshold = val;
      if (elements.thresholdVal) {
        elements.thresholdVal.innerText = val.toFixed(2);
      }
    });
  }

  // メニューの開閉
  if (elements.menuToggle && elements.menuContent) {
    elements.menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.menuContent.classList.toggle('show');
    });

    // メニュー以外をクリックしたら閉じる
    document.addEventListener('click', () => {
      elements.menuContent.classList.remove('show');
    });
  }

  // モード切替
  const modeSelector = document.getElementById('mode_selector');
  if (modeSelector) {
    modeSelector.addEventListener('change', (e) => {
      appSettings.appMode = e.target.value;
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
    if (smileData.isBlinking) {
      elements.eyeStatusEl.innerText = "Blinking!";
      elements.eyeStatusEl.style.color = "#FF8800";
    } else if (smileData.isGenuineSmile) {
      elements.eyeStatusEl.innerText = "genuine smile!";
      elements.eyeStatusEl.style.color = "#00FF00";
    } else if (smileData.isFakeSmile) {
      elements.eyeStatusEl.innerText = "作り笑い！";
      elements.eyeStatusEl.style.color = "#FF4444";
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
 * 顔の体操モードのデータを表示更新
 */
export function updateFaceGymDisplay(gymData) {
  if (elements.smileEl) {
    elements.smileEl.innerText = gymData.score;
  }
  if (elements.mouthEl) {
    elements.mouthEl.innerText = gymData.metrics.mouthOpen;
  }
  if (elements.eyeSquintEl) {
    elements.eyeSquintEl.innerText = gymData.metrics.eyeOpen;
  }
  if (elements.cheekSquintEl) {
    elements.cheekSquintEl.innerText = gymData.metrics.cheekLift;
  }
  if (elements.eyeStatusEl) {
    // ステータスとメッセージを表示
    elements.eyeStatusEl.innerText = `${gymData.status}: ${gymData.message}`;
    // Perfect! の時は緑、それ以外は黄色などで強調
    elements.eyeStatusEl.style.color = gymData.status === "Perfect!" ? "#00FF00" : "#FFFF00";
  }
}

/**
 * UI要素を取得
 */
export function getElements() {
  return elements;
}
