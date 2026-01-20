/**
 * Blendshapesを使用して笑顔の質を分析する
 * 自然な笑顔（デュシェンヌ・スマイル）の判定を重視
 */
export function analyzeSmileWithBlendshapes(landmarks, blendshapes, threshold = 0.5) {
  if (!blendshapes || !blendshapes.categories) {
    return { score: 0, isGenuineSmile: false };
  }

  const scores = {};
  blendshapes.categories.forEach(c => {
    scores[c.categoryName] = c.score;
  });

  // 1. 口角の上がり具合 (Mouth Smile)
  const mouthSmile = (scores.mouthSmileLeft + scores.mouthSmileRight) / 2;
  
  // 2. 目元の細め具合 (Eye Squint) - 自然な笑顔に不可欠な要素
  const eyeSquint = (scores.eyeSquintLeft + scores.eyeSquintRight) / 2;
  
  // 3. 頬の盛り上がり (Cheek Squint)
  const cheekSquint = (scores.cheekSquintLeft + scores.cheekSquintRight) / 2;

  // 4. 不自然な力みの抑制 (Mouth Press / Pucker)
  // 唇を強く閉じすぎている場合は、自然な笑顔から除外する
  const mouthPress = (scores.mouthPressLeft + scores.mouthPressRight) / 2;

  // 5. 瞬きの判定 (Eye Blink)
  const eyeBlink = (scores.eyeBlinkLeft + scores.eyeBlinkRight) / 2;
  const isBlinking = eyeBlink > 0.4;

  // 総合スコアの計算 (重み付け)
  // 目元の動きをより重視（50%）し、口元の影響を相対的に下げる
  const totalScore = (mouthSmile * 0.3) + (eyeSquint * 0.5) + (cheekSquint * 0.2);

  // 自然な笑顔の判定条件:
  // - 口角が一定以上上がっている
  // - かつ、目元がかなりしっかり笑っている (しきい値の70%以上)
  // - かつ、唇を強く噛み締めていない (< 0.3)
  // - かつ、瞬きをしていない
  const isGenuineSmile = mouthSmile > threshold && eyeSquint > (threshold * 0.7) && mouthPress < 0.3 && !isBlinking;
  
  return {
    score: totalScore,
    avgMouthSmile: totalScore,
    mouthSmileValue: mouthSmile,
    avgEyeSquint: eyeSquint,
    avgCheekSquint: cheekSquint,
    isGenuineSmile,
    isBlinking,
    isEyeSmiling: eyeSquint > (threshold * 0.6),
    isFakeSmile: mouthSmile > threshold && eyeSquint < (threshold * 0.5)
  };
}