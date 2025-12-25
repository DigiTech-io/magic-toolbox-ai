// Magic Toolbox - Final Frontend Script
const imageInput = document.getElementById('imageInput');
const removeBgBtn = document.getElementById('removeBgBtn');
const resultContainer = document.getElementById('resultContainer');
const downloadBtn = document.getElementById('downloadBtn');
const processedImage = document.getElementById('processedImage');
const loader = document.getElementById('loader');

removeBgBtn.addEventListener('click', async () => {
    if (!imageInput.files[0]) {
        alert("कृपया पहले एक फोटो चुनें!");
        return;
    }

    const formData = new FormData();
    formData.append('image', imageInput.files[0]);

    // लोडर दिखाएं और बटन बंद करें
    loader.style.display = 'block';
    removeBgBtn.disabled = true;
    resultContainer.style.display = 'none';

    try {
        // Render बैकएंड को फोटो भेजना
        const response = await fetch('https://magic-backend-354o.onrender.com/remove-bg', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('सर्वर से जवाब नहीं मिला');

        // बैकएंड से प्रोसेस की हुई फोटो (Blob) प्राप्त करना
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // रिजल्ट दिखाना
        processedImage.src = url;
        downloadBtn.href = url;
        downloadBtn.download = 'magic_image.png';
        resultContainer.style.display = 'block';

    } catch (error) {
        console.error("Error:", error);
        alert("कुछ गड़बड़ हो गई! कृपया दोबारा कोशिश करें।");
    } finally {
        loader.style.display = 'none';
        removeBgBtn.disabled = false;
    }
});