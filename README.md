# Cardano NFT Minting Platform

A comprehensive Next.js application for minting, managing, and burning Cardano NFTs using the Mesh SDK. Built with modern web technologies and a responsive UI.

## Features

### NFT Management

- **Mint NFTs** - Create new collections or add to existing ones
- **Burn NFTs** - Permanently destroy NFTs you own
- **NFT Gallery** - View all your NFTs with images and metadata
- **Collection Management** - Save and manage multiple collections
- **Policy Script Management** - Download and upload policy scripts

### Advanced Features

- **Dynamic Metadata Editor** - Edit JSON metadata with Monaco Editor
- **IPFS Integration** - Upload images to Pinata IPFS
- **Custom Recipients** - Send NFTs to specific addresses
- **Time-locked Policies** - Create time-locked or signature-only policies
- **Search & Filter** - Find NFTs by collection, policy ID, or metadata
- **Persistent UI** - Collapsible sections with localStorage persistence

### User Experience

- **Responsive Design** - Works on desktop and mobile
- **Dark Mode** - Dark theme with shadcn/ui
- **Real-time Updates** - Live wallet balance and transaction status
- **Error Handling** - Comprehensive error messages and validation
- **Copy Functionality** - Easy copying of addresses and transaction hashes

## Quick Start

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Cardano testnet wallet with some ADA

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mint-cip25-nft

# Install dependencies
npm install

# Set up environment variables (see SETUP.md)
cp .env.example .env.local
# Edit .env.local with your keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Blockchain**: Cardano Mesh SDK
- **Icons**: Lucide React
- **Editor**: Monaco Editor
- **Storage**: IPFS (Pinata)
- **Fonts**: Custom Google Fonts (Bitcount Grid Single, Boldonse)

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout with fonts
│   ├── page.tsx           # Homepage with LightRays background
│   └── globals.css        # Global styles and custom fonts
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── MintingInterface.tsx  # Main minting interface
│   ├── NFTCard.tsx       # NFT gallery card component
│   ├── NFTDetailsDialog.tsx # NFT details modal
│   ├── BurnDialog.tsx    # NFT burning confirmation
│   ├── CopyButton.tsx    # Reusable copy button
│   ├── Footer.tsx        # Application footer
│   └── LightRays.jsx     # Animated background
└── lib/                  # Utility functions
    ├── minting.ts        # Core minting logic
    ├── metadata.ts       # Default metadata templates
    ├── recipients.ts      # Recipient management
    └── pinata.ts         # IPFS upload functionality
```

## Security Features

- **Environment Variables** - Sensitive keys stored securely
- **Client-side Only** - No server-side key exposure
- **Input Validation** - Comprehensive form validation
- **Error Boundaries** - Graceful error handling
- **Policy Verification** - Validates policy scripts before use

## Customization

### Fonts

The app uses custom fonts that can be modified in `src/app/globals.css`:

- **Bitcount Grid Single** - Primary monospace font
- **Boldonse** - Accent font for headings

### Themes

Built with shadcn/ui's theming system. Modify colors in `src/app/globals.css`.

### Components

All UI components are built with shadcn/ui and can be customized by modifying the component files in `src/components/ui/`.

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [Environment Variables](#environment-variables) - Required configuration
- [API Reference](#api-reference) - Function documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application is for educational and development purposes. Always test with small amounts on testnet before using on mainnet. Never share your seed phrases or private keys.

## Links

- [Cardano Documentation](https://docs.cardano.org/)
- [Mesh SDK Documentation](https://meshjs.dev/)
- [Blockfrost API](https://blockfrost.io/)
- [Pinata IPFS](https://pinata.cloud/)

---

Built by [Bytegen](https://bytegen.dev).
