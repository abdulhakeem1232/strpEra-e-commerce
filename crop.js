const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs').promises;

const processImage = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error("No file uploaded");
        }

        await fs.mkdir('uploads', { recursive: true });

        const uploadFiles = req.files;
        const processedImages = await Promise.all(
            uploadFiles.map(async (file) => {
                const randomName = crypto.randomBytes(20).toString('hex');
                const outputPath = `uploads/${randomName}.jpg`;

                const { width, height } = await sharp(file.path).metadata();
                const size = Math.min(width, height);

                const cropSize = Math.floor(size * 0.7); 
                const left = Math.floor((width - cropSize) / 2);
                const top = Math.floor((height - cropSize) / 2);

                await sharp(file.path)
                    .extract({ left, top, width: cropSize, height: cropSize })
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(outputPath);

                const processedPath = outputPath;
                return processedPath;
            })
        );

        req.processedImages = processedImages;
        next();
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).send("Error processing image");
    }
};

module.exports = { processImage: processImage };
