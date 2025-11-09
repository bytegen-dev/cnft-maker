// Metadata standards for NFT collections
export const METADATA_STANDARDS = {
  BASIC: "basic",
  DEVELOPER_IDENTITY: "developerIdentity",
} as const;

export type MetadataStandard =
  (typeof METADATA_STANDARDS)[keyof typeof METADATA_STANDARDS];

// Template metadata structures for different standards
export const METADATA_TEMPLATES = {
  [METADATA_STANDARDS.BASIC]: {
    NFT_01: {
      name: "NFT #1",
      image: "ipfs://Qmcw8RoZSK8VaN8aKw6ViqrZEd9Ddzz7cXCBQfWVbZBY7Q",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      traits: [
        {
          trait_type: "trait-type",
          value: "trait-value",
        },
        {
          trait_type: "trait-type",
          value: "trait-value",
        },
        {
          trait_type: "trait-type",
          value: "trait-value",
        },
      ],
    },
  },
  [METADATA_STANDARDS.DEVELOPER_IDENTITY]: {
    NFT_01: {
      name: "agent-name",
      image: "ipfs://Qmcw8RoZSK8VaN8aKw6ViqrZEd9Ddzz7cXCBQfWVbZBY7Q",
      mediaType: "image/png",
      description: "what your agent does",
      agentUrl: "https://agent.example.com",
      credentials: {
        credentialType: "",
        credentialTitle: "",
        issueeId: "",
        issuanceDateTime: "",
        credentialProperties: {
          version: "",
          issueeAid: "",
          credentialStatusRegistry: "",
          schemaSaid: "",
        },
        connections: [],
      },
    },
  },
} as const;

// Helper function to get metadata template by standard
export function getMetadataTemplate(
  standard: MetadataStandard,
  collectionName: string,
  collectionId: string
) {
  const template = METADATA_TEMPLATES[standard];
  const updatedTemplate = { ...template };

  // Update collection name in all NFTs
  Object.keys(updatedTemplate).forEach((key) => {
    updatedTemplate[key as keyof typeof updatedTemplate] = {
      ...(updatedTemplate[key as keyof typeof updatedTemplate] as any),
      collection: collectionName,
    };
  });

  return updatedTemplate;
}
