import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

 export const uploadOnCloudinary=async(localFilePath)=>{
        try {
            if(!localFilePath) return null

            //upload file on Cloudinary
          const response= await  cloudinary.uploader.upload(localFilePath,{
                resource_type:'auto'
            });

            // When File has been upload successfully
            console.log("file is uploaded on Cloudinary",response.url);
            fs.unlinkSync(localFilePath) 
            return response;
            
        } catch (error) {
            fs.unlinkSync(localFilePath) //this remove the locally save temp file as the upload operation failed
        }
    }
    