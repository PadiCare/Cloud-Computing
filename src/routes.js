const { getImageData, getPredictionData, getAnalysisData, uploadImage } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/upload',
        handler: async (request, h) => {
            try {
                const file = request.payload;
                const fileName = await uploadImage(file);
                return { fileName };
            } catch (error) {
                return h.response({ error: 'Failed to upload image' }).code(500);
            }
        },
    },
    {
        method: 'GET',
        path: '/images/{imageId}',
        handler: async (request, h) => {
            const imageId = request.params.imageId;
            return await getImageData(imageId);
        },
    },
    {
        method: 'GET',
        path: '/predictions/{predictionId}',
        handler: async (request, h) => {
            const predictionId = request.params.predictionId;
            return await getPredictionData(predictionId);
        },
    },
    {
        method: 'GET',
        path: '/analysis/{analysisId}',
        handler: async (request, h) => {
            const analysisId = request.params.analysisId;
            return await getAnalysisData(analysisId);
        },
    },
];

module.exports = routes;