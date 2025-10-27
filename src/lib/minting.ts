import {
  MeshTxBuilder,
  ForgeScript,
  BlockfrostProvider,
  deserializeAddress,
  resolveScriptHash,
  stringToHex,
} from "@meshsdk/core";
import type { NativeScript, IWallet } from "@meshsdk/core";
import { getDefaultMetadata } from "./metadata";
import { getDefaultRecipients, createRecipients } from "./recipients";

const networkId = 0; // 0 for testnet, 1 for mainnet
const blockfrostKey =
  process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || "BLOCKFROST_KEY_HERE";

// Function to get a safe future slot number
const getFutureSlot = async (
  provider: any,
  epochsFromNow: number = 10
): Promise<number> => {
  try {
    // Get current epoch info to calculate a safe future slot
    const epochInfo = await provider.getEpochInfo();
    const currentSlot = epochInfo.slot;
    // Add specified epochs worth of slots (epochs * 432000 slots per epoch)
    const slotsToAdd = epochsFromNow * 432000;
    return currentSlot + slotsToAdd;
  } catch (error) {
    console.warn("Could not get current slot, using fallback:", error);
    // Fallback to a very high number if we can't get current slot
    return 300000000;
  }
};

// Define the proper NFT metadata type
type AssetMetadata = {
  files: {
    mediaType: string;
    name: string;
    src: string;
  }[];
  image: string;
  mediaType: string;
  name: string;
  description?: string;
  artist?: string;
  collection?: string;
};

// Function to generate CIP-25 compliant metadata
function get721Metadata(
  name: string,
  imageUrl: string,
  description: string,
  artist: string,
  collection?: string
): AssetMetadata {
  return {
    files: [
      {
        mediaType: "image/png",
        name,
        src: imageUrl,
      },
    ],
    image: imageUrl,
    mediaType: "image/png",
    name,
    description,
    artist,
    collection,
  };
}

export async function mintNFTs(
  wallet: IWallet,
  collectionName?: string,
  customMetadata?: any,
  customRecipients?: string[],
  useTimeLock: boolean = true,
  timeLockEpochs: number = 10
) {
  try {
    // Initialize blockchain provider
    const provider = new BlockfrostProvider(blockfrostKey);

    const address = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();
    const { pubKeyHash } = deserializeAddress(address);

    // Generate a unique collection ID for this minting session
    const collectionId = Date.now().toString();

    // Use custom metadata if provided, otherwise use default
    const metadataToUse =
      customMetadata || getDefaultMetadata(collectionName, collectionId);

    // Extract asset names from metadata
    const assetNames = Object.keys(metadataToUse);

    // Get recipients - use custom recipients if provided, otherwise use wallet address
    const recipients = customRecipients
      ? createRecipients(customRecipients, address, collectionId, assetNames)
      : getDefaultRecipients(address, collectionId, assetNames);

    // Get a safe future slot number
    const futureSlot = await getFutureSlot(provider, timeLockEpochs);

    // Create native script for policy
    const nativeScript: NativeScript = useTimeLock
      ? {
          type: "all",
          scripts: [
            {
              type: "before",
              slot: futureSlot.toString(), // Dynamic future slot
            },
            { type: "sig", keyHash: pubKeyHash },
          ],
        }
      : {
          type: "sig",
          keyHash: pubKeyHash,
        };

    const forgeScript = ForgeScript.fromNativeScript(nativeScript);
    const policyId = resolveScriptHash(forgeScript);

    // Initialize transaction builder
    const txBuilder = new MeshTxBuilder({ fetcher: provider });

    // Create metadata structure
    const nftMetadata: {
      [policyId: string]: {
        [assetName: string]: AssetMetadata;
      };
    } = { [policyId]: {} };

    // Loop through recipients and prepare minting
    for (let recipient in recipients) {
      const assetName = recipients[recipient];
      const assetData = metadataToUse[assetName];

      // Convert asset name to hex
      const tokenHex = stringToHex(assetName);

      // Add minting to transaction
      txBuilder.mint("1", policyId, tokenHex).mintingScript(forgeScript);

      // Create proper metadata
      const imageUrl =
        assetData.image === "addimage"
          ? "https://pbs.twimg.com/profile_images/1969705385977114625/Cnw3WAAr_400x400.jpg" // Default image
          : assetData.image;

      nftMetadata[policyId][assetName] = get721Metadata(
        assetData.name,
        imageUrl,
        assetData.description,
        assetData.artist,
        collectionName || "Default Collection"
      );
    }

    // Build and submit transaction
    const unsignedTx = await txBuilder
      .metadataValue(721, nftMetadata)
      .changeAddress(address)
      .invalidHereafter(futureSlot)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    // Save policy information to localStorage
    const policyInfo = {
      policyId,
      collectionName: collectionName || "Default Collection",
      nativeScript,
      forgeScript: forgeScript.toString(),
      createdAt: new Date().toISOString(),
      txHash,
    };

    // Get existing policies or create new array
    const existingPolicies = JSON.parse(
      localStorage.getItem("nftPolicies") || "[]"
    );

    // Check if a policy with this Policy ID already exists
    const existingPolicyIndex = existingPolicies.findIndex(
      (policy: any) => policy.policyId === policyId
    );

    if (existingPolicyIndex !== -1) {
      // Update existing policy with new transaction hash and timestamp
      existingPolicies[existingPolicyIndex] = {
        ...existingPolicies[existingPolicyIndex],
        txHash,
        createdAt: new Date().toISOString(),
      };
    } else {
      // Add new policy only if it doesn't exist
      existingPolicies.push(policyInfo);
    }

    localStorage.setItem("nftPolicies", JSON.stringify(existingPolicies));
    console.log("Policy saved to localStorage:", policyInfo);
    console.log("All policies in localStorage:", existingPolicies);

    return {
      success: true,
      txHash,
      policyId,
      policyScript: {
        policyId,
        collectionName: collectionName || "Default Collection",
        nativeScript,
        forgeScript: forgeScript.toString(),
        createdAt: new Date().toISOString(),
        txHash,
      },
      message: `Collection "${
        collectionName || "Default Collection"
      }" minted successfully!`,
    };
  } catch (error) {
    console.error("Minting failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Minting failed. Please try again.",
      policyScript: null,
    };
  }
}

// Function to get saved policies from localStorage
export function getSavedPolicies() {
  if (typeof window === "undefined") return [];
  try {
    const policies = JSON.parse(localStorage.getItem("nftPolicies") || "[]");

    // Filter out duplicates based on policyId, keeping the most recent one
    const uniquePolicies = policies.reduce((acc: any[], current: any) => {
      const existingIndex = acc.findIndex(
        (policy) => policy.policyId === current.policyId
      );

      if (existingIndex === -1) {
        // No duplicate found, add the policy
        acc.push(current);
      } else {
        // Duplicate found, keep the one with the most recent createdAt date
        const existing = acc[existingIndex];
        if (new Date(current.createdAt) > new Date(existing.createdAt)) {
          acc[existingIndex] = current;
        }
      }

      return acc;
    }, []);

    return uniquePolicies;
  } catch (error) {
    console.error("Error loading saved policies:", error);
    return [];
  }
}

// Function to check if a policy exists in saved policies
export function hasPolicyScript(policyId: string): boolean {
  const savedPolicies = getSavedPolicies();
  return savedPolicies.some((policy: any) => policy.policyId === policyId);
}

// Function to mint to existing collection
export async function mintToExistingCollection(
  wallet: IWallet,
  policyId: string,
  collectionName: string,
  customMetadata?: any,
  customRecipients?: string[],
  timeLockEpochs: number = 10
) {
  try {
    // Get saved policies
    const savedPolicies = getSavedPolicies();
    const existingPolicy = savedPolicies.find(
      (p: any) => p.policyId === policyId
    );

    if (!existingPolicy) {
      throw new Error("Policy not found in saved collections");
    }

    // Initialize blockchain provider
    const provider = new BlockfrostProvider(blockfrostKey);

    const address = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();

    // Generate a unique collection ID for this minting session
    const collectionId = Date.now().toString();

    // Use custom metadata if provided, otherwise use default
    const metadataToUse =
      customMetadata || getDefaultMetadata(collectionName, collectionId);

    // Extract asset names from metadata
    const assetNames = Object.keys(metadataToUse);

    // Get recipients - use custom recipients if provided, otherwise use wallet address
    const recipients = customRecipients
      ? createRecipients(customRecipients, address, collectionId, assetNames)
      : getDefaultRecipients(address, collectionId, assetNames);

    // Get a safe future slot number
    const futureSlot = await getFutureSlot(provider, timeLockEpochs);

    // For existing collections, we need to use the exact same script
    // The policy ID must remain the same, so we use the saved script
    const forgeScript = ForgeScript.fromNativeScript(
      existingPolicy.nativeScript
    );

    // Verify the policy ID matches
    const currentPolicyId = resolveScriptHash(forgeScript);
    if (currentPolicyId !== policyId) {
      throw new Error(
        `Policy ID mismatch. Expected: ${policyId}, Got: ${currentPolicyId}`
      );
    }

    // Check if the script is still valid (not expired)
    // Only check for time-locked scripts (those with 'before' slot)
    if (existingPolicy.nativeScript) {
      // For time-locked scripts (type: "all" with scripts array)
      if (
        existingPolicy.nativeScript.type === "all" &&
        existingPolicy.nativeScript.scripts
      ) {
        const beforeScript = existingPolicy.nativeScript.scripts.find(
          (script: any) => script.type === "before"
        );
        if (beforeScript && beforeScript.slot) {
          const scriptSlot = parseInt(beforeScript.slot);
          if (scriptSlot < futureSlot - 4320000) {
            // If script expires within 10 epochs
            throw new Error(
              `The collection's policy script has expired or will expire soon. Cannot add more NFTs to this collection.`
            );
          }
        }
      }
      // For non-time-locked scripts (type: "sig"), no expiration check needed
    }

    // Initialize transaction builder
    const txBuilder = new MeshTxBuilder({ fetcher: provider });

    // Use custom metadata if provided, otherwise use default
    const existingMetadataToUse =
      customMetadata || getDefaultMetadata(collectionName, collectionId);

    // Create metadata structure
    const nftMetadata: {
      [policyId: string]: {
        [assetName: string]: AssetMetadata;
      };
    } = { [policyId]: {} };

    // Loop through recipients and prepare minting
    for (let recipient in recipients) {
      const assetName = recipients[recipient];
      const assetData = existingMetadataToUse[assetName];

      // Convert asset name to hex
      const tokenHex = stringToHex(assetName);

      // Add minting to transaction
      txBuilder.mint("1", policyId, tokenHex).mintingScript(forgeScript);

      // Create proper metadata
      const imageUrl =
        assetData.image === "addimage"
          ? "https://pbs.twimg.com/profile_images/1969705385977114625/Cnw3WAAr_400x400.jpg" // Default image
          : assetData.image;

      nftMetadata[policyId][assetName] = get721Metadata(
        assetData.name,
        imageUrl,
        assetData.description,
        assetData.artist,
        collectionName
      );
    }

    // Build and submit transaction
    const unsignedTx = await txBuilder
      .metadataValue(721, nftMetadata)
      .changeAddress(address)
      .invalidHereafter(futureSlot)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return {
      success: true,
      txHash,
      policyId,
      message: `Added NFTs to existing collection "${collectionName}" successfully!`,
    };
  } catch (error) {
    console.error("Minting to existing collection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Failed to add to existing collection. Please try again.",
    };
  }
}

// Function to burn NFTs
export async function burnNFT(
  wallet: IWallet,
  policyId: string,
  assetName: string,
  quantity: string = "1"
) {
  try {
    // Initialize blockchain provider
    const provider = new BlockfrostProvider(blockfrostKey);

    const address = await wallet.getChangeAddress();
    const utxos = await wallet.getUtxos();

    // Try to find the saved policy script for this policy ID
    const savedPolicies = getSavedPolicies();
    const savedPolicy = savedPolicies.find((p: any) => p.policyId === policyId);

    let forgingScript;
    if (savedPolicy && savedPolicy.nativeScript) {
      // Use the saved native script if available
      console.log("Using saved policy script for burning");
      forgingScript = ForgeScript.fromNativeScript(savedPolicy.nativeScript);
    } else {
      // Fallback to simple signature script
      console.log("Using simple signature script for burning");
      forgingScript = ForgeScript.withOneSignature(address);
    }

    // Convert asset name to hex
    const tokenNameHex = stringToHex(assetName);

    // Initialize transaction builder
    const txBuilder = new MeshTxBuilder({ fetcher: provider });

    // Build burn transaction (negative quantity)
    const unsignedTx = await txBuilder
      .mint(`-${quantity}`, policyId, tokenNameHex)
      .mintingScript(forgingScript)
      .changeAddress(address)
      .selectUtxosFrom(utxos)
      .complete();

    const signedTx = await wallet.signTx(unsignedTx);
    const txHash = await wallet.submitTx(signedTx);

    return {
      success: true,
      txHash,
      message: `Successfully burned ${quantity} of ${assetName}`,
    };
  } catch (error) {
    console.error("Burning failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      message: "Burning failed. Please try again.",
    };
  }
}
