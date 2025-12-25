// ------- ELEMENTS & CONFIG -------
const imgInput        = document.getElementById('imgInput');
const btnImgRemoveBg  = document.getElementById('btnImgRemoveBg');
const btnDownloadImg  = document.getElementById('btnDownloadImg');
const btnImgClear     = document.getElementById('btnImgClear');
const resultImage     = document.getElementById('resultImage');
const placeholderText = document.getElementById('placeholderText');
const loader          = document.getElementById('loader');
const statusText      = document.getElementById('imgStatusText'); // optional <span>

const API_URL  = 'https://magic-backend-354o.onrender.com/remove-bg';
const MAX_SIZE_MB = 8;           // limit file size (optional)
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

// ------- SMALL HELPERS -------
const showStatus = (msg, type = 'info') => {
  if (!statusText) return;
  statusText.textContent = msg;
  statusText.style.color =
    type === 'error' ? '#ef4444' :
    type === 'success' ? '#22c55e' :
    '#9ca3af';
};

const setProcessingState = (isProcessing) => {
  btnImgRemoveBg.disabled = isProcessing;
  btnImgClear.disabled    = isProcessing;
  btnDownloadImg.disabled = isProcessing;
  loader.style.display    = isProcessing ? 'inline-block' : 'none';
  btnImgRemoveBg.textContent = isProcessing ? 'Processing…' : '✨ Remove Background';
};

const resetPreview = () => {
  resultImage.src = '';
  resultImage.style.display = 'none';
  placeholderText.style.display = 'block';
  btnDownloadImg.style.display = 'none';
  btnDownloadImg.disabled = true;
  showStatus('कोई फोटो select नहीं है.');
};

// ------- 1. IMAGE SELECT → LIVE PREVIEW -------
imgInput.addEventListener('change', () => {
  const [file] = imgInput.files || [];
  if (!file) {
    resetPreview();
    return;
  }

  // Type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    alert('केवल PNG या JPG images upload करें.');
    imgInput.value = '';
    resetPreview();
    return;
  }

  // Size check
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_SIZE_MB) {
    alert(`फाइल बहुत बड़ी है (${sizeMB.toFixed(1)} MB). अधिकतम ${MAX_SIZE_MB} MB की image use करें.`);
    imgInput.value = '';
    resetPreview();
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    resultImage.src = e.target.result;
    resultImage.style.display = 'block';
    placeholderText.style.display = 'none';
    btnDownloadImg.style.display = 'none';
    btnDownloadImg.disabled = true;
    showStatus('Preview ready. अब "Remove Background" दबाएँ.', 'info');
  };
  reader.onerror = () => {
    console.error('FileReader error:', reader.error);
    alert('फोटो पढ़ने में दिक्कत आयी, कोई और फोटो try करें.');
    resetPreview();
  };
  reader.readAsDataURL(file);
});

// ------- 2. BACKGROUND REMOVE (API CALL) -------
btnImgRemoveBg.addEventListener('click', async () => {
  const [file] = imgInput.files || [];
  if (!file) {
    alert('कृपया पहले एक फोटो चुनें!');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  setProcessingState(true);
  showStatus('Server से संपर्क कर रहे हैं…', 'info');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      // NOTE: FormData के साथ Content-Type खुद set होता है; यहाँ header मत लगाना. [web:69]
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('API error:', response.status, text);
      throw new Error(`Server error (${response.status}). थोड़ी देर बाद फिर कोशिश करें.`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      // अगर server JSON भेज रहा हो (error message)
      const text = await response.text().catch(() => 'Unknown error');
      console.error('Unexpected response:', text);
      throw new Error('Server से सही image नहीं मिली. Error log console में देखें.');
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    resultImage.src = imageUrl;
    resultImage.style.display = 'block';
    placeholderText.style.display = 'none';

    btnDownloadImg.style.display = 'inline-block';
    btnDownloadImg.disabled = false;

    btnDownloadImg.onclick = () => {
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `bg_removed_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    showStatus('✅ Background remove हो गया. अब download कर सकते हैं.', 'success');
  } catch (err) {
    console.error('Network / processing error:', err);
    alert(err.message || 'कनेक्शन में दिक्कत है, थोड़ी देर बाद फिर कोशिश करें.');
    showStatus('❌ Error: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    setProcessingState(false);
  }
});

// ------- 3. CLEAR BUTTON -------
btnImgClear.addEventListener('click', () => {
  imgInput.value = '';
  resetPreview();
});

