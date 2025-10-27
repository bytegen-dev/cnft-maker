import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Flame } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface BurnDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAsset: any;
  burnResult: any;
  isBurning: boolean;
  onBurn: (asset: any) => void;
  onClose: () => void;
  walletInfo: any;
  children?: React.ReactNode;
}

export function BurnDialog({
  isOpen,
  onOpenChange,
  selectedAsset,
  burnResult,
  isBurning,
  onBurn,
  onClose,
  walletInfo,
  children,
}: BurnDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Burn NFT</DialogTitle>
          <DialogDescription>
            Are you sure you want to burn{" "}
            <strong>{selectedAsset?.assetName}</strong>? This action cannot be
            undone and will permanently destroy the NFT.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Asset Name:</strong> {selectedAsset?.assetName}
            </div>
            <div>
              <strong>Quantity:</strong> {selectedAsset?.quantity}
            </div>
            <div>
              <strong>Policy ID:</strong> {selectedAsset?.policyId?.slice(0, 8)}
              ...
            </div>
            <div>
              <strong>Fingerprint:</strong>{" "}
              {selectedAsset?.fingerprint?.slice(0, 8)}...
            </div>
          </div>

          {burnResult && (
            <Alert
              className={
                burnResult.success ? "border-green-500" : "border-red-500"
              }
            >
              {burnResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p>{burnResult.message}</p>
                  {burnResult.txHash && (
                    <div className="text-sm flex items-center gap-2">
                      <strong>Transaction Hash:</strong>
                      <div className="flex items-center gap-2 flex-1">
                        <a
                          href={`https://${
                            walletInfo?.networkId === 0 ? "testnet." : ""
                          }cardanoscan.io/transaction/${burnResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-muted px-2 py-1 rounded text-xs hover:bg-muted/80 transition-colors inline-block flex-1"
                          title={burnResult.txHash}
                        >
                          {burnResult.txHash.slice(0, 8)}...
                          {burnResult.txHash.slice(-8)}
                        </a>
                        <CopyButton text={burnResult.txHash} />
                      </div>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {burnResult?.success ? "Close" : "Cancel"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onBurn(selectedAsset)}
            disabled={burnResult?.success || isBurning}
          >
            {isBurning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Burning...
              </>
            ) : burnResult?.success ? (
              "Burned"
            ) : (
              <>
                <Flame className="h-4 w-4" />
                Burn NFT
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
