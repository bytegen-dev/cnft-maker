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
      image: "addimage",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      collection: "Default Collection",
    },
    NFT_02: {
      name: "NFT #2",
      image: "addimage",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      collection: "Default Collection",
    },
    NFT_03: {
      name: "NFT #3",
      image: "addimage",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      collection: "Default Collection",
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
        credentialId: "",
        issuer: {
          name: "",
          email: "",
          website: "",
        },
        signature: "",
        connections: [
          {
            name: "GitHub",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Twitter/X",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Website",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Telegram",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
        ],
      },
    },
    NFT_02: {
      name: "NFT #2",
      image: "addimage",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      collection: "Default Collection",
      credentials: {
        credentialId: "",
        issuer: {
          name: "",
        },
        signature: "",
        connections: [
          {
            name: "GitHub",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Twitter/X",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Website",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Telegram",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
        ],
      },
    },
    NFT_03: {
      name: "NFT #3",
      image: "addimage",
      mediaType: "image/png",
      description: "A unique digital collectible from the collection.",
      collection: "Default Collection",
      credentials: {
        credentialId: "",
        issuer: {
          name: "",
        },
        signature: "",
        connections: [
          {
            name: "GitHub",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Twitter/X",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Website",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
          {
            name: "Telegram",
            url: "",
            id: "",
            timestamp: "",
            linked_identifier: "",
          },
        ],
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
