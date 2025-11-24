"use server";

export async function convertImageToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    throw new Error("Could not process image for virtual try-on.");
  }
}
