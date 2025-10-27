import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Image } from "lucide-react";
import { BurnDialog } from "./BurnDialog";

interface NFTCardProps {
  nft: any;
  onCardClick: (nft: any) => void;
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

export function NFTCard({
  nft,
  onCardClick,
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
}: NFTCardProps) {
  const handleBurnClose = () => {
    setBurnDialogOpen(false);
    setSelectedAsset(null);
    setBurnResult(null);
    setIsBurning(false);
  };

  const handleBurnOpenChange = (open: boolean) => {
    setBurnDialogOpen(open);
    if (!open) {
      handleBurnClose();
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 p-2">
      <CardContent className="px-0 flex flex-col h-full">
        <div className="space-y-3 flex-1">
          {/* NFT Image */}
          <div className="aspect-square bg-white rounded-lg overflow-hidden border">
            {nft.imageUrl || nft.image ? (
              <img
                src={nft.imageUrl || nft.image}
                alt={nft.assetName || "NFT"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const nextElement = e.currentTarget
                    .nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = "flex";
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                <Image className="h-12 w-12" />
              </div>
            )}
          </div>

          {/* NFT Info */}
          <div className="space-y-2">
            <div>
              <h3 className="font-semibold text-sm line-clamp-1">
                {nft.metadata?.name || nft.assetName || "Unknown NFT"}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {nft.metadata?.description ||
                  nft.description ||
                  "No description available"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                Qty: {nft.quantity}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {nft.policyId.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onCardClick(nft)}
          >
            View Details
          </Button>

          {hasPolicyScript(nft.policyId) && (
            <BurnDialog
              isOpen={
                burnDialogOpen && selectedAsset?.assetName === nft.assetName
              }
              onOpenChange={handleBurnOpenChange}
              selectedAsset={nft}
              burnResult={burnResult}
              isBurning={isBurning}
              onBurn={handleBurnNFT}
              onClose={handleBurnClose}
              walletInfo={walletInfo}
            >
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setSelectedAsset(nft);
                  setBurnDialogOpen(true);
                }}
              >
                <Flame className="h-4 w-4" />
              </Button>
            </BurnDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
