import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

interface ReactNativeFileValue {
  uri: string;
  name: string;
  type: string;
}

const BACKEND_URL = "https://fit-buddy-backend.onrender.com/api/analyze";

/**
 * Compresses an image and formats it for multipart/form-data upload.
 */
const prepareImage = async (uri: string, filename: string): Promise<Blob> => {
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 720 } }], 
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  const fileConfig: ReactNativeFileValue = {
    uri: manipulated.uri,
    name: filename,
    type: 'image/jpeg',
  };

  // Cast to unknown then Blob to satisfy the browser-centric FormData definition safely
  return fileConfig as unknown as Blob;
};

/**
 * Uploads front and back photos to the secure Node.js backend for LLM critique.
 */
export const analyzePhysique = async (frontUri: string, backUri: string): Promise<string> => {
  try {
    const frontBlob = await prepareImage(frontUri, 'front.jpg');
    const backBlob = await prepareImage(backUri, 'back.jpg');

    const formData = new FormData();
    formData.append('front', frontBlob);
    formData.append('back', backBlob);

    // FIX: Removed the manual headers configuration completely
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to communicate with backend server.");
    }

    return await response.text();
  } catch (error) {
    console.error("Frontend Upload Error:", error);
    throw error;
  }
};