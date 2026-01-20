// gallery.js - ギャラリー機能モジュール

const DB_NAME = 'JidoriGallery';
const STORE_NAME = 'photos';

/**
 * IndexedDBを開く
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE_NAME, {
        keyPath: 'id',
        autoIncrement: true
      });
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

/**
 * ギャラリーに写真を保存
 */
export async function saveToGallery(dataUrl) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).add({
    dataUrl,
    timestamp: Date.now()
  });
  tx.oncomplete = () => loadGallery();
}

/**
 * ギャラリーを読み込んで表示
 */
export async function loadGallery() {
  const db = await openDB();
  const photos = await new Promise((resolve) => {
    const req = db.transaction(STORE_NAME, 'readonly')
      .objectStore(STORE_NAME)
      .getAll();
    req.onsuccess = () => resolve(req.result);
  });

  const galleryEl = document.getElementById('gallery');
  if (!galleryEl) return;

  galleryEl.innerHTML = '';
  photos.reverse().forEach(photo => {
    const img = document.createElement('img');
    img.src = photo.dataUrl;
    img.onclick = async () => {
      if (confirm('この画像を削除しますか？')) {
        await deletePhoto(photo.id);
      }
    };
    galleryEl.appendChild(img);
  });
}

/**
 * 写真を削除
 */
async function deletePhoto(id) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).delete(id);
  tx.oncomplete = () => loadGallery();
}
