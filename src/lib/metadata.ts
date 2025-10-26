// Default metadata template for new collections
export const getDefaultMetadata = (
  collectionName?: string,
  collectionId?: string
): { [assetName: string]: any } => {
  const artist = "This NFT was minted by Isaac (https://bytegen.dev/)";
  const collection = collectionName || "Default Collection";
  const id = collectionId || Date.now().toString();

  return {
    [`Nft01_${id}`]: {
      name: "NFT-1",
      image: "ipfs://QmRm6VH1SKtNcfXDYHvUqeU3JLCHeRs8h8if3bN62fEULq",
      mediaType: "image/jpg",
      description: "A unique digital collectible from the collection.",
      artist,
      collection,
    },
  };
};

// Metadata template for adding to existing collections
export const getExistingCollectionMetadata = (
  collectionName: string
): { [assetName: string]: any } => {
  const artist = "This NFT was minted by Isaac (https://bytegen.dev/)";
  const id = Date.now().toString();

  return {
    [`${collectionName}_${id}`]: {
      name: `${collectionName} #(ID)`,
      image: "ipfs://QmRm6VH1SKtNcfXDYHvUqeU3JLCHeRs8h8if3bN62fEULq",
      mediaType: "image/jpg",
      description: "A unique digital collectible from the collection.",
      artist,
      collection: collectionName,
    },
  };
};

// Legacy export for backward compatibility
export const metadata = getDefaultMetadata();
