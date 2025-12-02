# Setup Guide

## Prerequisites

### 1. Go Installation
```bash
# Install Go 1.21 or higher
# Visit: https://golang.org/dl/
go version  # Verify installation
```

### 2. MinIO Setup

**Option A: Docker (Recommended)**
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"
```

**Option B: Local Installation**
- Download from https://min.io/download
- Follow installation instructions for your OS

**Create Bucket:**
1. Open MinIO Console: `http://localhost:9001`
2. Login with credentials
3. Create bucket named `documents`

### 3. Ethereum Setup

1. **Get Sepolia ETH**
   - Install Metamask: https://metamask.io/
   - Switch to Sepolia network
   - Get test ETH from faucet: https://sepoliafaucet.com/

2. **Infura Account**
   - Sign up at https://infura.io/
   - Create new project
   - Copy Sepolia RPC URL

3. **Deploy Contract** (if needed)
   ```bash
   # Contract is already deployed at:
   # 0x4e9069579b5696f225C7D7cb859610bB0ce03c28
   ```

### 4. Google Gemini API

1. Visit https://makersuite.google.com/app/apikey
2. Create API key
3. Copy key for `.env` file

## Configuration

1. **Copy environment template**
```bash
cp .env.example .env
```

2. **Edit `.env` file**
```env
# MinIO
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=documents

# Ethereum
ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ETH_CONTRACT_ADDR=0x4e9069579b5696f225C7D7cb859610bB0ce03c28
ETH_PRIVATE_KEY=your_private_key  # Backend signing (optional)

# AI
GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

### Development Mode
```bash
go run main.go
```

### Build and Run
```bash
go build -o server main.go
./server
```

### Demo Mode (Test Blockchain Integration)
```bash
DEMO_UPLOAD=1 go run main.go
```

## Accessing the Application

1. **Frontend**: http://localhost:8080
2. **Upload Endpoint**: http://localhost:8080/upload
3. **Preview Endpoint**: http://localhost:8080/preview/{filename}

## Using the Frontend

1. Open http://localhost:8080 in browser
2. Click "Connect Wallet" (Metamask required)
3. Switch to Sepolia network if prompted
4. Upload a PDF file
5. Confirm transaction in Metamask
6. View your documents in the list

## Troubleshooting

### MinIO Connection Failed
- Verify MinIO is running: `curl http://localhost:9000/minio/health/live`
- Check credentials in `.env`
- Ensure bucket exists

### Blockchain Transaction Failed
- Check you have Sepolia ETH
- Verify RPC URL is correct
- Check contract address

### Nonce Too Low Error
- Reset Metamask account: Settings → Advanced → Reset Account

### AI Summary Not Working
- Verify GEMINI_API_KEY is valid
- Check API quota/limits
- Ensure PDF is valid format

## Testing

```bash
# Run tests
go test ./...

# Test specific service
go test ./services -v

# Test blockchain integration
go run cmd/test_eth/main.go
```

## Next Steps

- Read [API.md](API.md) for endpoint documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Review smart contract in `contracts/Files.sol`
