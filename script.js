// ज़रूरी एलिमेंट्स को सेलेक्ट करना
const imgInput = document.getElementById('imgInput');
const btnImgRemoveBg = document.getElementById('btnImgRemoveBg');
const btnDownloadImg = document.getElementById('btnDownloadImg');
const resultImage = document.getElementById('resultImage');
const placeholderText = document.getElementById('placeholderText');
const loader = document.getElementById('loader');

// आपका लाइव Render API लिंक
const API_URL = "https://magic-backend-354o.onrender.com/remove-bg";

// 1. इमेज प्रीव्यू दिखाना (जैसे ही फ़ाइल चुनी जाए)
imgInput.onchange = () => {
    const file = imgInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            resultImage.src = e.target.result;
            resultImage.style.display = "block";
            placeholderText.style.display = "none";
            btnDownloadImg.style.display = "none"; // नई फोटो आने पर पिछला डाउनलोड बटन हटा दें
        };
        reader.readAsDataURL(file);
    }
};

// 2. बैकग्राउंड हटाने का फंक्शन
btnImgRemoveBg.onclick = async () => {
    if (imgInput.files.length === 0) {
        alert("कृपया पहले एक फोटो चुनें!");
        return;
    }

    const file = imgInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // UI को लोडिंग स्टेट में डालना
    btnImgRemoveBg.disabled = true;
    btnImgRemoveBg.innerText = "Processing...";
    if(loader) loader.style.display = "inline-block";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error("सर्वर से संपर्क नहीं हो पाया। कृपया 1 मिनट बाद फिर कोशिश करें।");

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        // रिज़ल्ट दिखाना
        resultImage.src = imageUrl;
        btnDownloadImg.style.display = "inline-block";

        // डाउनलोड बटन सेटअप
        btnDownloadImg.onclick = () => {
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = 'magic-bg-removed.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    } finally {
        btnImgRemoveBg.disabled = false;
        btnImgRemoveBg.innerText = "✨ Remove Background";
        if(loader) loader.style.display = "none";
    }
};

// 3. क्लियर बटन फंक्शन
const btnClear = document.getElementById('btnImgClear');
if(btnClear) {
    btnClear.onclick = () => {
        imgInput.value = "";
        resultImage.style.display = "none";
        placeholderText.style.display = "block";
        btnDownloadImg.style.display = "none";
    };
}

