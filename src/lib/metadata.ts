import {
  getMetadataTemplate,
  METADATA_STANDARDS,
  type MetadataStandard,
} from "./constants";

// Default metadata template for new collections
export const getDefaultMetadata = (
  collectionName?: string,
  collectionId?: string,
  metadataStandard: MetadataStandard = METADATA_STANDARDS.BASIC
): { [assetName: string]: any } => {
  const collection = collectionName || "Default";
  const id = collectionId || Date.now().toString();

  // Get template based on standard
  const template = getMetadataTemplate(metadataStandard, collection, id);

  // Convert template to the expected format with dynamic asset names
  const result: { [assetName: string]: any } = {};
  Object.keys(template).forEach((key, index) => {
    const assetName =
      metadataStandard === METADATA_STANDARDS.BASIC
        ? `Nft${String(index + 1).padStart(2, "0")}_${id}`
        : `${collectionName || "NFT"}_${id}_${index + 1}`;

    result[assetName] = {
      ...(template as any)[key],
    };
  });

  return result;
};

export const getExistingCollectionMetadata = (
  collectionName: string
): { [assetName: string]: any } => {
  const id = Date.now().toString();

  return {
    [`${collectionName}_${id}`]: {
      name: `${collectionName} #(ID)`,
      image: "ipfs://QmRm6VH1SKtNcfXDYHvUqeU3JLCHeRs8h8if3bN62fEULq",
      mediaType: "image/jpg",
      description: "A unique digital collectible from the collection.",
      collection: collectionName,
    },
  };
};

export const metadata = getDefaultMetadata();
