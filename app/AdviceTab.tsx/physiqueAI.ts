import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Ensure the path ends with /api/analyze
// Update this line in your frontend physiqueAI.ts file:
const BACKEND_URL = "https://fit-buddy-backend.onrender.com/analyze";
/**
 * Compresses an image and returns a clean object format that 
 * both iOS and Android native network bridges understand.
 */
const prepareImage = async (uri: string, filename: string) => {
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 720 } }], 
    { compress: 0.7, format: SaveFormat.JPEG }
  );

  // Return the pure layout React Native expects for files
  return {
    uri: manipulated.uri,
    name: filename,
    type: 'image/jpeg',
  };
};

/**
 * Uploads front and back photos to the secure Node.js backend for LLM critique.
 */
export const analyzePhysique = async (frontUri: string, backUri: string): Promise<string> => {
  try {
    const frontFile = await prepareImage(frontUri, 'front.jpg');
    const backFile = await prepareImage(backUri, 'back.jpg');

    const formData = new FormData();
    
    // Use "as any" to force TypeScript to accept React Native's file object format
    formData.append('front', frontFile as any);
    formData.append('back', backFile as any);

    console.log("Sending clean multipart data from phone...");

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