# Cardano NFT Minting with Verifiable Credentials - Setup Guide

Complete setup instructions for the Cardano NFT minting demonstration application with verifiable credentials support.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Required - Blockfrost API Keys
NEXT_PUBLIC_PREPROD_BLOCKFROST_API_KEY=your_preprod_blockfrost_api_key_here
NEXT_PUBLIC_MAINNET_BLOCKFROST_API_KEY=your_mainnet_blockfrost_api_key_here

# Optional - Credential Server URL (has default)
NEXT_PUBLIC_CREDENTIAL_SERVER_URL=https://cred-issuance.dev.idw-sandboxes.cf-deployments.org

# Optional - Pinata IPFS (for image uploads)
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here
```

## Getting API Keys

### 1. Blockfrost API Keys

The application requires separate API keys for preprod (testnet) and mainnet networks. The application automatically selects the appropriate key based on your connected wallet's network.

#### Preprod (Testnet) Key

1. Go to [Blockfrost.io](https://blockfrost.io/)
2. Sign up for a free account
3. Create a new project
4. Select **Preprod** network for testing
5. Copy your API key
6. Add it to your `.env.local` file as `NEXT_PUBLIC_PREPROD_BLOCKFROST_API_KEY`

#### Mainnet Key

1. In the same Blockfrost account
2. Create a new project
3. Select **Mainnet** network
4. Copy your API key
5. Add it to your `.env.local` file as `NEXT_PUBLIC_MAINNET_BLOCKFROST_API_KEY`

**Free Tier Limits:**

- 100 requests per second
- 10,000 requests per day
- Suitable for development and testing

### 2. Credential Server URL (Optional)

The application uses a credential server for credential operations. By default, it uses:

```
https://cred-issuance.dev.idw-sandboxes.cf-deployments.org
```

If you're running your own credential server, update `NEXT_PUBLIC_CREDENTIAL_SERVER_URL` in your `.env.local` file.

### 3. Pinata IPFS (Optional)

For image uploads to IPFS:

1. Go to [Pinata.cloud](https://pinata.cloud/)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the JWT token
6. Add it to your `.env.local` file as `NEXT_PUBLIC_PINATA_JWT`

**Free Tier:**

- 1GB storage
- 1,000 pins per month
- Suitable for NFT images

## Wallet Setup

### Browser Wallet (Required for NFT Operations)

The application uses browser wallet extensions for Cardano transactions. You'll need a Cardano wallet extension installed:

1. **Install a Cardano Wallet Extension**
   - [Nami Wallet](https://namiwallet.io/)
   - [Eternl Wallet](https://eternl.io/)
   - [Flint Wallet](https://flint-wallet.com/)
   - Or any other CIP-30 compatible wallet

2. **Create or Import a Wallet**
   - Create a new wallet or import an existing one
   - **For testing**: Switch to **Preprod (Testnet)** network in wallet settings
   - **WARNING**: Never share your seed phrase with anyone

3. **Fund Your Wallet**
   - For testnet: Use [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)
   - Ensure you have sufficient ADA for transaction fees (recommended: 10+ ADA)

4. **Connect in Application**
   - Open the application
   - Click "Connect Wallet" in the Wallet Connection section
   - Select your wallet from the list
   - Approve the connection request

### Veridian Wallet (Required for Credential Operations)

To use verifiable credentials functionality, you'll need the Veridian wallet:

1. **Install Veridian Wallet**
   - Download from [Veridian Platform](https://docs.veridian.id/)
   - Follow the installation instructions for your platform

2. **Set Up Veridian Wallet**
   - Create a new identifier or import an existing one
   - Ensure your wallet is running and accessible
   - The wallet must support CIP-45 for peer-to-peer connections

3. **Connect via CIP-45**
   - In the application, click "Connect Wallet" in the Add Credentials section
   - Scan the QR code with your Veridian wallet
   - Approve the connection request
   - Sign the ownership verification message

4. **Obtain Credentials**
   - Credentials must be issued to your KERI identifier (AID)
   - Use the [Credential Issuer](https://github.com/bytegen-dev/issue-veridian-credentials) application to issue credentials
   - Or use an existing credential server that has issued credentials to your identifier

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
# Copy the example environment file (if it exists)
cp .env.example .env.local

# Or create .env.local manually
touch .env.local

# Edit with your actual values
nano .env.local
# or
code .env.local
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

## Credential Setup

### Prerequisites for Credential Functionality

To use verifiable credentials with NFTs, you need:

1. **Veridian Wallet** - Installed and running
2. **KERI Identifier** - An identifier (AID) created in Veridian wallet
3. **Issued Credentials** - Credentials issued to your identifier via the credential server

### Setting Up Credentials

1. **Create Credential Schema** (Optional)
   - Use the [Credential Schema Builder](https://github.com/bytegen-dev/credential-schema-builder) to create schemas
   - Note: Schemas must be registered on the credential server before use

2. **Issue Credentials**
   - Use the [Credential Issuer](https://github.com/bytegen-dev/issue-veridian-credentials) application
   - Provide your KERI identifier (AID) from Veridian wallet
   - Select a credential type (Schema SAID)
   - Provide credential attributes
   - Issue the credential

3. **Connect and Use in NFT Minting**
   - Connect Veridian wallet in this application
   - Fetch your credentials
   - Apply credentials to NFT metadata
   - Mint NFTs with embedded credentials

## Security Best Practices

### Environment Variables

- **NEVER** commit `.env.local` to version control
- Use different API keys for testnet and mainnet
- Rotate API keys regularly
- Keep API keys secure and private

### Wallet Security

- **Testnet First**: Always test on preprod/testnet before using mainnet
- **Small Amounts**: Only use small amounts for testing
- **Seed Phrase Security**: Never share your seed phrase or private keys
- **Browser Extensions**: Only install wallet extensions from official sources
- **Hardware Wallets**: Consider using hardware wallets for mainnet operations

### Credential Security

- **Identifier Privacy**: Your KERI identifier (AID) is public but be mindful of privacy
- **Credential Sharing**: Only share credentials when necessary
- **Server Trust**: Understand which credential server you're connecting to
- **Validation**: Always validate credentials before trusting them

### Development

- Always test on testnet first
- Use small amounts for testing
- Monitor your wallet balance
- Keep credentials and keys secure
- Review transaction details before signing

## Testing Your Setup

### 1. Check Browser Wallet Connection

- Open the application
- Click "Connect Wallet" in the Wallet Connection section
- Select your wallet extension
- Verify your wallet address is displayed
- Check that your balance loads correctly
- Verify network indicator shows correct network (Preprod/Mainnet)

### 2. Test NFT Minting

- Create a simple NFT with test metadata
- Use a small amount of ADA for fees
- Approve the transaction in your wallet
- Verify the transaction appears on CardanoScan
- Check that the NFT appears in your gallery

### 3. Test Credential Integration

- Connect Veridian wallet via CIP-45
- Verify ownership by signing the message
- Fetch available credentials
- Select a credential and apply it to metadata
- Mint an NFT with credentials
- Verify credential data appears in NFT details

### 4. Test IPFS Upload (Optional)

- Upload a test image in the Upload to IPFS section
- Verify the IPFS hash is generated
- Check that the image is accessible via IPFS gateway
- Use the IPFS hash in your NFT metadata

### 5. Test Credential Validation

- Open an NFT with embedded credentials
- Click "Validate Credentials" in the NFT details dialog
- Verify validation results show credential status
- Check that expired or revoked credentials are detected

## Troubleshooting

### Common Issues

**"Failed to connect wallet"**

- Ensure wallet extension is installed and unlocked
- Check that wallet is on the correct network (preprod/mainnet)
- Try disconnecting and reconnecting
- Refresh the page and try again

**"CIP-45 connection timeout"**

- Ensure Veridian wallet is running and accessible
- Check network connectivity
- Try generating a new QR code
- Verify Veridian wallet supports CIP-45

**"No credentials found"**

- Verify credentials were issued to your KERI identifier
- Check that the credential server is accessible
- Ensure you've verified wallet ownership
- Verify credentials haven't been revoked

**"Transaction failed"**

- Ensure you have sufficient ADA for fees (recommended: 5+ ADA)
- Check that your wallet has enough balance
- Verify you're on the correct network
- Check browser console for detailed error messages

**"IPFS upload failed"**

- Check your Pinata JWT token is valid
- Ensure you have remaining upload quota
- Verify your internet connection
- Check file size limits

**"Policy script not found"**

- Make sure you've minted NFTs with this app
- Check that policies are saved in localStorage
- Try refreshing the page
- Verify you're on the same network (preprod/mainnet) as when you minted

**"Credential validation failed"**

- Verify the credential server is accessible
- Check that the credential exists on the server
- Ensure the credential hasn't been revoked
- Verify network connectivity

### Debug Mode

Enable debug logging by checking the browser console. The application logs detailed information about:

- Wallet connection status
- CIP-45 connection process
- Credential fetching operations
- Transaction building and signing
- API responses and errors

## Browser Compatibility

- **Chrome** 90+ (Recommended)
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

Note: Wallet extensions may have specific browser requirements. Check your wallet's documentation for compatibility.

## Network Configuration

### Preprod (Testnet)

- **Network ID**: 0
- **Blockfrost**: Preprod endpoint
- **Explorer**: [CardanoScan Testnet](https://testnet.cardanoscan.io/)
- **Faucet**: [Cardano Testnet Faucet](https://testnets.cardano.org/en/testnets/cardano/tools/faucet/)

### Mainnet (Production)

- **Network ID**: 1
- **Blockfrost**: Mainnet endpoint
- **Explorer**: [CardanoScan Mainnet](https://cardanoscan.io/)
- **Warning**: Use real ADA on mainnet. Always test thoroughly on testnet first.

The application automatically detects the network from your connected wallet and uses the appropriate Blockfrost API key.

## Performance Tips

- **Batch Operations**: Mint multiple NFTs in one transaction when possible
- **Image Optimization**: Compress images before IPFS upload to reduce costs
- **Network Selection**: Use faster RPC endpoints for better performance
- **Caching**: The app caches wallet data and policy scripts for better UX
- **Credential Caching**: Credentials are fetched on demand to reduce API calls

## Related Projects

This demonstration project is part of a larger credential ecosystem:

- **[Credential Schema Builder](https://github.com/bytegen-dev/credential-schema-builder)** - Create and validate credential schemas
- **[Credential Issuer](https://github.com/bytegen-dev/issue-veridian-credentials)** - Issue verifiable credentials to identifiers
- **Credential Server** - Backend server for credential management (see credential-server directory)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify your environment variables are set correctly
3. Ensure you have sufficient ADA balance
4. Check network connectivity
5. Verify wallet extensions are up to date
6. Try refreshing the page
7. Check the [README.md](./README.md) for detailed documentation

For additional help, create an issue in the repository or refer to the documentation links in the README.

## Additional Resources

- [Veridian Documentation](https://docs.veridian.id/) - Veridian wallet and platform documentation
- [Cardano Documentation](https://docs.cardano.org/) - Cardano blockchain documentation
- [Mesh SDK Documentation](https://meshjs.dev/) - Cardano Mesh SDK reference
- [CIP-45 Specification](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0045) - Cardano Improvement Proposal 45
- [KERI Documentation](https://keri.one/) - Key Event Receipt Infrastructure documentation

---

**Remember**: This is a demonstration project for educational and development purposes. Always test with small amounts on testnet before using on mainnet. Never share your seed phrases or private keys. This is not a production-ready application.
