"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  Coins,
  CheckCircle,
  XCircle,
  Wallet,
  Image,
  Minus,
  Plus,
  Trash2,
  Search,
  Folder,
  RefreshCw,
  Download,
  Grid3X3,
  List,
  Flame,
  Power,
  Shield,
  QrCode,
} from "lucide-react";
import {
  mintNFTs,
  getSavedPolicies,
  getSavedPoliciesForNetwork,
  mintToExistingCollection,
  burnNFT,
  hasPolicyScript,
  hasPolicyScriptForNetwork,
} from "@/lib/minting";
import {
  useWallet,
  useWalletList,
  useAddress,
  useAssets,
  useLovelace,
  useNetwork,
} from "@meshsdk/react";
import { BlockfrostProvider } from "@meshsdk/core";
import {
  getDefaultMetadata,
  getExistingCollectionMetadata,
} from "@/lib/metadata";
import { METADATA_STANDARDS, type MetadataStandard } from "@/lib/constants";
import { uploadToIPFS } from "@/lib/pinata";
import Editor from "@monaco-editor/react";
import { NFTCard } from "./NFTCard";
import { NFTDetailsDialog } from "./NFTDetailsDialog";
import { CopyButton } from "@/components/ui/copy-button";
import { BurnDialog } from "./BurnDialog";
import QRCode from "react-qr-code";

export default function MintingInterface() {
  // Browser wallet hooks
  const {
    wallet,
    state,
    connected,
    name,
    connecting,
    connect,
    disconnect,
    error,
  } = useWallet();
  const wallets = useWalletList();
  const address = useAddress();
  const assets = useAssets();
  const lovelace = useLovelace();
  const network = useNetwork();

  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    txHash?: string;
    message: string;
  } | null>(null);
  const [collectionName, setCollectionName] = useState("");
  const [metadataStandard, setMetadataStandard] = useState<MetadataStandard>(
    () => {
      try {
        const saved = localStorage.getItem("metadataStandard");
        return saved === METADATA_STANDARDS.BASIC ||
          saved === METADATA_STANDARDS.DEVELOPER_IDENTITY
          ? (saved as MetadataStandard)
          : METADATA_STANDARDS.BASIC;
      } catch {
        return METADATA_STANDARDS.BASIC;
      }
    }
  );
  const [nftMetadata, setNftMetadata] = useState(
    JSON.stringify(
      getDefaultMetadata(
        collectionName,
        Date.now().toString(),
        metadataStandard
      ),
      null,
      2
    )
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [savedPolicies, setSavedPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [mintMode, setMintMode] = useState<"new" | "existing">(() => {
    try {
      const saved = localStorage.getItem("mintMode");
      return saved === "new" || saved === "existing" ? saved : "new";
    } catch {
      return "new";
    }
  });
  const [customRecipients, setCustomRecipients] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [useCustomRecipients, setUseCustomRecipients] = useState(false);
  const [useTimeLock, setUseTimeLock] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("useTimeLock");
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [timeLockEpochs, setTimeLockEpochs] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("timeLockEpochs");
      return saved ? parseInt(saved) : 10;
    } catch {
      return 10;
    }
  });
  const [burnDialogOpen, setBurnDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [isBurning, setIsBurning] = useState(false);
  const [burnResult, setBurnResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
  } | null>(null);
  const [policyScript, setPolicyScript] = useState<any>(null);
  const [isGalleryMinimized, setIsGalleryMinimized] = useState(false);
  const [isCollectionsMinimized, setIsCollectionsMinimized] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [nftDetailsDialogOpen, setNftDetailsDialogOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [gallerySearch, setGallerySearch] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("gallerySearch");
      return saved || "";
    } catch {
      return "";
    }
  });
  const [isMetadataMinimized, setIsMetadataMinimized] = useState(false);
  const [adaPrice, setAdaPrice] = useState<number>(0);
  const [enhancedAssets, setEnhancedAssets] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [savedWalletId, setSavedWalletId] = useState<string | null>(null);
  const [nftViewMode, setNftViewMode] = useState<"grid" | "list">(() => {
    try {
      const saved = localStorage.getItem("nftViewMode");
      return saved === "grid" || saved === "list" ? saved : "grid";
    } catch {
      return "grid";
    }
  });
  const [isCredentialsMinimized, setIsCredentialsMinimized] = useState(false);
  const [isMintingMinimized, setIsMintingMinimized] = useState(true);
  const [credentialSignature, setCredentialSignature] = useState<string>("");
  const [credentialResponse, setCredentialResponse] = useState<any>(null);
  const [isValidatingSignature, setIsValidatingSignature] = useState(false);
  const [isCIP45Connected, setIsCIP45Connected] = useState(false);
  const [cip45QRCode, setCip45QRCode] = useState<string>("");
  const [isConnectingCIP45, setIsConnectingCIP45] = useState(false);
  const [veridianApi, setVeridianApi] = useState<any>(null);
  const [meerkatId, setMeerkatId] = useState<string>("");
  const [credentialRequest, setCredentialRequest] = useState({
    assetId: "NFT_01_1234567890",
    credentialType: "developer-credential-schema-said",
  });

  // Fetch ADA price from CoinGecko
  const fetchAdaPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
      );
      const data = await response.json();
      setAdaPrice(data.cardano.usd);
    } catch (error) {
      console.error("Failed to fetch ADA price:", error);
      setAdaPrice(0);
    }
  };

  // Wallet persistence functions
  const saveWalletId = (walletId: string) => {
    try {
      localStorage.setItem("cardano_wallet_id", walletId);
      setSavedWalletId(walletId);
    } catch (error) {
      console.error("Failed to save wallet ID:", error);
    }
  };

  const clearWalletId = () => {
    try {
      localStorage.removeItem("cardano_wallet_id");
      setSavedWalletId(null);
    } catch (error) {
      console.error("Failed to clear wallet ID:", error);
    }
  };

  const loadSavedWalletId = () => {
    try {
      const savedId = localStorage.getItem("cardano_wallet_id");
      if (savedId) {
        setSavedWalletId(savedId);
        return savedId;
      }
    } catch (error) {
      console.error("Failed to load saved wallet ID:", error);
    }
    return null;
  };

  // Fetch NFT metadata for all assets
  const fetchNFTMetadata = async (assets: any[]) => {
    if (!assets || assets.length === 0) return [];

    setIsLoadingMetadata(true);
    try {
      // Use appropriate Blockfrost API key based on network
      const blockfrostKey =
        network === 0
          ? process.env.NEXT_PUBLIC_PREPROD_BLOCKFROST_API_KEY
          : process.env.NEXT_PUBLIC_MAINNET_BLOCKFROST_API_KEY;

      const provider = new BlockfrostProvider(blockfrostKey || "");

      const enhancedAssets = await Promise.all(
        assets.map(async (asset: any) => {
          try {
            const metadata = await provider.fetchAssetMetadata(asset.unit);

            let imageUrl = null;
            if (metadata?.image) {
              if (metadata.image.startsWith("ipfs://")) {
                // Handle ipfs://{hash} format
                const ipfsHash = metadata.image.replace("ipfs://", "");
                imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
              } else {
                imageUrl = metadata.image;
              }
            } else if (
              metadata?.files &&
              metadata.files.length > 0 &&
              metadata.files[0].src
            ) {
              const fileSrc = metadata.files[0].src;
              if (fileSrc.startsWith("ipfs://")) {
                // Handle ipfs://{hash} format
                const ipfsHash = fileSrc.replace("ipfs://", "");
                imageUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
              } else {
                imageUrl = fileSrc;
              }
            }

            return {
              ...asset,
              metadata: metadata,
              imageUrl: imageUrl,
            };
          } catch (metadataError) {
            console.error(
              `Failed to fetch metadata for ${asset.unit}:`,
              metadataError
            );
            return {
              ...asset,
              metadata: null,
              imageUrl: null,
            };
          }
        })
      );

      return enhancedAssets;
    } catch (error) {
      console.error("Failed to fetch NFT metadata:", error);
      return assets.map((asset) => ({
        ...asset,
        metadata: null,
        imageUrl: null,
      }));
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Load saved policies and ADA price on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      loadSavedPolicies();
      await fetchAdaPrice();

      // Try to auto-reconnect to saved wallet
      const savedWalletId = loadSavedWalletId();
      if (savedWalletId && wallets.length > 0) {
        const walletExists = wallets.find((w) => w.id === savedWalletId);
        if (walletExists) {
          console.log("Auto-reconnecting to saved wallet:", savedWalletId);
          connect(savedWalletId);
        } else {
          console.log("Saved wallet not found, clearing saved wallet ID");
          clearWalletId();
        }
      }
    };

    loadInitialData();
  }, [wallets]); // Add wallets as dependency

  // Fetch NFT metadata when assets change
  useEffect(() => {
    if (assets && assets.length > 0) {
      setIsLoadingAssets(false);
      fetchNFTMetadata(assets).then(setEnhancedAssets);
    } else if (assets && assets.length === 0) {
      setIsLoadingAssets(false);
      setEnhancedAssets([]);
    } else {
      setIsLoadingAssets(true);
      setEnhancedAssets([]);
    }
  }, [assets]);

  // Load minimized states from localStorage
  useEffect(() => {
    const loadMinimizedStates = () => {
      try {
        const galleryMinimized = localStorage.getItem("galleryMinimized");
        const collectionsMinimized = localStorage.getItem(
          "collectionsMinimized"
        );
        const metadataMinimized = localStorage.getItem("metadataMinimized");
        const credentialsMinimized = localStorage.getItem(
          "credentialsMinimized"
        );
        const mintingMinimized = localStorage.getItem("mintingMinimized");

        if (galleryMinimized !== null) {
          setIsGalleryMinimized(JSON.parse(galleryMinimized));
        }
        if (collectionsMinimized !== null) {
          setIsCollectionsMinimized(JSON.parse(collectionsMinimized));
        }
        if (metadataMinimized !== null) {
          setIsMetadataMinimized(JSON.parse(metadataMinimized));
        }
        if (credentialsMinimized !== null) {
          setIsCredentialsMinimized(JSON.parse(credentialsMinimized));
        }
        if (mintingMinimized !== null) {
          setIsMintingMinimized(JSON.parse(mintingMinimized));
        }
      } catch (error) {
        console.error("Error loading minimized states:", error);
      }
    };

    loadMinimizedStates();
  }, []);

  // Save minimized states to localStorage
  useEffect(() => {
    localStorage.setItem(
      "galleryMinimized",
      JSON.stringify(isGalleryMinimized)
    );
  }, [isGalleryMinimized]);

  useEffect(() => {
    localStorage.setItem(
      "collectionsMinimized",
      JSON.stringify(isCollectionsMinimized)
    );
  }, [isCollectionsMinimized]);

  useEffect(() => {
    localStorage.setItem(
      "metadataMinimized",
      JSON.stringify(isMetadataMinimized)
    );
  }, [isMetadataMinimized]);

  useEffect(() => {
    localStorage.setItem(
      "credentialsMinimized",
      JSON.stringify(isCredentialsMinimized)
    );
  }, [isCredentialsMinimized]);

  useEffect(() => {
    localStorage.setItem(
      "mintingMinimized",
      JSON.stringify(isMintingMinimized)
    );
  }, [isMintingMinimized]);

  useEffect(() => {
    localStorage.setItem("nftViewMode", nftViewMode);
  }, [nftViewMode]);

  useEffect(() => {
    localStorage.setItem("gallerySearch", gallerySearch);
  }, [gallerySearch]);

  useEffect(() => {
    localStorage.setItem("useTimeLock", JSON.stringify(useTimeLock));
  }, [useTimeLock]);

  useEffect(() => {
    localStorage.setItem("timeLockEpochs", timeLockEpochs.toString());
  }, [timeLockEpochs]);

  useEffect(() => {
    localStorage.setItem("mintMode", mintMode);
  }, [mintMode]);

  useEffect(() => {
    localStorage.setItem("metadataStandard", metadataStandard);
  }, [metadataStandard]);

  // Update metadata when selectedPolicy changes and we have saved policies
  useEffect(() => {
    if (selectedPolicy && savedPolicies.length > 0 && mintMode === "existing") {
      const policy = savedPolicies.find((p) => p.policyId === selectedPolicy);
      if (policy) {
        setCollectionName(policy.collectionName);
        updateMetadataWithCollectionName(policy.collectionName);
      }
    }
  }, [selectedPolicy, savedPolicies, mintMode]);

  // Update custom recipients array when metadata changes
  useEffect(() => {
    try {
      const parsedMetadata = JSON.parse(nftMetadata || "{}");
      const assetCount = Object.keys(parsedMetadata).length;
      if (assetCount > 0 && useCustomRecipients) {
        setCustomRecipients((prev) => {
          const newArray = new Array(assetCount).fill("");
          // Preserve existing values
          return newArray.map((_, index) => prev[index] || "");
        });
      }
    } catch (error) {
      // If metadata is invalid, keep current recipients
    }
  }, [nftMetadata, useCustomRecipients]);

  const handleMint = async () => {
    if (!connected || !wallet) {
      setMintResult({
        success: false,
        message: "Please connect your wallet first.",
      });
      return;
    }

    setIsMinting(true);
    setMintResult(null);

    try {
      // Parse the edited metadata
      let parsedMetadata;
      try {
        parsedMetadata = JSON.parse(nftMetadata);
      } catch (parseError) {
        setMintResult({
          success: false,
          message:
            "Invalid JSON in metadata editor. Please fix the syntax errors.",
        });
        return;
      }

      let result;
      const recipientsToUse = useCustomRecipients
        ? customRecipients
        : undefined;

      if (mintMode === "new") {
        result = await mintNFTs(
          wallet,
          collectionName,
          parsedMetadata,
          recipientsToUse,
          useTimeLock,
          timeLockEpochs,
          network
        );
      } else {
        if (!selectedPolicy) {
          setMintResult({
            success: false,
            message: "Please select an existing collection to add NFTs to.",
          });
          return;
        }
        result = await mintToExistingCollection(
          wallet,
          selectedPolicy,
          collectionName,
          parsedMetadata,
          recipientsToUse,
          timeLockEpochs,
          network
        );
      }

      setMintResult(result);

      // Set policy script for download if it's a new collection
      if (result.success && (result as any).policyScript) {
        setPolicyScript((result as any).policyScript);
      }

      // Refresh saved policies after successful mint
      if (result.success) {
        setSavedPolicies(getSavedPolicies());

        // If it's a new collection, switch to "Add to Existing" mode and select the new policy
        if (
          mintMode === "new" &&
          result.policyId &&
          (result as any).policyScript
        ) {
          setMintMode("existing");
          setSelectedPolicy(result.policyId);
          setCollectionName(
            (result as any).policyScript.collectionName || "Default Collection"
          );
        }
      }
    } catch (error) {
      setMintResult({
        success: false,
        message: "An unexpected error occurred",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const loadSavedPolicies = () => {
    // Filter policies by current network
    const policies = getSavedPoliciesForNetwork(network || 0);
    console.log(
      `Loading saved policies for network ${network || 0}:`,
      policies
    );
    // Filter out duplicate collections, keeping the first occurrence
    const uniquePolicies = policies.filter(
      (policy: any, index: number, self: any[]) =>
        self.findIndex((p) => p.collectionName === policy.collectionName) ===
        index
    );
    console.log("Unique policies after filtering:", uniquePolicies);
    setSavedPolicies(uniquePolicies);
  };

  const refreshAssets = async () => {
    const newAssets = await wallet?.getAssets();
    if (!newAssets) return;
    fetchNFTMetadata(newAssets as any[]).then((assets) =>
      setEnhancedAssets(assets)
    );
  };

  // Filter NFTs based on search term
  const getFilteredNFTs = () => {
    if (!enhancedAssets) return [];

    let filtered = enhancedAssets;

    // Filter by search term
    if (gallerySearch.trim()) {
      const searchTerm = gallerySearch.toLowerCase().trim();
      filtered = filtered.filter((asset: any) => {
        // Search in policyId
        if (asset.policyId?.toLowerCase().includes(searchTerm)) return true;

        // Search in unit
        if (asset.unit?.toLowerCase().includes(searchTerm)) return true;

        // Search in assetName
        if (asset.assetName?.toLowerCase().includes(searchTerm)) return true;

        // Search in fingerprint
        if (asset.fingerprint?.toLowerCase().includes(searchTerm)) return true;

        // Search in metadata properties
        if (asset.metadata) {
          const metadataStr = JSON.stringify(asset.metadata).toLowerCase();
          if (metadataStr.includes(searchTerm)) return true;
        }

        // Search in description
        if (asset.description?.toLowerCase().includes(searchTerm)) return true;

        return false;
      });
    }

    // Sort alphabetically by asset name
    return filtered.sort((a: any, b: any) => {
      const nameA = a.assetName || a.unit || "";
      const nameB = b.assetName || b.unit || "";
      return nameA.localeCompare(nameB);
    });
  };

  const handleBurnNFT = async (asset: any) => {
    if (!connected || !wallet) {
      setBurnResult({
        success: false,
        message: "Please connect your wallet first.",
      });
      return;
    }

    setIsBurning(true);
    setBurnResult(null);
    try {
      const result = await burnNFT(
        wallet,
        asset.policyId,
        asset.assetName,
        asset.quantity,
        network
      );
      setBurnResult(result);
    } catch (error) {
      setBurnResult({
        success: false,
        message: `Error burning NFT: ${error}`,
      });
    } finally {
      setIsBurning(false);
    }
  };

  const downloadPolicyScript = () => {
    if (!policyScript) return;

    const dataStr = JSON.stringify(policyScript, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `policy-script-${policyScript.policyId.slice(
      0,
      8
    )}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handlePolicyScriptUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const policyData = JSON.parse(content);

        // Validate the policy script structure
        if (
          !policyData.policyId ||
          !policyData.nativeScript ||
          !policyData.forgeScript
        ) {
          setUploadResult({
            success: false,
            message: "Invalid policy script file. Missing required fields.",
          });
          return;
        }

        // Get existing policies
        const existingPolicies = getSavedPolicies();

        // Check if policy already exists
        const existingIndex = existingPolicies.findIndex(
          (policy: any) => policy.policyId === policyData.policyId
        );

        if (existingIndex !== -1) {
          // Update existing policy
          existingPolicies[existingIndex] = {
            ...existingPolicies[existingIndex],
            ...policyData,
            createdAt: new Date().toISOString(),
          };
        } else {
          // Add new policy
          existingPolicies.push({
            ...policyData,
            createdAt: new Date().toISOString(),
          });
        }

        // Save to localStorage
        localStorage.setItem("nftPolicies", JSON.stringify(existingPolicies));

        // Refresh saved policies
        setSavedPolicies(getSavedPolicies());

        setUploadResult({
          success: true,
          message: `Policy script for "${
            policyData.collectionName || "Unknown Collection"
          }" has been ${
            existingIndex !== -1 ? "updated" : "added"
          } successfully!`,
        });

        // Reset file input
        event.target.value = "";
      } catch (error) {
        setUploadResult({
          success: false,
          message:
            "Invalid JSON file. Please upload a valid policy script file.",
        });
      }
    };

    reader.readAsText(file);
  };

  const handleDeletePolicy = (policyId: string) => {
    try {
      const existingPolicies = getSavedPolicies();
      const updatedPolicies = existingPolicies.filter(
        (policy: any) => policy.policyId !== policyId
      );

      localStorage.setItem("nftPolicies", JSON.stringify(updatedPolicies));
      setSavedPolicies(getSavedPolicies());
    } catch (error) {
      console.error("Error deleting policy:", error);
    }
  };

  const handleDownloadPolicy = (policy: any) => {
    const policyData = {
      policyId: policy.policyId,
      collectionName: policy.collectionName,
      nativeScript: policy.nativeScript,
      createdAt: policy.createdAt,
      txHash: policy.txHash,
    };

    const blob = new Blob([JSON.stringify(policyData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${policy.collectionName}_policy_script.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update metadata when collection name changes
  const updateMetadataWithCollectionName = (newCollectionName: string) => {
    let updatedMetadata;

    if (mintMode === "existing") {
      // Use existing collection metadata format
      updatedMetadata = getExistingCollectionMetadata(newCollectionName);
    } else {
      // Use new collection metadata format with selected standard
      updatedMetadata = getDefaultMetadata(
        newCollectionName,
        Date.now().toString(),
        metadataStandard
      );
    }

    setNftMetadata(JSON.stringify(updatedMetadata, null, 2));

    // Update custom recipients to match the number of assets in metadata
    const assetCount = Object.keys(updatedMetadata).length;
    setCustomRecipients((prev) => {
      const newArray = new Array(assetCount).fill("");
      // Preserve existing values
      return newArray.map((_, index) => prev[index] || "");
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ipfsHash = await uploadToIPFS(file);
      setUploadedImage(ipfsHash);
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image to IPFS");
    } finally {
      setIsUploading(false);
    }
  };

  // Initialize CIP-45 connection
  const initializeCIP45 = async () => {
    if (typeof window === "undefined") return;

    try {
      setIsConnectingCIP45(true);

      // Dynamic import to avoid SSR issues
      const { DAppPeerConnect } = await import(
        "@fabianbormann/cardano-peer-connect"
      );

      const dAppConnect = new DAppPeerConnect({
        dAppInfo: {
          name: "CNFT Maker",
          url: window.location.origin,
        },
        verifyConnection: (walletInfo: any, callback: any) => {
          console.log("Wallet connection request:", walletInfo);
          callback(true); // Auto-accept for now
        },
        onApiInject: (api: any) => {
          console.log("CIP-45 API injected:", api);
          setVeridianApi(api);
          setIsCIP45Connected(true);
          setIsConnectingCIP45(false);
        },
        onConnect: (address: string, walletInfo: any) => {
          console.log("CIP-45 connected", address, walletInfo);
          setIsCIP45Connected(true);
          setIsConnectingCIP45(false);
          // Clear timeout on successful connection
          if ((window as any).cip45Timeout) {
            clearTimeout((window as any).cip45Timeout);
            (window as any).cip45Timeout = null;
          }
        },
        onDisconnect: () => {
          console.log("CIP-45 disconnected");
          setIsCIP45Connected(false);
          setIsConnectingCIP45(false);
        },
      });

      // Generate QR code for wallet connection
      try {
        console.log("dAppConnect", dAppConnect);
        const meerkatIdValue = (dAppConnect as any).meerkat?.identifier;
        console.log("Meerkat ID:", meerkatIdValue);

        // Store the meerkat ID
        if (meerkatIdValue) {
          setMeerkatId(meerkatIdValue);
        }

        // Create a separate div for QR code
        const qrDiv = document.createElement("div");
        qrDiv.style.width = "200px";
        qrDiv.style.height = "200px";
        qrDiv.style.display = "flex";
        qrDiv.style.alignItems = "center";
        qrDiv.style.justifyContent = "center";

        // Generate QR code into the separate div
        await dAppConnect.generateQRCode(qrDiv);

        // Find container and append the QR div
        const container = document.getElementById("cip45-qr-container");
        if (container) {
          container.appendChild(qrDiv);
          setCip45QRCode("qr-generated");
          console.log("QR code generated successfully");
        } else {
          console.log("Container not found");
          setCip45QRCode("qr-placeholder");
        }

        // Set a timeout to prevent infinite pending state
        const timeoutId = setTimeout(() => {
          if (isConnectingCIP45) {
            console.log("Connection timeout - stopping pending state");
            setIsConnectingCIP45(false);
            alert(
              "Connection timeout. Please try scanning the QR code again with Veridian wallet."
            );
          }
        }, 30000); // 30 second timeout

        // Store timeout ID for cleanup
        (window as any).cip45Timeout = timeoutId;
      } catch (qrError) {
        console.log("QR error:", qrError);
        console.log("QR generation not available, using placeholder");
        setCip45QRCode("qr-placeholder");
      }
    } catch (error) {
      console.error("Failed to initialize CIP-45:", error);
      setIsConnectingCIP45(false);
    }
  };

  // Sign credential request
  const signCredentialRequest = async () => {
    if (!veridianApi || !veridianApi.experimental?.signWithCredential) {
      console.error("CIP-45 API not available");
      return;
    }

    try {
      setIsValidatingSignature(true);

      const signRequest = await veridianApi.experimental.signWithCredential({
        assetId: credentialRequest.assetId,
        credentialType: credentialRequest.credentialType,
        message: `Mint NFT for verified developer - ${credentialRequest.assetId}`,
      });

      console.log("Credential signature response:", signRequest);

      // Process the signature response
      const credentialData = {
        assetId: credentialRequest.assetId,
        credentialType: credentialRequest.credentialType,
        credentials: {
          credentialId: signRequest.identifier || "cred_" + Date.now(),
          issuer: {
            name: "Veridian Wallet",
            url: "https://veridian.io",
          },
          signature: signRequest.signature,
          credential: signRequest.credential, // ACDC credential
          identifier: signRequest.identifier, // KERI identifier
          connections: [], // Will be populated from credential data
        },
        validation: {
          isValid: true,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };

      setCredentialResponse(credentialData);
      setCredentialSignature(signRequest.signature);
    } catch (error) {
      console.error("Failed to sign credential request:", error);
      alert("Failed to sign credential request. Please try again.");
    } finally {
      setIsValidatingSignature(false);
    }
  };

  // Parse Veridian signature to get credential details (for validation)
  const parseVeridianSignature = async (signature: string) => {
    setIsValidatingSignature(true);
    try {
      // This would be your actual API call to parse the signature
      // For now, we'll simulate the response structure
      const response = await fetch("/api/parseVeridianSignature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ signature }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse signature");
      }

      const data = await response.json();
      setCredentialResponse(data);
      return data;
    } catch (error) {
      console.error("Failed to parse Veridian signature:", error);
      // For demo purposes, return mock data
      const mockResponse = {
        assetId: credentialRequest.assetId,
        credentialType: credentialRequest.credentialType,
        credentials: {
          credentialId: "cred_" + Date.now(),
          issuer: {
            name: "Veridian Wallet",
            url: "https://veridian.io",
          },
          signature: signature,
          connections: [
            {
              name: "GitHub",
              url: "https://github.com/user",
              id: "github_user_123",
              timestamp: new Date().toISOString(),
              linked_identifier: "github_user_123",
            },
          ],
        },
        validation: {
          isValid: true,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      };
      setCredentialResponse(mockResponse);
      return mockResponse;
    } finally {
      setIsValidatingSignature(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Wallet & Collection */}
      <div className="space-y-6">
        {/* Wallet Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 -mt-4">
            {!connected ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your browser wallet to mint NFTs
                </p>
                <Separator className="my-4" />
                {wallets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {wallets.map((wallet) => (
                      <Button
                        key={wallet.name}
                        onClick={() => {
                          connect(wallet.id);
                          saveWalletId(wallet.id);
                        }}
                        disabled={connecting}
                        variant="outline"
                        className="justify-start h-auto p-4"
                      >
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-6 h-6 mr-3"
                        />
                        <div className="text-left">
                          <div className="font-medium">{wallet.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {wallet.version}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    ...
                  </p>
                )}
                {connecting && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Connecting...
                    </span>
                  </div>
                )}
                {!!error && (
                  <Alert className="border-red-500">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(error as any)?.message || "Connection failed"}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        wallets.find(
                          (w) => w.id?.toLowerCase() === name?.toLowerCase()
                        )?.icon
                      }
                      alt={name || "Wallet"}
                      className="w-6 h-6 rounded-full border border-border "
                    />
                    <span className="font-medium">{name}</span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Connected
                    </Badge>
                  </div>
                  <Button
                    onClick={() => {
                      disconnect();
                      clearWalletId();
                    }}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Power className="h-4 w-4" /> Disconnect
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Network
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {network === 0 ? "Preprod" : "Mainnet"}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        ADA Balance
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Coins className="h-4 w-4" />
                        <div className="flex flex-col sm:flex-row gap-2 gap-y-0">
                          <span className="font-mono text-sm">
                            {lovelace
                              ? (parseInt(lovelace) / 1000000).toFixed(2)
                              : "0.00"}
                          </span>
                          {adaPrice > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ($
                              {(
                                (parseInt(lovelace || "0") / 1000000) *
                                adaPrice
                              ).toFixed(2)}
                              )
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Address
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <code className="text-xs flex-1 truncate">
                      {address ? address : "Not available"}
                    </code>
                    {address && <CopyButton text={address} />}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {connected && (
          <Card className="pb-0">
            <CardHeader className="gap-1">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  NFT Gallery{" "}
                  {enhancedAssets &&
                    enhancedAssets.length > 0 &&
                    `(${getFilteredNFTs().length})`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 border rounded-md">
                    <Button
                      variant={nftViewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setNftViewMode("grid")}
                      className="h-8 w-8 p-0 rounded-none rounded-l-md"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={nftViewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setNftViewMode("list")}
                      className="h-8 w-8 p-0 rounded-none rounded-r-md"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      refreshAssets();
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGalleryMinimized(!isGalleryMinimized)}
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    {isGalleryMinimized ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {!isGalleryMinimized ? (
              <>
                <CardContent>
                  <Separator className="mb-6" />
                  {isLoadingAssets || isLoadingMetadata ? (
                    <div className="flex items-center justify-center py-8 mb-6">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">
                        {isLoadingAssets
                          ? "Loading assets..."
                          : "Loading NFT metadata..."}
                      </span>
                    </div>
                  ) : enhancedAssets && enhancedAssets.length > 0 ? (
                    <div className="space-y-4">
                      {/* Search Controls */}
                      <div className="flex items-center gap-4 flex-col md:flex-row md:justify-start">
                        {/* Search Bar */}
                        <div className="flex-1 relative w-full">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by policyId, assetName, metadata..."
                            value={gallerySearch}
                            onChange={(e) => setGallerySearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <Separator className="mt-6" />

                      {/* NFT Grid/List */}
                      {nftViewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 [@media(min-width:1540px)]:grid-cols-3 gap-4 items-stretch overflow-y-auto pt-6 -mt-4 max-h-[800px] pb-6">
                          {getFilteredNFTs().map(
                            (asset: any, index: number) => (
                              <NFTCard
                                key={index}
                                nft={asset}
                                onCardClick={(nft) => {
                                  setSelectedNft(nft);
                                  setNftDetailsDialogOpen(true);
                                  console.log(nft);
                                }}
                                hasPolicyScript={hasPolicyScriptForNetwork}
                                network={network || 0}
                                burnDialogOpen={burnDialogOpen}
                                setBurnDialogOpen={setBurnDialogOpen}
                                selectedAsset={selectedAsset}
                                setSelectedAsset={setSelectedAsset}
                                burnResult={burnResult}
                                isBurning={isBurning}
                                handleBurnNFT={handleBurnNFT}
                                setBurnResult={setBurnResult}
                                setIsBurning={setIsBurning}
                                walletInfo={{
                                  assets: enhancedAssets,
                                  networkId: network,
                                }}
                              />
                            )
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 overflow-y-auto pt-6 -mt-4 max-h-[700px] pb-6">
                          {getFilteredNFTs().map(
                            (asset: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedNft(asset);
                                  setNftDetailsDialogOpen(true);
                                }}
                              >
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {asset.imageUrl ? (
                                    <img
                                      src={asset.imageUrl}
                                      alt={
                                        asset.metadata?.name || asset.assetName
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Image className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">
                                    {asset.metadata?.name || asset.assetName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {asset.metadata?.description ||
                                      "No description"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {asset.metadata?.collection ||
                                        "Unknown Collection"}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {asset.policyId.slice(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasPolicyScriptForNetwork(
                                    asset.policyId,
                                    network || 0
                                  ) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setSelectedAsset(asset);
                                        setBurnDialogOpen(true);
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Flame className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      disabled
                                      className="text-muted-foreground"
                                    >
                                      Cannot Burn
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                          <BurnDialog
                            isOpen={burnDialogOpen && selectedAsset?.assetName}
                            onOpenChange={(open) => {
                              setBurnDialogOpen(open);
                              if (!open) {
                                setSelectedAsset(null);
                                setBurnResult(null);
                                setIsBurning(false);
                              }
                            }}
                            selectedAsset={selectedAsset}
                            burnResult={burnResult}
                            isBurning={isBurning}
                            onBurn={handleBurnNFT}
                            onClose={() => {
                              setBurnDialogOpen(false);
                              setSelectedAsset(null);
                              setBurnResult(null);
                              setIsBurning(false);
                            }}
                            walletInfo={{
                              assets: enhancedAssets,
                              networkId: network,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No NFTs found in your wallet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Mint some NFTs to see them here!
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <div></div>
            )}
          </Card>
        )}
      </div>

      {/* Right Column - Minting */}
      <div className="space-y-6">
        {/* Minting Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Mint NFTs
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMintingMinimized(!isMintingMinimized)}
                className="h-8 w-8 p-0 rounded-full"
              >
                {isMintingMinimized ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!isMintingMinimized && (
              <div className="flex items-center justify-between w-full gap-2 flex-wrap mt-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="mint-mode">Mint Mode:</Label>
                  <Select
                    value={mintMode}
                    onValueChange={(value: "new" | "existing") => {
                      setMintMode(value);
                      if (value === "existing") {
                        loadSavedPolicies();
                        if (selectedPolicy && savedPolicies.length > 0) {
                          const policy = savedPolicies.find(
                            (p) => p.policyId === selectedPolicy
                          );
                          if (policy) {
                            setCollectionName(policy.collectionName);
                          }
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mint mode..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Collection</SelectItem>
                      <SelectItem value="existing">Add to Existing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {mintMode === "new" && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metadata-standard">
                      Metadata Standard:
                    </Label>
                    <Select
                      value={metadataStandard}
                      onValueChange={(value: MetadataStandard) => {
                        setMetadataStandard(value);
                        // Update metadata when standard changes - use the new value directly
                        const collection = collectionName;
                        const updatedMetadata = getDefaultMetadata(
                          collection,
                          Date.now().toString(),
                          value // Use the new standard value
                        );
                        setNftMetadata(
                          JSON.stringify(updatedMetadata, null, 2)
                        );

                        // Update custom recipients to match the number of assets
                        const assetCount = Object.keys(updatedMetadata).length;
                        setCustomRecipients((prev) => {
                          const newArray = new Array(assetCount).fill("");
                          return newArray.map((_, index) => prev[index] || "");
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select standard..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={METADATA_STANDARDS.BASIC}>
                          Basic
                        </SelectItem>
                        <SelectItem
                          value={METADATA_STANDARDS.DEVELOPER_IDENTITY}
                        >
                          Developer Identity
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          {!isMintingMinimized && (
            <CardContent className="space-y-4 -mt-4">
              <Separator />
              {connected ? (
                <>
                  {mintMode === "existing" && (
                    <div className="space-y-2">
                      <Label htmlFor="existing-collection">
                        Select Collection
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedPolicy}
                          onValueChange={(value) => {
                            setSelectedPolicy(value);
                            // Update collection name when policy changes
                            if (value) {
                              const policy = savedPolicies.find(
                                (p) => p.policyId === value
                              );
                              if (policy) {
                                setCollectionName(policy.collectionName);
                                // Update metadata with the selected collection name
                                updateMetadataWithCollectionName(
                                  policy.collectionName
                                );
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Choose a policy script..." />
                          </SelectTrigger>
                          <SelectContent>
                            {savedPolicies.map((policy: any, index: number) => (
                              <SelectItem key={index} value={policy.policyId}>
                                {policy.collectionName} (
                                {policy.policyId.slice(0, 8)}
                                ...)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={loadSavedPolicies}
                          variant="outline"
                          size="sm"
                        >
                          Refresh
                        </Button>
                      </div>
                      {savedPolicies.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No saved policy scripts found.{" "}
                          <span
                            className="text-primary cursor-pointer underline"
                            onClick={() => setUploadDialogOpen(true)}
                          >
                            Upload
                          </span>{" "}
                          a policy script first.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="collection-name">
                      Collection Name{" "}
                      {mintMode === "new" ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-muted-foreground">
                          not required
                        </span>
                      )}
                    </Label>
                    <Input
                      id="collection-name"
                      value={collectionName}
                      onChange={(e) => {
                        setCollectionName(e.target.value);
                        // Update metadata with new collection name
                        if (mintMode === "new") {
                          updateMetadataWithCollectionName(e.target.value);
                        }
                      }}
                      placeholder="Enter collection name..."
                      className="w-full"
                      disabled={mintMode === "existing"}
                    />
                    {mintMode === "existing" ? (
                      <p className="text-xs text-muted-foreground">
                        Collection name is determined by the selected existing
                        collection
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Collection name is required to create a new collection
                      </p>
                    )}
                  </div>

                  {/* Time Lock Option - only for new collections */}
                  {mintMode === "new" && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="use-time-lock"
                          checked={useTimeLock}
                          onChange={(e) => setUseTimeLock(e.target.checked)}
                          className="rounded"
                        />
                        <Label htmlFor="use-time-lock">Use Time Lock</Label>
                      </div>
                      {!useTimeLock && (
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                            ⚠️ Policy ID Warning
                          </p>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                            Without time lock, this collection will share the
                            same policy ID as other non-time-locked collections
                            from your wallet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Time Lock Settings - only for new collections */}
                  {mintMode === "new" && useTimeLock && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Time Lock Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="time-lock-epochs">
                            Duration (Epochs)
                          </Label>
                          <div className="flex items-center gap-2">
                            <Slider
                              id="time-lock-epochs"
                              min={1}
                              max={1000}
                              value={[timeLockEpochs]}
                              onValueChange={(value) =>
                                setTimeLockEpochs(value[0])
                              }
                              className="flex-1"
                            />
                            <span className="text-sm font-mono w-12 text-right">
                              {timeLockEpochs}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1 epoch (~5 days)</span>
                            <span>1000 epochs (~13.7 years)</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Time-locked collections expire after {timeLockEpochs}{" "}
                          epochs (~{Math.round(timeLockEpochs * 5)} days). You
                          won't be able to add more NFTs after expiration.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recipients Section */}
                  <div className="space-y-2 hidden">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="use-custom-recipients"
                        checked={useCustomRecipients}
                        onChange={(e) => {
                          setUseCustomRecipients(e.target.checked);
                          // Initialize recipients array when enabling custom recipients
                          if (
                            e.target.checked &&
                            customRecipients.length === 0
                          ) {
                            setCustomRecipients(["", "", ""]);
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor="use-custom-recipients">
                        Use custom recipient addresses
                      </Label>
                    </div>

                    {useCustomRecipients && (
                      <div className="space-y-2">
                        <Label>Recipient Addresses</Label>
                        <div className="space-y-2">
                          {customRecipients.map((address, index) => (
                            <Input
                              key={index}
                              value={address}
                              onChange={(e) => {
                                const newRecipients = [...customRecipients];
                                newRecipients[index] = e.target.value;
                                setCustomRecipients(newRecipients);
                              }}
                              placeholder={`Recipient ${
                                index + 1
                              } address (optional)`}
                              className="w-full font-mono text-sm"
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter recipient addresses for your NFTs. Leave empty
                          to use your wallet address for that NFT.
                        </p>
                      </div>
                    )}

                    {!useCustomRecipients && (
                      <p className="text-sm text-muted-foreground">
                        All NFTs will be sent to your wallet address.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* NFT Metadata Editor */}

                  <p className="text-muted-foreground">
                    {mintMode === "new"
                      ? `Create a new collection with NFTs based on your metadata JSON using the ${
                          metadataStandard === METADATA_STANDARDS.BASIC
                            ? "Basic"
                            : "Developer Identity"
                        } standard.`
                      : "Add NFTs to the selected existing collection based on your metadata JSON."}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="metadata-editor">
                          NFT Metadata (JSON)
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            updateMetadataWithCollectionName(collectionName)
                          }
                          variant="outline"
                          size="sm"
                        >
                          Reset to Default
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setIsMetadataMinimized(!isMetadataMinimized)
                          }
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          {isMetadataMinimized ? (
                            <Plus className="h-4 w-4" />
                          ) : (
                            <Minus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {!isMetadataMinimized && (
                      <>
                        <div className="border rounded-md overflow-hidden">
                          <Editor
                            height="300px"
                            defaultLanguage="json"
                            value={nftMetadata}
                            onChange={(value) => {
                              setNftMetadata(value || "");
                              // Update custom recipients array size based on metadata
                              try {
                                const parsedMetadata = JSON.parse(
                                  value || "{}"
                                );
                                const assetCount =
                                  Object.keys(parsedMetadata).length;
                                if (assetCount > 0) {
                                  setCustomRecipients((prev) => {
                                    const newArray = new Array(assetCount).fill(
                                      ""
                                    );
                                    // Preserve existing values
                                    return newArray.map(
                                      (_, index) => prev[index] || ""
                                    );
                                  });
                                }
                              } catch (error) {
                                // If metadata is invalid, keep current recipients
                              }
                            }}
                            options={{
                              minimap: { enabled: false },
                              scrollBeyondLastLine: false,
                              fontSize: 14,
                              lineNumbers: "on",
                              wordWrap: "on",
                              automaticLayout: true,
                            }}
                            theme="vs-dark"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Edit the JSON metadata for your NFTs. Make sure the
                          JSON is valid before minting. Click "Reset to Default"
                          to update with current collection name.
                        </p>
                      </>
                    )}
                  </div>

                  <Button
                    onClick={handleMint}
                    disabled={
                      isMinting ||
                      !connected ||
                      (mintMode === "new" && !collectionName.trim()) ||
                      (mintMode === "existing" && !selectedPolicy)
                    }
                    className="w-full"
                    size="lg"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {mintMode === "new"
                          ? "Creating Collection..."
                          : "Adding to Collection..."}
                      </>
                    ) : mintMode === "new" ? (
                      "Create Collection"
                    ) : (
                      "Add to Collection"
                    )}
                  </Button>

                  {/* Result Alert */}
                  {mintResult && (
                    <Alert
                      className={
                        mintResult.success
                          ? "border-green-500"
                          : "border-red-500"
                      }
                    >
                      <AlertDescription>
                        <div className="space-y-2">
                          <p>{mintResult.message}</p>
                          {mintResult.txHash && (
                            <div className="text-sm flex items-center gap-2">
                              <strong className="w-fit">TxHash:</strong>
                              <div className="flex items-center gap-2 flex-1">
                                <a
                                  href={`https://${
                                    network === 0 ? "preprod." : ""
                                  }cardanoscan.io/transaction/${
                                    mintResult.txHash
                                  }`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-muted px-2 py-1 rounded text-xs hover:bg-muted/80 transition-colors inline-block flex-1"
                                  title={mintResult.txHash}
                                >
                                  {mintResult.txHash.slice(0, 8)}...
                                  {mintResult.txHash.slice(-8)}
                                </a>
                                <CopyButton text={mintResult.txHash} />
                              </div>
                            </div>
                          )}

                          {/* Policy Script Download Section */}
                          {mintResult.success && policyScript && (
                            <div className="mt-4 p-3 bg-muted border rounded-md">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-foreground">
                                  🔑 Policy Script Generated
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Download your policy script to burn NFTs from
                                  this collection later. Keep this file safe -
                                  you'll need it to burn NFTs!
                                </p>
                                <Button
                                  onClick={downloadPolicyScript}
                                  size="sm"
                                  variant="outline"
                                  className="text-foreground border-border hover:bg-muted"
                                >
                                  Download Policy Script
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Connect your wallet to proceed
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please connect a browser wallet to mint NFTs
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>

        {/* Add Credentials Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Add Credentials
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setIsCredentialsMinimized(!isCredentialsMinimized)
                }
                className="h-8 w-8 p-0 rounded-full"
              >
                {isCredentialsMinimized ? (
                  <Plus className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {!isCredentialsMinimized && (
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Sign credentials for your NFTs using cardano-connector CIP-45
                  standard
                </p>

                {/* QR Code for CIP-45 Connection */}
                <div className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-lg flex items-center justify-center relative">
                      {/* QR Code Container - Always visible */}
                      <div
                        id="cip45-qr-container"
                        className="flex w-full items-center justify-center"
                      >
                        {/* Fallback QR Icon - Shows when no QR code is generated */}
                        {cip45QRCode !== "qr-generated" && (
                          <QrCode className="h-24 w-24 text-muted-foreground/50" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {cip45QRCode === "qr-generated"
                          ? "Scan with Veridian Wallet"
                          : "Click 'Connect Wallet' to generate QR code"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use CIP-45 to connect and enable credential signing
                      </p>

                      {/* Meerkat ID Display */}
                      {meerkatId && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            Peer ID
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                            <code className="text-xs flex-1 truncate font-mono">
                              {meerkatId}
                            </code>
                            <CopyButton text={meerkatId} />
                          </div>
                        </div>
                      )}

                      {isConnectingCIP45 && (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs text-muted-foreground">
                            Connecting...
                          </span>
                        </div>
                      )}
                      {isCIP45Connected && (
                        <Badge variant="default" className="text-green-600">
                          Connected
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection Button */}
                {!isCIP45Connected && (
                  <Button
                    onClick={initializeCIP45}
                    disabled={isConnectingCIP45}
                    variant="outline"
                    className="w-full"
                  >
                    {isConnectingCIP45 ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                )}

                {/* Credential Request Section */}
                <div className="space-y-2">
                  <Label htmlFor="credential-request">
                    Credential Request (JSON)
                  </Label>
                  <div className="border rounded-md overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      value={JSON.stringify(credentialRequest, null, 2)}
                      onChange={(value) => {
                        try {
                          const parsed = JSON.parse(value || "{}");
                          setCredentialRequest(parsed);
                        } catch (error) {
                          // Invalid JSON, keep current value
                        }
                      }}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineNumbers: "on",
                        wordWrap: "on",
                        automaticLayout: true,
                        readOnly: false,
                      }}
                      theme="vs-dark"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This JSON payload requests the wallet to present credentials
                    for the specified NFT asset
                  </p>
                </div>

                {/* Sign Message Button */}
                <Button
                  className="w-full"
                  onClick={signCredentialRequest}
                  disabled={!isCIP45Connected || isValidatingSignature}
                  variant={isCIP45Connected ? "default" : "outline"}
                >
                  {isValidatingSignature ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing...
                    </>
                  ) : isCIP45Connected ? (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Sign Message
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Connect Wallet First
                    </>
                  )}
                </Button>

                {/* Credential Response Display */}
                {credentialResponse && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="credential-response">
                        Credential Response (JSON)
                      </Label>
                      <div className="flex items-center gap-2">
                        <CopyButton
                          text={JSON.stringify(credentialResponse, null, 2)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            parseVeridianSignature(
                              credentialResponse.credentials?.signature || ""
                            )
                          }
                          disabled={isValidatingSignature}
                        >
                          {isValidatingSignature ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Validating...
                            </>
                          ) : (
                            "Re-validate"
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="border rounded-md overflow-hidden">
                      <Editor
                        height="250px"
                        defaultLanguage="json"
                        value={JSON.stringify(credentialResponse, null, 2)}
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 12,
                          lineNumbers: "on",
                          wordWrap: "on",
                          automaticLayout: true,
                          readOnly: true,
                        }}
                        theme="vs-dark"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        Copy this JSON and replace the "credentials" value in
                        your NFT metadata
                      </span>
                    </div>
                    {credentialResponse.validation && (
                      <div className="flex items-center gap-2 text-xs">
                        <Badge
                          variant={
                            credentialResponse.validation.isValid
                              ? "default"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {credentialResponse.validation.isValid
                            ? "Valid"
                            : "Invalid"}
                        </Badge>
                        <span className="text-muted-foreground">
                          Expires:{" "}
                          {new Date(
                            credentialResponse.validation.expiresAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  Credential signing functionality coming soon
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Image Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Upload to IPFS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Upload an image to IPFS to get the IPFS hash.
              </p>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Uploading to IPFS...
                </span>
              </div>
            )}

            {uploadedImage && (
              <div className="space-y-2">
                <Label>IPFS Hash:</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={uploadedImage}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <CopyButton text={uploadedImage} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy this IPFS hash and use it in your NFT metadata JSON
                  above.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Collections Card */}
        {connected && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  Policy Scripts
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setIsCollectionsMinimized(!isCollectionsMinimized)
                  }
                  className="h-8 w-8 p-0 rounded-full"
                >
                  {isCollectionsMinimized ? (
                    <Plus className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {!isCollectionsMinimized && (
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap items-center justify-center md:justify-start">
                  <Button
                    onClick={loadSavedPolicies}
                    variant="outline"
                    size="sm"
                  >
                    Load Policy Scripts
                  </Button>
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    Upload Policy Script
                  </Button>
                  <span className="text-sm text-muted-foreground text-center">
                    {savedPolicies.length} collection(s) saved
                  </span>
                </div>

                {savedPolicies.length > 0 && (
                  <div className="space-y-2">
                    {savedPolicies.map((policy: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate max-w-[200px]">
                                  {policy.collectionName}
                                </h3>
                                <Badge variant="outline">
                                  {policy.network === 0 ? "Preprod" : "Mainnet"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadPolicy(policy)}
                                  className="h-8 w-8 p-0"
                                  title="Download policy script"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeletePolicy(policy.policyId)
                                  }
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Delete policy script"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground truncate">
                                <strong>Policy ID:</strong> {policy.policyId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                <strong>Tx Hash:</strong>{" "}
                                {policy.txHash.slice(0, 8)}...
                                {policy.txHash.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {savedPolicies.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    no policy scripts found
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Policy Script Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Policy Script</DialogTitle>
              <DialogDescription>
                Upload a .json file with information needed to mint/burn NFTs
                with a specific policy id.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="policy-script-upload">Policy Script File</Label>
                <Input
                  id="policy-script-upload"
                  type="file"
                  accept=".json"
                  onChange={handlePolicyScriptUpload}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Select a policy script JSON file that was previously
                  downloaded.
                </p>
              </div>

              {uploadResult && (
                <Alert
                  className={
                    uploadResult.success ? "border-green-500" : "border-red-500"
                  }
                >
                  {uploadResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{uploadResult.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadResult(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NFT Details Dialog */}
        <NFTDetailsDialog
          isOpen={nftDetailsDialogOpen}
          onOpenChange={setNftDetailsDialogOpen}
          selectedNft={selectedNft}
          onClose={() => {
            setNftDetailsDialogOpen(false);
            setSelectedNft(null);
          }}
          hasPolicyScript={hasPolicyScriptForNetwork}
          network={network || 0}
          burnDialogOpen={burnDialogOpen}
          setBurnDialogOpen={setBurnDialogOpen}
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          burnResult={burnResult}
          isBurning={isBurning}
          handleBurnNFT={handleBurnNFT}
          setBurnResult={setBurnResult}
          setIsBurning={setIsBurning}
          walletInfo={{ assets: enhancedAssets, networkId: network }}
        />
      </div>
    </div>
  );
}
