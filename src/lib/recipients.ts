// Default recipients - all NFTs go to the same wallet address
export const getDefaultRecipients = (
  walletAddress: string,
  collectionId?: string,
  assetNames?: string[]
): { [recipient: string]: string } => {
  const id = collectionId || Date.now().toString();
  const names = assetNames || [`Nft01_${id}`, `Nft02_${id}`, `Nft03_${id}`];

  const recipients: { [recipient: string]: string } = {};
  names.forEach((assetName, index) => {
    // Create unique recipient keys for the same address
    recipients[`${walletAddress}_${index}`] = assetName;
  });

  return recipients;
};

// This will be used when we have custom recipients from the frontend
export const createRecipients = (
  addresses: string[],
  walletAddress: string,
  collectionId?: string,
  assetNames?: string[]
): { [recipient: string]: string } => {
  const recipients: { [recipient: string]: string } = {};
  const id = collectionId || Date.now().toString();
  const names = assetNames || [`Nft01_${id}`, `Nft02_${id}`, `Nft03_${id}`];

  addresses.forEach((address, index) => {
    if (index < names.length) {
      // Use wallet address if custom address is empty
      const finalAddress = address.trim() || walletAddress;
      recipients[finalAddress] = names[index];
    }
  });

  return recipients;
};
