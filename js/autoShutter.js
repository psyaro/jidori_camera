// autoShutter.js - 自動シャッター機能モジュール

const PHOTO_COOLDOWN = 3000; // 撮影後のクールダウン（3秒）

let lastPhotoTime = 0;
let isCountingDown = false;
let countdownTimer = null;
let countdownEl = null;

/**
 * 自動シャッターを初期化
 */
export function initAutoShutter(countdownElement) {
  countdownEl = countdownElement;
}

/**
 * カウントダウン中かどうか
 */
export function isInCountdown() {
  return isCountingDown;
}

/**
 * 自動シャッターの処理
 * @param {boolean} shouldTrigger - シャッターを切る条件を満たしているか
 * @param {Function} takePhoto - 写真を撮る関数
 * @returns {boolean} カウントダウンが開始されたかどうか
 */
export function processAutoShutter(shouldTrigger, takePhoto) {
  if (shouldTrigger) {
    if (!isCountingDown) {
      const now = Date.now();
      if (now - lastPhotoTime > PHOTO_COOLDOWN) {
        startCountdown(takePhoto);
        return true;
      }
    }
  } else if (isCountingDown) {
    // 条件を満たさなくなったらカウントダウンをキャンセル
    cancelCountdown();
  }
  return false;
}

/**
 * カウントダウンを開始
 */
function startCountdown(takePhoto) {
  isCountingDown = true;
  let count = 3;

  if (countdownEl) {
    countdownEl.innerText = count;
  }

  countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      if (countdownEl) {
        countdownEl.innerText = count;
      }
    } else {
      clearInterval(countdownTimer);
      countdownTimer = null;
      if (countdownEl) {
        countdownEl.innerText = "";
      }
      if (takePhoto) takePhoto();
      lastPhotoTime = Date.now();
      isCountingDown = false;
    }
  }, 1000);
}

/**
 * カウントダウンをキャンセル
 */
export function cancelCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  isCountingDown = false;
  if (countdownEl) {
    countdownEl.innerText = "";
  }
}

/**
 * クールダウン状態をリセット
 */
export function resetCooldown() {
  lastPhotoTime = 0;
}
