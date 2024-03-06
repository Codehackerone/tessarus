import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true,
});

export const storage: any = new CloudinaryStorage({
  cloudinary, // Cloudinary instance
  params: {
    folder: "Tessarus", // Folder name
    allowedFormats: ["jpg", "png", "jpeg"], // Allowed formats
    transformation: [{ width: 500, height: 500, crop: "limit" }], // Transformation
  } as any,
});

export const uploadFile = async (file: any) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Tessarus",
    });
    return result;
  } catch (err: any) {
    throw {
      statusObj: { status: 400, message: "Bad Request" },
      name: "Error uploading file",
      type: "ValidationError",
    };
  }
};
