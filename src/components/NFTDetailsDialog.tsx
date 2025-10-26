import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Image } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { BurnDialog } from "./BurnDialog";

interface NFTDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNft: any;
  onClose: () => void;
  hasPolicyScript: (policyId: string) => boolean;
  burnDialogOpen: boolean;
  setBurnDialogOpen: (open: boolean) => void;
  selectedAsset: any;
  setSelectedAsset: (asset: any) => void;
  burnResult: any;
  isBurning: boolean;
  handleBurnNFT: (asset: any) => void;
  setBurnResult: (result: any) => void;
  setIsBurning: (burning: boolean) => void;
  walletInfo: any;
}

export function NFTDetailsDialog({
  isOpen,
  onOpenChange,
  selectedNft,
  onClose,
  hasPolicyScript,
  burnDialogOpen,
  setBurnDialogOpen,
  selectedAsset,
  setSelectedAsset,
  burnResult,
  isBurning,
  handleBurnNFT,
  setBurnResult,
  setIsBurning,
  walletInfo,
}: NFTDetailsDialogProps) {
  const handleBurnClose = () => {
    setBurnDialogOpen(false);
    setSelectedAsset(null);
    setBurnResult(null);
    setIsBurning(false);

    // If burn was successful, also close the NFT details dialog
    if (burnResult?.success) {
      onClose();
    }
  };

  const handleBurnOpenChange = (open: boolean) => {
    setBurnDialogOpen(open);
    if (!open) {
      handleBurnClose();
    }
  };

  return (
    <Dialog open={isOpen && !burnDialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>NFT Details</DialogTitle>
          <DialogDescription>
            Detailed information about this NFT
          </DialogDescription>
        </DialogHeader>

        {selectedNft && (
          <div className="space-y-4">
            {/* Header with Image and Basic Info */}
            <div className="flex gap-4">
              {/* Compact NFT Image */}
              <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border flex-shrink-0">
                {selectedNft.image ? (
                  <img
                    src={selectedNft.image}
                    alt={selectedNft.assetName || "NFT"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const nextElement = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground"
                  style={{ display: selectedNft.image ? "none" : "flex" }}
                >
                  <Image className="h-8 w-8" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedNft.metadata?.name ||
                      selectedNft.assetName ||
                      "Unknown NFT"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {selectedNft.quantity}
                  </p>
                </div>
                {selectedNft.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {selectedNft.description}
                  </p>
                )}
              </div>
            </div>

            {/* Technical Details */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Technical Details
              </h4>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Asset Name:</span>
                  <span className="text-sm text-muted-foreground font-mono text-right max-w-xs truncate">
                    {selectedNft.assetName}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Policy ID:</span>
                  <span className="text-sm text-muted-foreground font-mono text-right max-w-xs truncate">
                    {selectedNft.policyId}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Fingerprint:</span>
                  <span className="text-sm text-muted-foreground font-mono text-right max-w-xs truncate">
                    {selectedNft.fingerprint}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium">Unit:</span>
                  <span className="text-sm text-muted-foreground font-mono text-right max-w-xs truncate">
                    {selectedNft.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Full Metadata - Collapsible */}
            {selectedNft.metadata && (
              <div className="space-y-2">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Full Metadata
                  </summary>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      theme="vs-dark"
                      value={JSON.stringify(selectedNft.metadata, null, 2)}
                      options={{
                        readOnly: true,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineNumbers: "on",
                        wordWrap: "on",
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </details>
              </div>
            )}

            {/* Burn Button */}
            <div className="pt-4 border-t">
              {hasPolicyScript(selectedNft.policyId) ? (
                <BurnDialog
                  isOpen={
                    burnDialogOpen &&
                    selectedAsset?.assetName === selectedNft.assetName
                  }
                  onOpenChange={handleBurnOpenChange}
                  selectedAsset={selectedNft}
                  burnResult={burnResult}
                  isBurning={isBurning}
                  onBurn={handleBurnNFT}
                  onClose={handleBurnClose}
                  walletInfo={walletInfo}
                >
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSelectedAsset(selectedNft);
                      setBurnDialogOpen(true);
                    }}
                  >
                    <Flame className="h-4 w-4 mr-2" />
                    Burn NFT
                  </Button>
                </BurnDialog>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                  title="Cannot burn: Policy script not available"
                >
                  <Flame className="h-4 w-4 mr-2" />
                  Cannot Burn
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
