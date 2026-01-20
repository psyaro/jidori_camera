// smileAnalyzer.js - 笑顔分析モジュール（Blendshapesを使用）

// 閾値設定
const MOUTH_SMILE_THRESHOLD = 0.4;  // 口の笑顔閾値
const EYE_SQUINT_THRESHOLD = 0.3;   // 目を細める閾値
const CHEEK_SQUINT_THRESHOLD = 0.2; // 頬が上がる閾値

/**
 * Blendshapesから特定のカテゴリの値を取得
 */
function getBlendshapeValue(blendshapes, categoryName) {
  if (!blendshapes || !blendshapes.categories) return 0;
  const category = blendshapes.categories.find(c => c.categoryName === categoryName);
  return category ? category.score : 0;
}

/**
 * 口の笑顔度を計算（従来のランドマーク方式、フォールバック用）
 */
export function calculateMouthSmile(landmarks) {
  const mouthWidth = Math.hypot(
    landmarks[61].x - landmarks[291].x,
    landmarks[61].y - landmarks[291].y
  );
  const eyeDist = Math.hypot(
    landmarks[33].x - landmarks[263].x,
    landmarks[33].y - landmarks[263].y
  );
  return eyeDist > 0 ? mouthWidth / eyeDist : 0;
}

/**
 * 口の開き具合を計算
 */
export function calculateMouthOpen(landmarks) {
  return Math.hypot(landmarks[13].y - landmarks[14].y);
}

/**
 * Blendshapesを使った笑顔分析
 */
export function analyzeSmileWithBlendshapes(landmarks, blendshapes) {
  // 口の笑顔度（従来方式）
  const mouthSmileValue = calculateMouthSmile(landmarks);
  const mouthOpen = calculateMouthOpen(landmarks);

  // Blendshapesから値を取得
  const eyeSquintLeft = getBlendshapeValue(blendshapes, 'eyeSquintLeft');
  const eyeSquintRight = getBlendshapeValue(blendshapes, 'eyeSquintRight');
  const cheekSquintLeft = getBlendshapeValue(blendshapes, 'cheekSquintLeft');
  const cheekSquintRight = getBlendshapeValue(blendshapes, 'cheekSquintRight');
  const mouthSmileLeft = getBlendshapeValue(blendshapes, 'mouthSmileLeft');
  const mouthSmileRight = getBlendshapeValue(blendshapes, 'mouthSmileRight');

  // 平均値を計算
  const avgEyeSquint = (eyeSquintLeft + eyeSquintRight) / 2;
  const avgCheekSquint = (cheekSquintLeft + cheekSquintRight) / 2;
  const avgMouthSmile = (mouthSmileLeft + mouthSmileRight) / 2;

  // 口の笑顔判定（Blendshapesまたは従来方式）
  const isMouthSmiling = avgMouthSmile > MOUTH_SMILE_THRESHOLD || mouthSmileValue > 0.65;

  // 目の笑顔判定
  // - 目を細めている（eyeSquint が高い）
  // - または頬が上がっている（cheekSquint が高い）
  const isEyeSmiling = avgEyeSquint > EYE_SQUINT_THRESHOLD || avgCheekSquint > CHEEK_SQUINT_THRESHOLD;

  // 総合判定: 口と目の両方が笑っている
  const isGenuineSmile = isMouthSmiling && isEyeSmiling;

  return {
    // 従来の値
    mouthSmileValue,
    mouthOpen,
    // Blendshapes値
    eyeSquintLeft,
    eyeSquintRight,
    avgEyeSquint,
    cheekSquintLeft,
    cheekSquintRight,
    avgCheekSquint,
    mouthSmileLeft,
    mouthSmileRight,
    avgMouthSmile,
    // 判定結果
    isMouthSmiling,
    isEyeSmiling,
    isGenuineSmile
  };
}

/**
 * 閾値を取得
 */
export function getThresholds() {
  return {
    mouthSmileThreshold: MOUTH_SMILE_THRESHOLD,
    eyeSquintThreshold: EYE_SQUINT_THRESHOLD,
    cheekSquintThreshold: CHEEK_SQUINT_THRESHOLD
  };
}
