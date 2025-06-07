/**
 * Uploads an image to the server and saves it to the public directory
 *
 * @param file The file to upload
 * @param altText Alt text for the image
 * @param subdomain The subdomain folder to save the image in
 * @returns The URL of the uploaded image
 */
export async function uploadImage(file: File, altText: string, subdomain = "default"): Promise<string> {
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("altText", altText)
      formData.append("subdomain", subdomain)
  
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload image")
      }
  
      const data = await response.json()
      return data.image.url
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    }
  }
  
  /**
   * Deletes an image from the server
   *
   * @param imageUrl The URL of the image to delete
   */
  export async function deleteImage(imageUrl: string): Promise<void> {
    try {
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })
  
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete image")
      }
    } catch (error) {
      console.error("Error deleting image:", error)
      throw error
    }
  }
  