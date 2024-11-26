const Hapi = require('@hapi/hapi');
const { Storage } = require('@google-cloud/storage');
const { Firestore } = require('@google-cloud/firestore');
const { nanoid } = require('nanoid');

// Konfigurasi
const config = require('./config.json');

// Inisialisasi
const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
});

const storage = new Storage({
    projectId: config.projectId
});
const bucketName = config.bucketName;

const firestore = new Firestore({
    projectId: config.projectId
});

// Route untuk mengunggah gambar
server.route({
    method: 'POST',
    path: '/upload',
    handler: async (request, h) => {
        const file = request.payload;
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

        // Kirim ID gambar ke service Machine Learning (misalnya, menggunakan request HTTP)
        const machineLearningUrl = 'https://your-machine-learning-service-url';
        const machineLearningResponse = await h.request({
            method: 'POST',
            url: machineLearningUrl,
            payload: {
                imageId: fileName
            }
        });

        // Simpan hasil prediksi ke Firestore
        const predictionLabel = machineLearningResponse.result; // Asumsikan hasil prediksi adalah sebuah string
        await firestore.collection('predictions').add({
        label: predictionLabel,
        imageId: fileName
        });

        // Cari data analisis berdasarkan label prediksi
        const predictionDoc = await firestore.collection('predictions').where('label', '==', predictionLabel).get();
        if (!predictionDoc.empty) {
        const predictionId = predictionDoc.docs[0].id; // Ambil ID dokumen prediksi

        // Cari data analisis berdasarkan ID prediksi (sesuaikan dengan struktur data Anda)
        const analysisDoc = await firestore.collection('analysis').doc(predictionId).get();
        const analysisData = analysisDoc.data();

        // Update dokumen gambar dengan ID analisis
        await firestore.collection('images').doc(fileName).update({
            predictionId: predictionId,
            analysis: analysisData
        });

        // Kembalikan data gambar dan analisis
        imageData.analysis = analysisData;
        return imageData;
        } else {
        // Handle kasus ketika tidak ditemukan data analisis
        console.error('Prediction not found:', predictionLabel);
        return { error: 'Prediction not found' };
        }
    }
});

// Mulai server
const init = async () => {
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

init();