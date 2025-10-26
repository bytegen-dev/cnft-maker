export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.IpfsHash) {
      return `ipfs://${data.IpfsHash}`;
    } else {
      throw new Error("Failed to get IPFS hash from Pinata response");
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error(`Failed to upload to IPFS: ${error}`);
  }
}
