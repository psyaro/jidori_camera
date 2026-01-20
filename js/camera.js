// camera.js - カメラ制御モジュール

export async function startCamera(video, canvas, viewport, onReady) {
  const constraints = {
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user' // フロントカメラを優先
    }
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      // canvasのサイズはビデオの実際のサイズに合わせる（検出精度のため）
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      // viewportのサイズはCSSで制御（レスポンシブ）
      if (onReady) onReady();
    };
  } catch (err) {
    alert("カメラの起動に失敗しました: " + err);
  }
}
