const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');

// Konfigurasi
const config = require('../config.json');

// Inisialisasi
const storage = new Storage({
    projectId: config.projectId
});
const bucketName = config.bucketName;

const firestore = new Firestore({
    projectId: config.projectId
});

// Fungsi untuk mengunggah gambar
async function uploadImage(file) {
    const fileName = nanoid();
    const fileBuffer = file._data;

    // Simpan gambar ke Cloud Storage
    const bucket = storage.bucket(bucketName);
    const fileBlob = bucket.file(fileName);
    await fileBlob.save(fileBuffer);

    // Simpan informasi gambar ke Firestore
    await firestore.collection('images').add({
        id: fileName,
        createdAt: new Date()
    });

    return fileName;
}

// Fungsi untuk mendapatkan data gambar
async function getImageData(imageId) {
    const imageDoc = await firestore.collection('images').doc(imageId).get();
    if (!imageDoc.exists) {
        return { error: 'Image not found' };
    }
    const imageData = imageDoc.data();
    return imageData;
}

// Fungsi untuk mendapatkan data prediksi
async function getPredictionData(predictionId) {
    const predictionDoc = await firestore.collection('predictions').doc(predictionId).get();
    if (!predictionDoc.exists) {
        return { error: 'Prediction not found' };
    }
    const predictionData = predictionDoc.data();
    return predictionData;
}

// Fungsi untuk mendapatkan data analisis
async function getAnalysisData(analysisId) {
    const analysisDoc = await firestore.collection('analysis').doc(analysisId).get();
    if (!analysisDoc.exists) {
        return { error: 'Analysis not found' };
    }
    const analysisData = analysisDoc.data();
    return analysisData;
}

// Fungsi untuk memproses prediksi
async function processPrediction(imageId, predictionLabel) {
    // Simpan hasil prediksi ke Firestore
    await firestore.collection('predictions').add({
        label: predictionLabel,
        imageId: imageId
    });

    // Cari data analisis berdasarkan label prediksi
    const predictionDoc = await firestore.collection('predictions').where('label', '==', predictionLabel).get();
    if (!predictionDoc.empty) {
        const predictionId = predictionDoc.docs[0].id; // Ambil ID dokumen prediksi

        // Cari data analisis berdasarkan ID prediksi
        const analysisDoc = await firestore.collection('analysis').doc(predictionId).get();
        const analysisData = analysisDoc.data();

        // Update dokumen gambar dengan ID analisis
        await firestore.collection('images').doc(imageId).update({
            predictionId: predictionId,
            analysis: analysisData
        });

        // Kembalikan data gambar dan analisis
        const imageData = await getImageData(imageId);
        imageData.analysis = analysisData;
        return imageData;
    } else {
        // Handle kasus ketika tidak ditemukan data analisis
        console.error('Prediction not found:', predictionLabel);
        return { error: 'Prediction not found' };
    }
}

// Ekspor fungsi-fungsi yang ingin digunakan di routes.js
module.exports = {
    uploadImage,
    getImageData,
    getPredictionData,
    getAnalysisData,
    processPrediction
};