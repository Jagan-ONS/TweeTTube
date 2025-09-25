import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload
        (localFilePath , {resource_type : "auto"})
        console.log("file is uploaded on cloudinary",response.url);
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        //here we are removing the file from the localstorage ??
        //but why if we try to upload it agian it may be useful 
        //instead of multer sending it again 
        return null
    }
}

export {uploadOnCloudinary}