# Cardano NFT Minting with Verifiable Credentials - Demonstration Project

A demonstration Next.js application showcasing the integration of verifiable credentials with Cardano NFTs (CIP-25) using CIP-45 and KERI (Key Event Receipt Infrastructure). This project serves as a proof-of-concept for embedding verifiable credentials into blockchain assets, demonstrating the technical feasibility and user experience of credential-backed NFTs.

## Overview

This demonstration project illustrates how verifiable credentials can be embedded into Cardano NFTs, creating a bridge between blockchain assets and decentralized identity. The application demonstrates the full workflow from credential schema creation to NFT minting with embedded credentials, providing a reference implementation for developers interested in credential-backed NFTs.

**Note**: This is a demonstration project for educational and development purposes. It showcases the technical capabilities of integrating verifiable credentials with Cardano NFTs but is not intended as a production-ready platform.

## Features

### NFT Management

- **Mint NFTs** - Create new collections or add to existing ones with flexible metadata standards
- **Burn NFTs** - Permanently destroy NFTs you own with proper validation and policy script verification
- **NFT Gallery** - View all your NFTs with images, metadata, and credential information in grid or list view
- **Collection Management** - Save and manage multiple collections with policy script persistence
- **Policy Script Management** - Download and upload policy scripts for collection management
- **Network-aware Operations** - Automatic preprod/mainnet detection with appropriate API keys

### Verifiable Credentials Integration

- **CIP-45 Wallet Connection** - Connect with Veridian wallet using Cardano Improvement Proposal 45
- **Credential Fetching** - Retrieve available credentials associated with your KERI identifier
- **Credential Application** - Apply credentials to NFT metadata with automatic formatting
- **Credential Validation** - Validate credential status, expiration, and revocation
- **CIP-45 Signature Verification** - Require wallet signature when minting NFTs with credentials
- **Credential Details Display** - View comprehensive credential information in NFT details dialog

### Advanced Features

- **Dynamic Metadata Editor** - Edit JSON metadata with Monaco Editor syntax highlighting
- **Metadata Standards** - Support for Basic and Developer Identity metadata standards
- **Flexible Metadata** - Support for custom metadata structures including credentials, social links, and attributes
- **IPFS Integration** - Upload images to Pinata IPFS with automatic hash generation
- **Custom Recipients** - Send NFTs to specific addresses per asset
- **Time-locked Policies** - Create time-locked or signature-only policies for collection security
- **Search & Filter** - Find NFTs by collection, policy ID, asset name, or metadata content
- **Persistent UI** - Collapsible sections with localStorage persistence for improved UX

### User Experience

- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Dark Mode** - Dark theme with shadcn/ui components
- **Real-time Updates** - Live wallet balance, ADA price, and transaction status
- **Error Handling** - Comprehensive error messages and validation feedback
- **Copy Functionality** - Easy copying of addresses, transaction hashes, and identifiers
- **Wallet Persistence** - Auto-reconnect to saved wallet on page load
- **Network Indicators** - Clear visual indicators for preprod/mainnet network status

## Architecture

This application is part of a larger ecosystem of credential management tools:

### Related Projects

1. **Credential Schema Builder** - Create and validate credential schemas

   - Repository: [credential-schema-builder](https://github.com/bytegen-dev/credential-schema-builder)
   - Purpose: Build JSON schemas for verifiable credentials with automatic SAID calculation
   - Integration: Generated schemas can be imported into the Credential Issuer

2. **Credential Issuer** - Issue verifiable credentials to identifiers

   - Repository: [issue-veridian-credentials](https://github.com/bytegen-dev/issue-veridian-credentials)
   - Purpose: Issue credentials to KERI identifiers using the credential server API
   - Integration: Credentials issued here can be fetched and applied to NFTs in this application

3. **Credential Server** - Backend server for credential management
   - Purpose: Manages credential issuance, storage, validation, and revocation
   - Integration: This application communicates with the credential server to fetch and validate credentials

### Workflow

1. **Schema Creation** - Use Credential Schema Builder to create credential schemas
2. **Credential Issuance** - Use Credential Issuer to issue credentials to identifiers
3. **NFT Minting** - Use this application to mint NFTs with embedded credentials
4. **Credential Validation** - Validate credentials directly from NFT metadata

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Cardano Mesh SDK (@meshsdk/react)
- **Identity**: CIP-45 (@fabianbormann/cardano-peer-connect)
- **Credentials**: KERI (Key Event Receipt Infrastructure) via credential server
- **Icons**: Lucide React
- **Editor**: Monaco Editor
- **Storage**: IPFS (Pinata)
- **Fonts**: Custom Google Fonts (Bitcount Grid Single, Boldonse)

## Quick Start

For detailed setup instructions, see [SETUP.md](./SETUP.md).

### Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun package manager
- Cardano wallet (Nami, Eternl, Flint, etc.) for browser wallet integration
- Veridian wallet for CIP-45 credential functionality
- Blockfrost API keys for both preprod and mainnet (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/bytegen-dev/mint-cip25-nft.git
cd mint-cip25-nft

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see SETUP.md for detailed instructions)

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

For complete setup instructions including wallet configuration, credential setup, and troubleshooting, refer to [SETUP.md](./SETUP.md).

### Environment Variables

Required environment variables (see [SETUP.md](./SETUP.md) for detailed instructions):

```bash
# Blockfrost API Keys (required)
NEXT_PUBLIC_PREPROD_BLOCKFROST_API_KEY=your_preprod_key
NEXT_PUBLIC_MAINNET_BLOCKFROST_API_KEY=your_mainnet_key

# Credential Server URL (optional, has default)
NEXT_PUBLIC_CREDENTIAL_SERVER_URL=https://cred-issuance.dev.idw-sandboxes.cf-deployments.org

# Pinata IPFS (optional, for image uploads)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token
```

## Usage Guide

### Minting NFTs

1. **Connect Wallet** - Connect your Cardano browser wallet (Nami, Eternl, etc.)
2. **Choose Mint Mode** - Select "New Collection" or "Add to Existing"
3. **Configure Collection** - Set collection name, metadata standard, and time lock settings
4. **Edit Metadata** - Use the Monaco Editor to customize NFT metadata JSON
5. **Add Credentials (Optional)** - Connect Veridian wallet and apply credentials to metadata
6. **Mint** - Click "Mint NFT(s)" and approve the transaction in your wallet

### Adding Credentials to NFTs

1. **Connect Veridian Wallet** - Click "Connect Wallet" in the Add Credentials section
2. **Scan QR Code** - Use Veridian wallet to scan the CIP-45 connection QR code
3. **Verify Ownership** - Sign a message to verify wallet ownership
4. **Fetch Credentials** - Click "Fetch Credentials" to retrieve available credentials
5. **Select Credential** - Choose a credential from the dropdown
6. **Apply to Metadata** - Click "Apply" to insert credential data into NFT metadata
7. **Mint with Credentials** - When minting, you'll be prompted to sign a CIP-45 message confirming credential usage

### Validating Credentials

1. **View NFT Details** - Click on any NFT in your gallery
2. **Check Credentials** - View credential information in the Credentials section
3. **Validate** - Click "Validate Credentials" to check status against the credential server
4. **Review Results** - See validation status, expiration, and revocation information

## Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── layout.tsx               # Root layout with fonts and providers
│   ├── page.tsx                 # Homepage with LightRays background
│   └── globals.css              # Global styles and custom fonts
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── MintingInterface.tsx     # Main minting interface with credential integration
│   ├── NFTCard.tsx              # NFT gallery card component
│   ├── NFTDetailsDialog.tsx     # NFT details modal with credential validation
│   ├── BurnDialog.tsx           # NFT burning confirmation dialog
│   ├── CopyButton.tsx           # Reusable copy button component
│   ├── Footer.tsx               # Application footer
│   └── LightRays.jsx            # Animated background component
└── lib/                         # Utility functions
    ├── minting.ts               # Core minting logic and policy generation
    ├── metadata.ts              # Default metadata templates and standards
    ├── constants.ts             # Metadata standards and templates
    ├── recipients.ts            # Recipient management utilities
    └── pinata.ts                # IPFS upload functionality
```

## Credential Integration Details

### CIP-45 Connection

The application uses CIP-45 (Cardano Improvement Proposal 45) to connect with Veridian wallet for credential operations:

- **QR Code Connection** - Generates QR code for peer-to-peer wallet connection
- **KERI Identifier** - Retrieves and displays the wallet's KERI identifier (AID)
- **Message Signing** - Uses `signKeri` API for credential usage verification
- **Credential Fetching** - Retrieves credentials associated with the KERI identifier

### Credential Data Structure

Credentials embedded in NFT metadata follow this structure:

```json
{
  "credentials": {
    "credentialType": "RareEvo2024AttendeeCredential",
    "credentialTitle": "Rare EVO 2024 Attendee",
    "issueeId": "EMP1reoCfQrw2yoef57cbhBtW4cWkqRA54ZY4PuW4oJY",
    "issuanceDateTime": "2025-10-26T22:50:34.665000+00:00",
    "credentialProperties": {
      "version": "1.0.0",
      "issueeAid": "EGDR4TZaEvYDstjZJCITD3YgGWZ-zRNqG6jJDR6o8ErB",
      "credentialStatusRegistry": "EFv_vnRHyZwUjhNbmNABEWDa6oYvuMADS-QRTxxswtXa",
      "schemaSaid": "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb"
    },
    "attributes": {
      "attendeeName": "Isaac Adebayo"
    },
    "connections": []
  }
}
```

### Credential Validation

The validation process checks:

- **Credential Existence** - Verifies credential exists on the credential server
- **Status** - Checks if credential is issued (status "0") or revoked (status "1")
- **Expiration** - Validates credential hasn't expired (1-year default expiration)
- **Revocation** - Detects revoked credentials through status and revocation objects

## Security Features

- **Environment Variables** - Sensitive keys stored securely in environment variables
- **Client-side Only** - No server-side key exposure or credential storage
- **Input Validation** - Comprehensive form validation for all user inputs
- **Error Boundaries** - Graceful error handling with user-friendly messages
- **Policy Verification** - Validates policy scripts before use in burn operations
- **CIP-45 Verification** - Requires wallet signature for credential usage confirmation
- **Network Isolation** - Separate API keys and policies for preprod and mainnet

## Metadata Standards

The application supports two metadata standards:

### Basic Standard

Simple metadata structure with essential NFT information:

```json
{
  "721": {
    "policyId": {
      "assetName": {
        "name": "NFT Name",
        "image": "ipfs://...",
        "description": "NFT Description"
      }
    }
  }
}
```

### Developer Identity Standard

Extended metadata with credential support and social links:

```json
{
  "721": {
    "policyId": {
      "assetName": {
        "name": "NFT Name",
        "image": "ipfs://...",
        "description": "NFT Description",
        "collection": "Collection Name",
        "credentials": { ... },
        "connections": [ ... ]
      }
    }
  }
}
```

## API Integration

### Credential Server

The application communicates with a credential server for credential operations:

- **Endpoint**: Configurable via `NEXT_PUBLIC_CREDENTIAL_SERVER_URL`
- **Default**: `https://cred-issuance.dev.idw-sandboxes.cf-deployments.org`
- **Endpoints Used**:
  - `GET /contactCredentials?contactId={aid}` - Fetch credentials for an identifier
  - `POST /requestDisclosure` - Request credential disclosure (legacy, not actively used)

### Blockfrost API

Used for blockchain data and metadata retrieval:

- **Network Detection** - Automatically uses preprod or mainnet API keys based on wallet network
- **Metadata Fetching** - Retrieves NFT metadata from on-chain data
- **Asset Information** - Fetches asset details and images

## Customization

### Fonts

The app uses custom fonts that can be modified in `src/app/globals.css`:

- **Bitcount Grid Single** - Primary monospace font for code and addresses
- **Boldonse** - Accent font for headings and titles

### Themes

Built with shadcn/ui's theming system. Modify colors and styles in `src/app/globals.css`.

### Components

All UI components are built with shadcn/ui and can be customized by modifying the component files in `src/components/ui/`.

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **Wallet Connection Fails**

   - Ensure wallet extension is installed and unlocked
   - Check that wallet is on the correct network (preprod/mainnet)
   - Try disconnecting and reconnecting

2. **CIP-45 Connection Timeout**

   - Ensure Veridian wallet is running and accessible
   - Check network connectivity
   - Try generating a new QR code

3. **Credential Not Found**

   - Verify the credential was issued to the correct identifier
   - Check that the credential server is accessible
   - Ensure the credential hasn't been revoked

4. **Minting Fails**
   - Verify wallet has sufficient ADA for transaction fees
   - Check that metadata JSON is valid
   - Ensure policy script is valid (for existing collections)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on preprod network
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Project Purpose

This project is a **demonstration and proof-of-concept** for integrating verifiable credentials with Cardano NFTs. It showcases:

- How to structure credential data within NFT metadata
- CIP-45 wallet integration for credential operations
- Credential validation workflows
- The technical architecture for credential-backed NFTs

The application is designed for developers and researchers interested in understanding how verifiable credentials can be integrated with blockchain assets. It is not intended as a production platform but rather as a reference implementation and educational tool.

## Disclaimer

This application is a demonstration project for educational and development purposes. Always test with small amounts on testnet before using on mainnet. Never share your seed phrases or private keys. Credential functionality requires proper setup of the credential server and Veridian wallet infrastructure. This is not a production-ready application and should be used for learning and experimentation purposes only.

## Related Resources

### Documentation

- [Cardano Documentation](https://docs.cardano.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)
- [CIP-45 Specification](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0045)
- [KERI Documentation](https://keri.one/)
- [Veridian Documentation](https://docs.veridian.id/)
- [Blockfrost API](https://blockfrost.io/)
- [Pinata IPFS](https://pinata.cloud/)

### Related Repositories

- [Credential Schema Builder](https://github.com/bytegen-dev/credential-schema-builder) - Create and validate credential schemas
- [Credential Issuer](https://github.com/bytegen-dev/issue-veridian-credentials) - Issue verifiable credentials to identifiers

### Community

- [Cardano Developer Portal](https://developers.cardano.org/)
- [Cardano Stack Exchange](https://cardano.stackexchange.com/)

---

Built by [Bytegen](https://github.com/bytegen-dev)
