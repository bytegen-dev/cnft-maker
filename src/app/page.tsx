import MintingInterface from "@/components/MintingInterface";
import LightRays from "@/components/LightRays";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full z-0 bg-black">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div className="bg-black/10 h-full fixed top-0 left-0 w-full z-10 overflow-y-auto">
        <div className="min-h-screen container mx-auto px-4 py-8 pb-32">
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-bold text-white">NFT Maker</h2>
            <p className="text-muted-foreground">
              mint-cip25-nfts with verifiable credentials.
            </p>
          </div>

          <MintingInterface />
          <Footer />
        </div>
      </div>
    </>
  );
}
