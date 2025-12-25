const imgInput = document.getElementById('imgInput');
const btnImgRemoveBg = document.getElementById('btnImgRemoveBg');
const btnDownloadImg = document.getElementById('btnDownloadImg');
const resultImage = document.getElementById('resultImage');
const placeholderText = document.getElementById('placeholderText');
const loader = document.getElementById('loader');

// Render API URL
const API_URL = "https://magic-backend-354o.onrender.com/remove-bg";

btnImgRemoveBg.onclick = async () => {
    if (imgInput.files.length === 0) {
        alert("कृपया पहले एक फोटो चुनें!");
        return;
    }

    const file = imgInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // UI Updates
    btnImgRemoveBg.disabled = true;
    btnImgRemoveBg.innerText = "Processing...";
    loader.style.display = "inline-block";
    btnDownloadImg.style.display = "none";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("सर्वर चालू हो रहा है... कृपया 30 सेकंड बाद फिर से कोशिश करें।");

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // Show Result
        resultImage.src = imageUrl;
        resultImage.style.display = "block";
        placeholderText.style.display = "none";
        btnDownloadImg.style.display = "inline-block";

        // Download Logic
        btnDownloadImg.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = 'bg_removed_by_digitech.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

    } catch (error) {
        alert(error.message);
    } finally {
        btnImgRemoveBg.disabled = false;
        btnImgRemoveBg.innerText = "✨ Remove Background";
        loader.style.display = "none";
    }
};

document.getElementById('btnImgClear').onclick = () => {
    imgInput.value = "";
    resultImage.style.display = "none";
    placeholderText.style.display = "block";
    btnDownloadImg.style.display = "none";
};

