import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { v2 as cloudinary } from "cloudinary";

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
  });
})();

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return console.log("_File path is not reachable !!_");

    // upload the file on cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfull
    console.log(
      "File is uploaded on Cloudinary! bytes: ",
      cloudinaryResponse.bytes,
      " url: ",
      cloudinaryResponse.url
    );
    return cloudinaryResponse;
    
  } catch (error) {
    console.log("_File upload is failed, check the uploadOnCloudinary fnc_");
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file, if somehow the uploadation is failed!
  }
};

export { uploadOnCloudinary };
