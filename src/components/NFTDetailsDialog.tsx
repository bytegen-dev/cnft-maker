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
import { Flame, Image, Github, Globe, CheckCircle } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import { BurnDialog } from "./BurnDialog";
import { Separator } from "@/components/ui/separator";
import { FaTelegram, FaXTwitter } from "react-icons/fa6";
import { CopyButton } from "@/components/ui/copy-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { getCredentialServerUrl } from "@/lib/utils";

interface NFTDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedNft: any;
  onClose: () => void;
  hasPolicyScript: (policyId: string, network: number) => boolean;
  network: number;
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
  network,
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
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Validate credential by checking against credential server
  const validateCredential = async () => {
    if (!selectedNft?.metadata?.credentials) {
      setValidationResult({
        isValid: false,
        message: "No credentials found in NFT metadata",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const credentials = selectedNft.metadata.credentials;
      const credentialServerUrl = getCredentialServerUrl();

      // Check if we have the necessary data for validation
      if (!credentials.issueeId) {
        setValidationResult({
          isValid: false,
          message: "Cannot validate: Missing issuee ID",
        });
        setIsValidating(false);
        return;
      }

      // Fetch credentials for the issuee ID from credential server
      const response = await fetch(
        `${credentialServerUrl}/contactCredentials?contactId=${credentials.issueeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch credentials: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const serverCredentials = data.data || [];

      // Find matching credential by schema SAID
      const schemaSaid =
        credentials.credentialProperties?.schemaSaid || credentials.schemaSaid;

      const matchingCredential = serverCredentials.find((cred: any) => {
        return cred.sad?.s === schemaSaid || cred.schema?.$id === schemaSaid;
      });

      if (!matchingCredential) {
        setValidationResult({
          isValid: false,
          message: "Credential not found on server",
          details: {
            reason: "The credential does not exist in the credential server",
          },
        });
        setIsValidating(false);
        return;
      }

      // Check credential status (0 = issued, 1 = revoked)
      // Also check for rev object and status.et === "rev" as additional indicators
      const status = matchingCredential.status?.s;
      const eventType = matchingCredential.status?.et;
      const hasRevObject = !!matchingCredential.rev;
      const isRevoked = status === "1" || eventType === "rev" || hasRevObject;
      const isIssued = status === "0" && eventType !== "rev" && !hasRevObject;

      // Validate issuance date time if present
      const issuanceDateTime = credentials.issuanceDateTime;
      let isExpired = false;
      if (issuanceDateTime) {
        const issuanceDate = new Date(issuanceDateTime);
        const now = new Date();
        // Check if credential is older than 1 year (example expiration)
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        isExpired = issuanceDate < oneYearAgo;
      }

      // Build validation result
      if (isRevoked) {
        // Get revocation timestamp from rev object or status
        const revokedAt =
          matchingCredential.rev?.dt ||
          matchingCredential.status?.dt ||
          "Unknown";
        setValidationResult({
          isValid: false,
          message: "Credential has been revoked",
          details: {
            status: "revoked",
            revokedAt: revokedAt,
            revocationSequence:
              matchingCredential.rev?.s || matchingCredential.status?.s,
          },
        });
      } else if (isExpired) {
        setValidationResult({
          isValid: false,
          message: "Credential has expired",
          details: {
            status: "expired",
            issuedAt: issuanceDateTime,
          },
        });
      } else if (isIssued) {
        setValidationResult({
          isValid: true,
          message: "Credential is valid",
          details: {
            status: "issued",
            issuedAt: issuanceDateTime || matchingCredential.status?.dt,
            schemaSaid: schemaSaid,
            credentialType: credentials.credentialType,
          },
        });
      } else {
        setValidationResult({
          isValid: false,
          message: "Unknown credential status",
          details: {
            status: status,
          },
        });
      }
    } catch (error: any) {
      console.error("Credential validation error:", error);
      setValidationResult({
        isValid: false,
        message: `Validation failed: ${error.message || "Unknown error"}`,
        details: {
          error: error.message,
        },
      });
    } finally {
      setIsValidating(false);
    }
  };

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
      <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
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
                {selectedNft.imageUrl || selectedNft.image ? (
                  <img
                    src={selectedNft.imageUrl || selectedNft.image}
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
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    <Image className="h-8 w-8" />
                  </div>
                )}
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium min-w-fit">
                    Asset Name:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                      {selectedNft.assetName}
                    </span>
                    <CopyButton text={selectedNft.assetName} />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium">Policy ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                      {selectedNft.policyId}
                    </span>
                    <CopyButton text={selectedNft.policyId} />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium">Fingerprint:</span>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                      {selectedNft.fingerprint}
                    </span>
                    <CopyButton text={selectedNft.fingerprint} />
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm font-medium">Unit:</span>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                      {selectedNft.unit}
                    </span>
                    <CopyButton text={selectedNft.unit} />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Credentials Section */}
            {selectedNft.metadata?.credentials && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  Credentials
                </h4>

                {/* Credential Details - Always show critical fields */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium min-w-fit">
                      Credential Type:
                    </span>
                    <span className="text-sm text-muted-foreground text-right max-w-[220px] truncate">
                      {selectedNft.metadata.credentials.credentialType || "-"}
                    </span>
                  </div>

                  {selectedNft.metadata.credentials.credentialTitle && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium min-w-fit">
                        Credential Title:
                      </span>
                      <span className="text-sm text-muted-foreground text-right max-w-[220px] truncate">
                        {selectedNft.metadata.credentials.credentialTitle}
                      </span>
                    </div>
                  )}

                  {selectedNft.metadata.credentials.credentialProperties && (
                    <>
                      {selectedNft.metadata.credentials.credentialProperties
                        .version && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium min-w-fit">
                            Version:
                          </span>
                          <span className="text-sm text-muted-foreground text-right max-w-[220px] truncate">
                            {
                              selectedNft.metadata.credentials
                                .credentialProperties.version
                            }
                          </span>
                        </div>
                      )}

                      {selectedNft.metadata.credentials.credentialProperties
                        .issueeAid && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium min-w-fit">
                            Issuee AID:
                          </span>
                          <div className="flex items-center gap-2 w-full justify-end">
                            <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                              {
                                selectedNft.metadata.credentials
                                  .credentialProperties.issueeAid
                              }
                            </span>
                            <CopyButton
                              text={
                                selectedNft.metadata.credentials
                                  .credentialProperties.issueeAid
                              }
                            />
                          </div>
                        </div>
                      )}

                      {selectedNft.metadata.credentials.credentialProperties
                        .credentialStatusRegistry && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium min-w-fit">
                            Status Registry:
                          </span>
                          <div className="flex items-center gap-2 w-full justify-end">
                            <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                              {
                                selectedNft.metadata.credentials
                                  .credentialProperties.credentialStatusRegistry
                              }
                            </span>
                            <CopyButton
                              text={
                                selectedNft.metadata.credentials
                                  .credentialProperties.credentialStatusRegistry
                              }
                            />
                          </div>
                        </div>
                      )}

                      {selectedNft.metadata.credentials.credentialProperties
                        .schemaSaid && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium min-w-fit">
                            Schema SAID:
                          </span>
                          <div className="flex items-center gap-2 w-full justify-end">
                            <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                              {
                                selectedNft.metadata.credentials
                                  .credentialProperties.schemaSaid
                              }
                            </span>
                            <CopyButton
                              text={
                                selectedNft.metadata.credentials
                                  .credentialProperties.schemaSaid
                              }
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedNft.metadata.credentials.issueeId && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium min-w-fit">
                        Issuee ID:
                      </span>
                      <div className="flex items-center gap-2 w-full justify-end">
                        <span className="text-sm text-muted-foreground font-mono text-right max-w-[220px] truncate">
                          {selectedNft.metadata.credentials.issueeId}
                        </span>
                        <CopyButton
                          text={selectedNft.metadata.credentials.issueeId}
                        />
                      </div>
                    </div>
                  )}

                  {selectedNft.metadata.credentials.issuanceDateTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium min-w-fit">
                        Issuance Date & Time:
                      </span>
                      <span className="text-sm text-muted-foreground text-right max-w-[220px] truncate">
                        {new Date(
                          selectedNft.metadata.credentials.issuanceDateTime
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Credential Attributes */}
                  {selectedNft.metadata.credentials.attributes &&
                    Object.keys(selectedNft.metadata.credentials.attributes)
                      .length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                            Attributes
                          </h5>
                          <div className="space-y-2">
                            {Object.entries(
                              selectedNft.metadata.credentials.attributes
                            ).map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center p-2 border rounded-md"
                              >
                                <span className="text-sm font-medium capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}:
                                </span>
                                <span className="text-sm text-muted-foreground font-mono">
                                  {String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                </div>

                {/* Connections - Only show if connections exist */}
                {selectedNft.metadata.credentials.connections &&
                  selectedNft.metadata.credentials.connections.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                          Connections
                        </h5>
                        <div className="space-y-2">
                          {selectedNft.metadata.credentials.connections.map(
                            (connection: any, index: number) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 border rounded-md"
                              >
                                <div className="flex items-center gap-2">
                                  {connection.name
                                    ?.toLowerCase()
                                    .includes("github") && (
                                    <Github className="h-4 w-4" />
                                  )}
                                  {connection.name
                                    ?.toLowerCase()
                                    .includes("twitter") ||
                                  connection.name
                                    ?.toLowerCase()
                                    .includes("x") ? (
                                    <FaXTwitter className="h-4 w-4" />
                                  ) : null}
                                  {connection.name
                                    ?.toLowerCase()
                                    .includes("website") ||
                                  connection.name
                                    ?.toLowerCase()
                                    .includes("web") ? (
                                    <Globe className="h-4 w-4" />
                                  ) : null}
                                  {connection.name
                                    ?.toLowerCase()
                                    .includes("telegram") && (
                                    <FaTelegram className="h-4 w-4" />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {connection.name || "Unknown Connection"}
                                    </span>
                                    {connection.id && (
                                      <span className="text-xs text-muted-foreground">
                                        ID: {connection.id}
                                      </span>
                                    )}
                                    {connection.linked_identifier && (
                                      <span className="text-xs text-muted-foreground">
                                        Linked: {connection.linked_identifier}
                                      </span>
                                    )}
                                    {connection.timestamp && (
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(
                                          connection.timestamp
                                        ).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {connection.url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(connection.url, "_blank")
                                    }
                                    className="flex items-center gap-1"
                                  >
                                    Visit
                                  </Button>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </>
                  )}

                {/* Validate Button */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={validateCredential}
                    disabled={
                      isValidating ||
                      !selectedNft?.metadata?.credentials?.credentialType
                    }
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validate Credentials
                      </>
                    )}
                  </Button>

                  {/* Validation Result */}
                  {validationResult && (
                    <Alert
                      className={
                        validationResult.isValid
                          ? "border-green-500"
                          : "border-red-500"
                      }
                    >
                      {validationResult.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription>
                        <div className="space-y-2">
                          <p
                            className={`text-sm font-medium ${
                              validationResult.isValid
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {validationResult.message}
                          </p>
                          {validationResult.details && (
                            <div className="text-xs text-muted-foreground space-y-1">
                              {validationResult.details.status && (
                                <p>
                                  <strong>Status:</strong>{" "}
                                  {validationResult.details.status}
                                </p>
                              )}
                              {validationResult.details.issuedAt && (
                                <p>
                                  <strong>Issued At:</strong>{" "}
                                  {new Date(
                                    validationResult.details.issuedAt
                                  ).toLocaleString()}
                                </p>
                              )}
                              {validationResult.details.revokedAt && (
                                <p>
                                  <strong>Revoked At:</strong>{" "}
                                  {new Date(
                                    validationResult.details.revokedAt
                                  ).toLocaleString()}
                                </p>
                              )}
                              {validationResult.details.credentialType && (
                                <p>
                                  <strong>Type:</strong>{" "}
                                  {validationResult.details.credentialType}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}

            {/* Full Metadata - Collapsible */}
            {selectedNft.metadata && (
              <div className="space-y-2">
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    ASSET INFORMATION
                  </summary>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <Editor
                      height="200px"
                      defaultLanguage="json"
                      theme="vs-dark"
                      value={JSON.stringify(selectedNft, null, 2)}
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
              {hasPolicyScript(selectedNft.policyId, network) ? (
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
