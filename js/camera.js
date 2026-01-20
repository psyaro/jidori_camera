// camera.js - カメラ制御モジュール

let currentFacingMode = 'user';
let currentStream = null;
let videoEl = null;
let canvasEl = null;
let onReadyCallback = null;

export async function startCamera(video, canvas, viewport, onReady) {
  videoEl = video;
  canvasEl = canvas;
  onReadyCallback = onReady;

  await initCamera(currentFacingMode);
}

async function initCamera(facingMode) {
  // 既存のストリームを停止
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: facingMode
    }
  };

  try {
    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.srcObject = currentStream;
    videoEl.onloadedmetadata = () => {
      canvasEl.width = videoEl.videoWidth;
      canvasEl.height = videoEl.videoHeight;
      if (onReadyCallback) onReadyCallback();
    };
  } catch (err) {
    alert("カメラの起動に失敗しました: " + err);
  }
}

export async function switchCamera() {
  currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
  await initCamera(currentFacingMode);
  return currentFacingMode;
}

export function getCurrentFacingMode() {
  return currentFacingMode;
}
