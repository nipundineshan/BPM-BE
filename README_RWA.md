# Real Estate NFT (RWA) Platform - Backend & Smart Contracts

This project is a production-ready solution for tokenizing real-world properties into ERC-721 NFTs on the Ethereum Sepolia testnet. It bridges physical real estate data with blockchain-based ownership.

## Project Structure

- `src/auth/`: JWT-based authentication with Role-Based Access Control.
- `src/users/`: User profile management and wallet address handling.
- `src/plots/`: Property (Plot) management, CRUD, and metadata generation.
- `src/nft/`: Core blockchain logic for minting property NFTs.
- `src/blockchain/`: Ethers.js integration and real-time event synchronization.
- `src/ipfs/`: Decentralized storage integration using Pinata SDK.

## Key Features

- **Existing Contract Integration**: Configured to work seamlessly with the deployed contract at `0x8E5364096036b4226780e6bD77c5f65585a42bF1`.
- **IPFS Automation**: Automatic generation of property metadata JSON and secure storage of documents on Pinata.
- **Real-time Sync**: A background `SyncService` listens for on-chain `Transfer` events. When a property is minted, the database is automatically updated with the new `tokenId` and `isMinted` status.
- **Swagger Documentation**: Interactive API documentation for testing all endpoints directly from the browser.
- **Type Safety**: Fully typed services and entities, resolving all circular dependency and "any" type issues.

## Getting Started

### 1. Prerequisites
- Node.js & npm
- PostgreSQL database
- Pinata API Keys (for IPFS storage)
- Sepolia RPC URL (via Alchemy or Infura)
- Ethereum Private Key (with Sepolia ETH)

### 2. Configuration
Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=bpm_rwa

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Blockchain
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_private_key

# IPFS (Pinata)
PINATA_API_KEY=your_api_key
PINATA_SECRET_API_KEY=your_secret_key
```

### 3. Execution
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev
```

## API Documentation (Swagger)

Access the interactive API docs at:
`http://localhost:3000/docs`

### Testing Workflow
1. **Register/Login**: Use `/api/auth` to create an account and get a JWT.
2. **Authorize**: Use the "Authorize" button in Swagger with `Bearer <your_token>`.
3. **Create Plot**: `POST /api/plots` with property details.
4. **IPFS Upload**: `POST /api/plots/{id}/ipfs` to pin metadata.
5. **Mint NFT**: `POST /api/nft/mint/{plotId}` to trigger the on-chain `mintPlot` call.
6. **Sync**: Wait for the backend log "Updated plot... with TokenID" to confirm database sync.

## API Endpoints Summary

### Authentication
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate and receive a JWT.

### User Profile
- `GET /api/users/profile`: Get current user details and owned plots.
- `PATCH /api/users/wallet`: Update your Ethereum wallet address.

### Properties (Plots)
- `POST /api/plots`: Create a new real estate property entry.
- `GET /api/plots`: List all properties on the platform.
- `GET /api/plots/{id}`: View specific property details.
- `POST /api/plots/{id}/ipfs`: Generate and pin metadata JSON to IPFS.

### NFT Operations
- `POST /api/nft/mint/{plotId}`: Mint the property as an NFT on Sepolia.
