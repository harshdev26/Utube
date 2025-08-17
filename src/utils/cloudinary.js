import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_KEY
    });


const uploadOnCloudinary = async (localFilePath) => { //uploading the file which is currently in local server 

    try{   //to get away from the error we are using try catch block
        if(!localFilePath) return null  //if the file path is empty or file is not found in local server then return null
        // upload the file on cloudinary
        cloudinary.uploader.upload(localFilePath, { //else the file founded in local server will be uploaded on cloudinary
            resource_type: "auto" // resource_type is used to specify the type of file we are uploading 
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary", response.url) //once the file is uploaded on cloudinary then return respone to the client and he will fetch the url from the response
        return response  
    } catch (error) {     //if any error is occured 
       fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed.
       return null;
    }


}


export {uploadOnCloudinary}