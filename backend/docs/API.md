# API Documentation

## Base URL
```
http://localhost:8080
```

## Endpoints

### 1. Upload Document

Upload a file to MinIO and register it on the blockchain.

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | The file to upload (PDF recommended) |
| tag | String | No | Document tag (e.g., "invoice", "contract") |

**Response:**
```json
{
  "object": "docs/1234567890-abcd1234.pdf",
  "hash": "a1b2c3d4...",
  "bucket": "documents",
  "tag": "invoice",
  "filename": "document.pdf",
  "summary": "AI-generated summary of the document...",
  "tx_hash": "0xabc123...",
  "verification_url": "https://sepolia.etherscan.io/tx/0xabc123...",
  "verification_instruction": "Check the transaction hash on an Ethereum block explorer."
}
```

**Example:**
```bash
curl -X POST http://localhost:8080/upload \
  -F "file=@document.pdf" \
  -F "tag=contract"
```

**Notes:**
- PDF files will have AI summaries generated automatically
- Blockchain registration happens in the backend (if ETH_PRIVATE_KEY is set)
- Frontend should also register via user's wallet for true ownership

---

### 2. Preview Document

Stream a document from MinIO for browser preview.

**Endpoint:** `GET /preview/{filename}`

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| filename | String | Yes | Full path to file (e.g., "docs/123.pdf") |

**Response:**
- Binary file stream
- Content-Type header set based on file extension
- Content-Disposition: inline (for browser preview)

**Example:**
```bash
curl http://localhost:8080/preview/docs/1234567890-abcd1234.pdf
```

**Frontend Usage:**
```javascript
const previewUrl = `/preview/${encodeURIComponent(minioId)}`;
window.open(previewUrl, '_blank');
```

---

## Smart Contract Functions

The frontend interacts directly with the smart contract for user ownership.

### Contract Address
```
0x4e9069579b5696f225C7D7cb859610bB0ce03c28 (Sepolia)
```

### ABI Functions

#### registerDocument
```solidity
function registerDocument(
    string filename,
    string fileHash,
    string minioId,
    string tag
) external onlyOwners returns (uint256 id)
```

**Frontend Example:**
```javascript
const tx = await contract.registerDocument(
    "document.pdf",
    "a1b2c3d4...",
    "docs/123.pdf",
    "invoice"
);
await tx.wait();
```

#### documentCount
```solidity
function documentCount() external view returns (uint256)
```

#### documents
```solidity
function documents(uint256 id) external view returns (
    address uploader,
    string filename,
    string hash,
    string minioId,
    string tag,
    uint256 timestamp
)
```

#### isOwner
```solidity
function isOwner(address account) external view returns (bool)
```

#### addOwner
```solidity
function addOwner(address newOwner) external onlyOwners
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Archivo no recibido"
}
```

### 404 Not Found
```json
{
  "error": "archivo no encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Error subiendo archivo"
}
```

---

## Rate Limits

Currently no rate limits are enforced. Consider implementing rate limiting for production.

---

## Authentication

- Backend endpoints: No authentication (consider adding for production)
- Smart contract: Requires wallet signature (Metamask)
- Only contract owners can register documents

---

## CORS

CORS is enabled for all origins (`*`). Update in production:

```go
c.Writer.Header().Set("Access-Control-Allow-Origin", "https://yourdomain.com")
```
