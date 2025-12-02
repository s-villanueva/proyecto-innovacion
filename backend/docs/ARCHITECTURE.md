# Architecture Overview

## System Design

```
┌─────────────┐
│   Browser   │
│  (Metamask) │
└──────┬──────┘
       │
       │ HTTP + Web3
       │
┌──────▼──────────────────────────────────────┐
│           Go Backend (Gin)                  │
│  ┌────────────┐  ┌──────────┐  ┌─────────┐ │
│  │Controllers │  │ Services │  │ Config  │ │
│  └────────────┘  └──────────┘  └─────────┘ │
└──┬────────┬────────────┬────────────────────┘
   │        │            │
   │        │            │
   ▼        ▼            ▼
┌─────┐  ┌──────┐  ┌──────────┐
│MinIO│  │Gemini│  │ Ethereum │
│ S3  │  │  AI  │  │ (Sepolia)│
└─────┘  └──────┘  └──────────┘
```

## Components

### Frontend (`public/index.html`)
- **Technology**: Vanilla JavaScript + Ethers.js
- **Responsibilities**:
  - Wallet connection (Metamask)
  - File upload to backend
  - Blockchain transaction signing
  - Document list display

### Backend (`main.go`)
- **Framework**: Gin (Go)
- **Responsibilities**:
  - HTTP API server
  - File upload handling
  - MinIO integration
  - AI processing coordination
  - Static file serving

### Controllers (`controllers/`)
- `upload_controller.go`: File upload and processing
- `preview_controller.go`: File streaming for preview
- `document_controller.go`: Document management

### Services (`services/`)
- `minio_service.go`: Object storage operations
- `eth.go`: Blockchain interaction
- `pdf_analysis.go`: PDF text extraction
- `llm_calls.go`: AI summary generation

### Smart Contract (`contracts/Files.sol`)
- **Language**: Solidity 0.8.30
- **Network**: Ethereum Sepolia Testnet
- **Features**:
  - Document registration
  - Owner management
  - Document verification
  - Event emission

## Data Flow

### Upload Flow
1. User selects file in browser
2. Frontend uploads to backend (`POST /upload`)
3. Backend:
   - Calculates SHA256 hash
   - Uploads to MinIO
   - Extracts text (if PDF)
   - Generates AI summary
   - Registers on blockchain (optional)
   - Returns metadata
4. Frontend:
   - Receives metadata
   - Prompts user to sign transaction
   - Registers document on blockchain
   - Updates document list

### Preview Flow
1. User clicks "Preview" link
2. Browser requests `GET /preview/{filename}`
3. Backend:
   - Retrieves file from MinIO
   - Sets appropriate Content-Type
   - Streams file to browser
4. Browser displays file inline

### Document List Flow
1. Frontend queries smart contract
2. Gets total document count
3. Iterates through documents
4. Filters by user address
5. Displays user's documents

## Security Model

### User Ownership
- Users sign transactions with their own wallet
- `msg.sender` on blockchain = user's address
- True ownership without backend trust

### Backend Signing (Optional)
- Backend can sign for demo purposes
- Uses `ETH_PRIVATE_KEY` from environment
- **Not recommended for production**

### Access Control
- Smart contract has owner system
- Only owners can register documents
- Admin can add new owners

## Storage Model

### MinIO/S3
- **Path**: `docs/{timestamp}-{hash_prefix}.{ext}`
- **Metadata**: Content-Type stored
- **Access**: Private (backend-mediated)

### Blockchain
- **Document ID**: Auto-incrementing uint256
- **Stored Data**:
  - Uploader address
  - Filename
  - SHA256 hash
  - MinIO ID
  - Tag
  - Timestamp

### Frontend (localStorage)
- **Transaction URLs**: Mapped by MinIO ID
- **Purpose**: Link documents to Etherscan
- **Limitation**: Browser-specific, not persistent

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, JavaScript, Ethers.js |
| Backend | Go 1.21+, Gin Framework |
| Blockchain | Ethereum (Solidity 0.8.30) |
| Storage | MinIO / S3 |
| AI | Google Gemini (via LangChain) |
| PDF Processing | github.com/ledongthuc/pdf |

## Deployment Considerations

### Production Checklist
- [ ] Add authentication to backend endpoints
- [ ] Implement rate limiting
- [ ] Use environment-specific RPC URLs
- [ ] Secure MinIO with proper credentials
- [ ] Set up HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Use production Gemini API limits
- [ ] Deploy contract to mainnet
- [ ] Set up monitoring and logging
- [ ] Implement database for metadata
- [ ] Add backup strategy for MinIO

### Scalability
- **Backend**: Stateless, can scale horizontally
- **MinIO**: Can use S3 for unlimited storage
- **Blockchain**: Limited by gas costs and block time
- **AI**: Rate limited by Gemini API

## Future Enhancements
- Database for metadata persistence
- Event indexing (The Graph)
- Multi-chain support
- IPFS integration
- Document sharing/permissions
- Document versioning
- Full-text search
