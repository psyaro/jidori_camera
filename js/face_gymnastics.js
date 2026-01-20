export function analyzeSmile(landmarks) {
  // --- 1. 座標の抽出 (MediaPipe Landmark Indices) ---
  const topLip = landmarks[0];         // 上唇上部
  const bottomLip = landmarks[17];      // 下唇下部
  const leftCorner = landmarks[61];     // 左口角
  const rightCorner = landmarks[291];   // 右口角
  const innerTopLip = landmarks[13];    // 上唇内側
  const innerBottomLip = landmarks[14]; // 下唇内側

  // 目元のポイント
  const leftEyeTop = landmarks[159];    // 左上まぶた
  const leftEyeBottom = landmarks[145]; // 左下まぶた
  const rightEyeTop = landmarks[386];   // 右上まぶた
  const rightEyeBottom = landmarks[374]; // 右下まぶた
  const leftCheek = landmarks[230];     // 左頬（下まぶた直下）
  const rightCheek = landmarks[450];    // 右頬（下まぶた直下）

  // 正規化のための基準単位（鼻の長さ：168番から2番まで）
  const noseTop = landmarks[168];
  const noseBottom = landmarks[2];
  const unit = Math.sqrt(
    Math.pow(noseTop.x - noseBottom.x, 2) + 
    Math.pow(noseTop.y - noseBottom.y, 2)
  );

  // --- 2. 指標の計算 (全てunitで割って正規化) ---

  // ① 口の開き具合（歯が見えていないか）
  const mouthOpenDist = Math.abs(innerTopLip.y - innerBottomLip.y) / unit;

  // ② 口角の引き上がり（中点からの高さ）
  const mouthCenterY = (topLip.y + bottomLip.y) / 2;
  const avgCornerY = (leftCorner.y + rightCorner.y) / 2;
  const smileLift = (mouthCenterY - avgCornerY) / unit;

  // ③ 目元の細まり
  const leftEyeOpen = Math.abs(leftEyeTop.y - leftEyeBottom.y) / unit;
  const rightEyeOpen = Math.abs(rightEyeTop.y - rightEyeBottom.y) / unit;
  const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;

  // ④ 頬の押し上げ（下まぶたと頬の距離が縮まっているか）
  const leftCheekLift = Math.abs(leftEyeBottom.y - leftCheek.y) / unit;
  const rightCheekLift = Math.abs(rightEyeBottom.y - rightCheek.y) / unit;
  const avgCheekLift = (leftCheekLift + rightCheekLift) / 2;

  // --- 3. 判定閾値とフラグ ---
  const THRESHOLD_LIFT = 0.15;      // 口角の上がり
  const THRESHOLD_CLOSED = 0.04;    // 口の閉じ（歯が見えない）
  const THRESHOLD_EYE_SMILE = 0.20; // 目の細まり
  const THRESHOLD_CHEEK_UP = 0.15;  // 頬の盛り上がり

  const isSmiling = smileLift > THRESHOLD_LIFT;
  const isMouthClosed = mouthOpenDist < THRESHOLD_CLOSED;
  // 目が細められており、かつ頬が上がっている場合に「目が笑っている」と判定
  const isEyeSmiling = (avgEyeOpen < THRESHOLD_EYE_SMILE) && (avgCheekLift < THRESHOLD_CHEEK_UP);

  // --- 4. スコア計算 (100点満点) ---
  let score = 0;
  if (isSmiling) {
    // 基本の口角スコア (最大60点)
    score += Math.min(60, (smileLift / 0.4) * 60);

    // 目元のボーナス (最大40点)
    if (isEyeSmiling) {
      score += 40;
    } else if (avgEyeOpen < THRESHOLD_EYE_SMILE || avgCheekLift < THRESHOLD_CHEEK_UP) {
      score += 20; // 片方の指標のみ達成
    }
    
    // 口が開いている（歯が見えている）場合は減点
    if (!isMouthClosed) {
      score *= 0.5;
    }
  }

  // --- 5. ステータス判定と返却 ---
  let status = "Neutral";
  let message = "口角を斜め上に上げましょう";

  if (isSmiling) {
    if (isMouthClosed) {
      if (isEyeSmiling) {
        status = "Perfect!";
        message = "完璧です！歯を見せない上品な笑顔です";
      } else {
        status = "Eye Training";
        message = "口角は良いです。下まぶたを上げる意識を！";
      }
    } else {
      status = "Close Mouth";
      message = "笑ったまま、唇を閉じて歯を隠しましょう";
    }
  }

  return {
    score: Math.round(score),
    status: status,
    message: message,
    metrics: { // デバッグ用に数値を返す
      smileLift: smileLift.toFixed(3),
      mouthOpen: mouthOpenDist.toFixed(3),
      eyeOpen: avgEyeOpen.toFixed(3),
      cheekLift: avgCheekLift.toFixed(3)
    }
  };
}