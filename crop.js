const sharp=require('sharp')
const crypto=require('crypto')
const { error } = require('console')

const processImage=async(req,res,next)=>{
    try{
        if(!req.files || req.files.length==0){
            throw new Error("No file Uploaded")
        }

        const uploadFiles=req.files;
        const processedImages=await Promise.all(
            uploadFiles.map(async(file)=>{
                const randomName=crypto.randomBytes(20).toString('hex')
                const outputPath=`uploads/${randomName}.jpg`;

                await sharp(file.path)
                .extract({ width: 300, height: 300, left: 100, top:100 }) 
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(outputPath);

                const processedPath=outputPath;
                console.log("Output Path:", outputPath);
console.log("Processed Path:", processedPath);

                return processedPath
            })
        );

        req.processedImages=processedImages;
        next();
    }catch(error){
        console.log("Error processing Image:",error);
        res.status(500).send("Error processing Image")
    }
}

module.exports= {processImage:processImage,}
