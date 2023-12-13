const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs').promises;

const processImage = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            throw new Error("No file uploaded");
        }

        // Ensure the 'uploads' directory exists
        await fs.mkdir('uploads', { recursive: true });

        const uploadFiles = req.files;
        const processedImages = await Promise.all(
            uploadFiles.map(async (file) => {
                const randomName = crypto.randomBytes(20).toString('hex');
                const outputPath = `uploads/${randomName}.jpg`;

                const { width, height } = await sharp(file.path).metadata();
                const size = Math.min(width, height);

                await sharp(file.path)
                    .extract({ width: size, height: size, left: 0, top: 0 })
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(outputPath);

                const processedPath = outputPath;
                console.log("Original File Name:", file.originalname);
                console.log("Image Dimensions:", { width, height });
                console.log("Extraction Parameters:", { width: size, height: size, left: 0, top: 0 });
                console.log("Output Path:", outputPath);
                console.log("Processed Path:", processedPath);

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
