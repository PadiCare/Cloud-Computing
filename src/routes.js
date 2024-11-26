// Route untuk mendapatkan data gambar
server.route({
    method: 'GET',
    path: '/images/{imageId}',
    handler: async (request, h) => {
        // Handler untuk mendapatkan data gambar
        const imageId = request.params.imageId;
        const imageDoc = await firestore.collection('images').doc(imageId).get();
        if (!imageDoc.exists) {
            return { error: 'Image not found' };
        }
        const imageData = imageDoc.data();
        return imageData;
    }
});

// Route untuk mendapatkan data prediksi
server.route({
    method: 'GET',
    path: '/predictions/{predictionId}',
    handler: async (request, h) => {
        // Handler untuk mendapatkan data prediksi
        const predictionId = request.params.predictionId;
        const predictionDoc = await firestore.collection('predictions').doc(predictionId).get();
        if (!predictionDoc.exists) {
            return { error: 'Prediction not found' };
        }
        const predictionData = predictionDoc.data();
        return predictionData;
    }
});

// Route untuk mendapatkan data analisis
server.route({
    method: 'GET',
    path: '/analysis/{analysisId}',
    handler: async (request, h) => {
        // Handler untuk mendapatkan data analisis
        const analysisId = request.params.analysisId;
        const analysisDoc = await firestore.collection('analysis').doc(analysisId).get();
        if (!analysisDoc.exists) {
            return { error: 'Analysis not found' };
        }
        const analysisData = analysisDoc.data();
        return analysisData;
    }
});