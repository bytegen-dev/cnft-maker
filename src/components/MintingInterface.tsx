"use client";

import { useState, useEffect } from "react";
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
  X,
} from "lucide-react";
import {
  mintNFTs,
  getWalletInfo,
  getSavedPolicies,
  mintToExistingCollection,
  burnNFT,
  hasPolicyScript,
} from "@/lib/minting";
import {
  getDefaultMetadata,
  getExistingCollectionMetadata,
} from "@/lib/metadata";
import { uploadToIPFS } from "@/lib/pinata";
import Editor from "@monaco-editor/react";
import { NFTCard } from "./NFTCard";
import { NFTDetailsDialog } from "./NFTDetailsDialog";
import { CopyButton } from "@/components/ui/copy-button";

export default function MintingInterface() {
  const [isMinting, setIsMinting] = useState(false);
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    txHash?: string;
    message: string;
  } | null>(null);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: any[];
    networkId: number;
    lovelace: string;
    assets: any[];
    networkName: string;
  } | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [collectionName, setCollectionName] = useState("");
  const [nftMetadata, setNftMetadata] = useState(
    JSON.stringify(
      getDefaultMetadata(collectionName, Date.now().toString()),
      null,
      2
    )
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [savedPolicies, setSavedPolicies] = useState<any[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [mintMode, setMintMode] = useState<"new" | "existing">("new");
  const [customRecipients, setCustomRecipients] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [useCustomRecipients, setUseCustomRecipients] = useState(false);
  const [useTimeLock, setUseTimeLock] = useState(true);
  const [timeLockEpochs, setTimeLockEpochs] = useState(10);
  const [walletError, setWalletError] = useState<string | null>(null);
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
  const [isCollectionsMinimized, setIsCollectionsMinimized] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [nftDetailsDialogOpen, setNftDetailsDialogOpen] = useState(false);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [gallerySearch, setGallerySearch] = useState<string>("");
  const [isMetadataMinimized, setIsMetadataMinimized] = useState(false);
  const [adaPrice, setAdaPrice] = useState<number>(0);

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

  // Load wallet info and saved policies on component mount
  useEffect(() => {
    const loadWalletInfo = async () => {
      setIsLoadingWallet(true);
      setWalletError(null);
      try {
        const info = await getWalletInfo();
        setWalletInfo(info);
      } catch (error) {
        console.error("Failed to load wallet info:", error);
        setWalletError(
          "Failed to load wallet info. Please check your environment variables."
        );
      } finally {
        setIsLoadingWallet(false);
      }
    };

    const loadInitialData = async () => {
      await loadWalletInfo();
      loadSavedPolicies();
      await fetchAdaPrice();
    };

    loadInitialData();
  }, []);

  // Load minimized states from localStorage
  useEffect(() => {
    const loadMinimizedStates = () => {
      try {
        const galleryMinimized = localStorage.getItem("galleryMinimized");
        const collectionsMinimized = localStorage.getItem(
          "collectionsMinimized"
        );
        const metadataMinimized = localStorage.getItem("metadataMinimized");

        if (galleryMinimized !== null) {
          setIsGalleryMinimized(JSON.parse(galleryMinimized));
        }
        if (collectionsMinimized !== null) {
          setIsCollectionsMinimized(JSON.parse(collectionsMinimized));
        }
        if (metadataMinimized !== null) {
          setIsMetadataMinimized(JSON.parse(metadataMinimized));
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
          collectionName,
          parsedMetadata,
          recipientsToUse,
          useTimeLock,
          timeLockEpochs
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
          selectedPolicy,
          collectionName,
          parsedMetadata,
          recipientsToUse,
          timeLockEpochs
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

  const handleGetWalletInfo = async () => {
    setIsLoadingWallet(true);
    setWalletError(null);
    try {
      const info = await getWalletInfo();
      setWalletInfo(info);
    } catch (error) {
      console.error("Failed to get wallet info:", error);
      setWalletError(
        "Failed to load wallet info. Please check your environment variables."
      );
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const loadSavedPolicies = () => {
    const policies = getSavedPolicies();
    console.log("Loading saved policies:", policies);
    // Filter out duplicate collections, keeping the first occurrence
    const uniquePolicies = policies.filter(
      (policy: any, index: number, self: any[]) =>
        self.findIndex((p) => p.collectionName === policy.collectionName) ===
        index
    );
    console.log("Unique policies after filtering:", uniquePolicies);
    setSavedPolicies(uniquePolicies);
  };

  // Get unique collections from wallet assets
  const getUniqueCollections = () => {
    if (!walletInfo?.assets) return [];
    const collections = new Set<string>();
    walletInfo.assets.forEach((asset: any) => {
      if (asset.metadata?.collection) {
        collections.add(asset.metadata.collection);
      }
    });
    return Array.from(collections).sort();
  };

  // Filter NFTs based on selected collection and search term
  const getFilteredNFTs = () => {
    if (!walletInfo?.assets) return [];

    let filtered = walletInfo.assets;

    // Filter by collection
    if (galleryFilter !== "all") {
      filtered = filtered.filter(
        (asset: any) => asset.metadata?.collection === galleryFilter
      );
    }

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
    setIsBurning(true);
    setBurnResult(null);
    try {
      const result = await burnNFT(
        asset.policyId,
        asset.assetName,
        asset.quantity
      );
      setBurnResult(result);

      if (result.success) {
        // Refresh wallet info after successful burn
        handleGetWalletInfo();
      }
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
      // Use new collection metadata format
      updatedMetadata = getDefaultMetadata(
        newCollectionName,
        Date.now().toString()
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Wallet & Collection */}
      <div className="space-y-6">
        {/* Wallet Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet
              </div>
              <Button
                onClick={handleGetWalletInfo}
                disabled={isLoadingWallet}
                variant="outline"
              >
                {isLoadingWallet ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Refresh Wallet
                    <RefreshCw className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingWallet && !walletInfo && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-muted-foreground">
                  Loading wallet info...
                </span>
              </div>
            )}

            {walletError && (
              <Alert className="border-red-500">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{walletError}</AlertDescription>
              </Alert>
            )}

            {walletInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        Network
                      </p>
                      <Badge variant="outline" className="mt-1">
                        {walletInfo.networkName}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        ADA Balance
                      </p>
                      <p className="font-mono text-sm font-bold">
                        {(parseInt(walletInfo.lovelace) / 1000000).toFixed(6)}{" "}
                        ADA{" "}
                        {adaPrice > 0 && (
                          <span className="text-muted-foreground">
                            ($
                            {(
                              adaPrice *
                              (parseInt(walletInfo.lovelace) / 1000000)
                            ).toFixed(2)}
                            )
                          </span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="gap-1">
                  <CardHeader>
                    <CardTitle className="text-sm">Wallet Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs bg-muted p-2 rounded-lg border flex-1 truncate">
                        {walletInfo.address}
                      </p>
                      <CopyButton text={walletInfo.address} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="gap-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">
                        NFT Gallery{" "}
                        {walletInfo.assets &&
                          walletInfo.assets.length > 0 &&
                          `(${getFilteredNFTs().length}${
                            galleryFilter !== "all"
                              ? ` of ${walletInfo.assets.length}`
                              : ""
                          })`}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsGalleryMinimized(!isGalleryMinimized)
                        }
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        {isGalleryMinimized ? (
                          <Plus className="h-4 w-4" />
                        ) : (
                          <Minus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {!isGalleryMinimized && (
                    <>
                      <CardContent>
                        <Separator className="mb-6" />
                        {walletInfo.assets && walletInfo.assets.length > 0 ? (
                          <div className="space-y-4">
                            {/* Search and Filter Controls */}
                            <div className="flex items-center gap-4 flex-col md:flex-row md:justify-between">
                              {/* Search Bar */}
                              <div className="flex-1 relative w-full md:max-w-[250px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search by policyId, assetName, metadata..."
                                  value={gallerySearch}
                                  onChange={(e) =>
                                    setGallerySearch(e.target.value)
                                  }
                                  className="pl-10"
                                />
                              </div>

                              {/* Collection Filter */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Label
                                    htmlFor="collection-filter"
                                    className="text-sm font-medium whitespace-nowrap"
                                  >
                                    Collection:
                                  </Label>
                                </div>
                                <Select
                                  value={galleryFilter}
                                  onValueChange={setGalleryFilter}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Select collection..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">
                                      All Collections
                                    </SelectItem>
                                    {getUniqueCollections().map(
                                      (collection: string, index: number) => (
                                        <SelectItem
                                          key={index}
                                          value={collection}
                                        >
                                          {collection}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* NFT Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 [@media(min-width:1540px)]:grid-cols-3 gap-4">
                              {getFilteredNFTs().map(
                                (asset: any, index: number) => (
                                  <NFTCard
                                    key={index}
                                    nft={asset}
                                    onCardClick={(nft) => {
                                      setSelectedNft(nft);
                                      setNftDetailsDialogOpen(true);
                                    }}
                                    hasPolicyScript={hasPolicyScript}
                                    burnDialogOpen={burnDialogOpen}
                                    setBurnDialogOpen={setBurnDialogOpen}
                                    selectedAsset={selectedAsset}
                                    setSelectedAsset={setSelectedAsset}
                                    burnResult={burnResult}
                                    isBurning={isBurning}
                                    handleBurnNFT={handleBurnNFT}
                                    setBurnResult={setBurnResult}
                                    setIsBurning={setIsBurning}
                                    walletInfo={walletInfo}
                                  />
                                )
                              )}
                            </div>
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
                  )}
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Minting */}
      <div className="space-y-6">
        {/* Minting Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5" />
                Mint NFTs
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="mint-mode">Mint Mode:</Label>
                <Select
                  value={mintMode}
                  onValueChange={(value: "new" | "existing") => {
                    setMintMode(value);
                    if (value === "existing") {
                      loadSavedPolicies();
                      // Set collection name from selected policy if available
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
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* <Separator className="mb-6" /> */}

            {/* Existing Collection Selection */}
            {mintMode === "existing" && (
              <div className="space-y-2">
                <Label htmlFor="existing-collection">Select Collection</Label>
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
                      <SelectValue placeholder="Choose a collection..." />
                    </SelectTrigger>
                    <SelectContent>
                      {savedPolicies.map((policy: any, index: number) => (
                        <SelectItem key={index} value={policy.policyId}>
                          {policy.collectionName} ({policy.policyId.slice(0, 8)}
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
                    No saved collections found. Create a new collection first.
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
                  <span className="text-muted-foreground">not required</span>
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
                      Without time lock, this collection will share the same
                      policy ID as other non-time-locked collections from your
                      wallet.
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
                    <Label htmlFor="time-lock-epochs">Duration (Epochs)</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="time-lock-epochs"
                        min={1}
                        max={1000}
                        value={[timeLockEpochs]}
                        onValueChange={(value) => setTimeLockEpochs(value[0])}
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
                    Time-locked collections expire after {timeLockEpochs} epochs
                    (~{Math.round(timeLockEpochs * 5)} days). You won't be able
                    to add more NFTs after expiration.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recipients Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="use-custom-recipients"
                  checked={useCustomRecipients}
                  onChange={(e) => {
                    setUseCustomRecipients(e.target.checked);
                    // Initialize recipients array when enabling custom recipients
                    if (e.target.checked && customRecipients.length === 0) {
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
                    Enter recipient addresses for your NFTs. Leave empty to use
                    your wallet address for that NFT.
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
                ? "Create a new collection with NFTs based on your metadata JSON."
                : "Add NFTs to the selected existing collection based on your metadata JSON."}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center">
                  <Label htmlFor="metadata-editor">
                    Edit NFT Metadata (JSON)
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
                    onClick={() => setIsMetadataMinimized(!isMetadataMinimized)}
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
                          const parsedMetadata = JSON.parse(value || "{}");
                          const assetCount = Object.keys(parsedMetadata).length;
                          if (assetCount > 0) {
                            setCustomRecipients((prev) => {
                              const newArray = new Array(assetCount).fill("");
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
                    Edit the JSON metadata for your NFTs. Make sure the JSON is
                    valid before minting. Click "Reset to Default" to update
                    with current collection name.
                  </p>
                </>
              )}
            </div>

            <Button
              onClick={handleMint}
              disabled={isMinting || !collectionName.trim()}
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
                  mintResult.success ? "border-green-500" : "border-red-500"
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {mintResult.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>{mintResult.message}</p>
                        {mintResult.txHash && (
                          <div className="text-sm w-full flex items-center gap-2">
                            <strong className="w-fit">TxHash:</strong>
                            <div className="flex items-center gap-2 flex-1">
                              <a
                                href={`https://${
                                  walletInfo?.networkId === 0 ? "testnet." : ""
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
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMintResult(null)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            )}
          </CardContent>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Saved Collections
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
                <Button onClick={loadSavedPolicies} variant="outline" size="sm">
                  Load Collections
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
                            <h3 className="font-semibold truncate">
                              {policy.collectionName}
                            </h3>
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
                  No collections saved yet. Create your first collection to see
                  it here.
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Policy Script Upload Dialog */}
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Policy Script</DialogTitle>
              <DialogDescription>
                Upload a policy script JSON file to restore a collection's
                burning capability.
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
          hasPolicyScript={hasPolicyScript}
          burnDialogOpen={burnDialogOpen}
          setBurnDialogOpen={setBurnDialogOpen}
          selectedAsset={selectedAsset}
          setSelectedAsset={setSelectedAsset}
          burnResult={burnResult}
          isBurning={isBurning}
          handleBurnNFT={handleBurnNFT}
          setBurnResult={setBurnResult}
          setIsBurning={setIsBurning}
          walletInfo={walletInfo}
        />
      </div>
    </div>
  );
}
