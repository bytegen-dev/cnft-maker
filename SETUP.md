# Cardano NFT Minting Platform - Setup Guide

Complete setup instructions for the Cardano NFT minting application.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required - Blockfrost API Key
NEXT_PUBLIC_BLOCKFROST_KEY=your_blockfrost_api_key_here

# Required - Wallet Seed Phrase (12 or 24 words)
NEXT_PUBLIC_SEED_PHRASE="your 12 or 24 word seed phrase here"

# Optional - Pinata IPFS (for image uploads)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
```

## Getting API Keys

### 1. Blockfrost API Key

1. Go to [Blockfrost.io](https://blockfrost.io/)
2. Sign up for a free account
3. Create a new project
4. Select **Preprod** network for testing
5. Copy your API key
6. Add it to your `.env.local` file

**Free Tier Limits:**

- 100 requests per second
- 10,000 requests per day
- Suitable for development and testing

### 2. Pinata IPFS (Optional)

For image uploads to IPFS:

1. Go to [Pinata.cloud](https://pinata.cloud/)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the JWT token
6. Add it to your `.env.local` file

**Free Tier:**

- 1GB storage
- 1,000 pins per month
- Suitable for NFT images

## Wallet Setup

### Option 1: Use Existing Wallet

If you have a Cardano wallet (Nami, Eternl, Flint, etc.):

1. Export your seed phrase from your wallet
2. **WARNING: Never share your seed phrase with anyone!**
3. Make sure you're using the **testnet** network
4. Add the seed phrase to your `.env.local` file

### Option 2: Create New Test Wallet

1. Install a Cardano wallet (recommended: [Nami](https://namiwallet.io/))
2. Create a new wallet
3. **Switch to testnet** in wallet settings
4. Save your seed phrase securely
5. Fund with test ADA from [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

### Option 3: Generate Test Wallet

Use the Cardano CLI to generate a test wallet:

```bash
# Install Cardano CLI first
cardano-cli address key-gen \
  --verification-key-file payment.vkey \
  --signing-key-file payment.skey

cardano-cli address build \
  --payment-verification-key-file payment.vkey \
  --testnet-magic 1 \
  --out-file payment.addr
```

## Installation & Running

### 1. Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install

# Using bun
bun install
```

### 2. Set Up Environment

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit with your actual values
nano .env.local
```

### 3. Run Development Server

```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev

# Using bun
bun dev
```

### 4. Open Application

Navigate to [http://localhost:3000](http://localhost:3000)

## Security Best Practices

### Environment Variables

- **NEVER** commit `.env.local` to version control
- **NEVER** share your seed phrase with anyone
- Use different keys for testnet and mainnet
- Rotate API keys regularly

### Wallet Security

- **Testnet Only**: This app is configured for testnet
- **Small Amounts**: Only use small amounts for testing
- **Backup Seed Phrase**: Store it securely offline
- **Hardware Wallets**: Use for mainnet operations

### Development

- Always test on testnet first
- Use small amounts for testing
- Monitor your wallet balance
- Keep your seed phrase secure

## Testing Your Setup

### 1. Check Wallet Connection

- Open the app
- Verify your wallet address is displayed
- Check that your balance loads correctly

### 2. Test NFT Minting

- Create a simple NFT with test metadata
- Use a small amount of ADA for fees
- Verify the transaction appears on CardanoScan

### 3. Test IPFS Upload (Optional)

- Upload a test image
- Verify the IPFS hash is generated
- Check that the image is accessible

## Troubleshooting

### Common Issues

**"Failed to load wallet info"**

- Check your seed phrase format (12 or 24 words)
- Ensure you're using testnet
- Verify your Blockfrost API key

**"Transaction failed"**

- Ensure you have sufficient ADA for fees
- Check that your wallet has enough balance
- Verify you're on the correct network

**"IPFS upload failed"**

- Check your Pinata JWT token
- Ensure you have remaining upload quota
- Verify your internet connection

**"Policy script not found"**

- Make sure you've minted NFTs with this app
- Check that policies are saved in localStorage
- Try refreshing the page

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```bash
NEXT_PUBLIC_DEBUG=true
```

## Browser Compatibility

- **Chrome** 90+ (Recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Network Configuration

### Testnet (Current)

- **Network ID**: 0
- **Blockfrost**: Preprod endpoint
- **Explorer**: [CardanoScan Testnet](https://testnet.cardanoscan.io/)

### Mainnet (Production)

To switch to mainnet:

1. Change `NEXT_PUBLIC_BLOCKFROST_KEY` to mainnet key
2. Update `networkId` in the code from 0 to 1
3. Use mainnet wallet addresses

## Performance Tips

- **Batch Operations**: Mint multiple NFTs in one transaction
- **Image Optimization**: Compress images before IPFS upload
- **Network Selection**: Use faster RPC endpoints for better performance
- **Caching**: The app caches wallet data for better UX

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables
3. Ensure you have sufficient ADA balance
4. Check network connectivity
5. Try refreshing the page

For additional help, check the [README.md](./README.md) or create an issue in the repository.

---

**Remember**: This is a testnet application. Never use mainnet funds for testing!
