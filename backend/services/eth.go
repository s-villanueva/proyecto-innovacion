package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"math/big"

	"main/config"
	"main/contracts"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// EthService wraps the generated contract bindings and an ethclient client.
type EthService struct {
	Client   *ethclient.Client
	Contract *contracts.Contracts
	Address  common.Address
	ChainID  *big.Int
	Context  context.Context
}

var Eth *EthService

func InitEth(cfg config.EthConfig) {
	if cfg.RPCURL == "" || cfg.ContractAddr == "" {
		return
	}
	svc, err := NewEthService(cfg.RPCURL, cfg.ContractAddr)
	if err != nil {
		// Log error but don't crash, just disable eth features
		// log.Println("Error initializing EthService:", err)
		return
	}
	Eth = svc
}

func NewEthService(rpcURL, contractAddr string) (*EthService, error) {
	ctx := context.Background()
	client, err := ethclient.DialContext(ctx, rpcURL)
	if err != nil {
		return nil, err
	}
	chainID, err := client.ChainID(ctx)
	if err != nil {
		return nil, err
	}
	addr := common.HexToAddress(contractAddr)
	ctr, err := contracts.NewContracts(addr, client)
	if err != nil {
		return nil, err
	}
	return &EthService{
		Client:   client,
		Contract: ctr,
		Address:  addr,
		ChainID:  chainID,
		Context:  ctx,
	}, nil
}

// Sha256Hex calcula SHA256 y devuelve hex string
func Sha256Hex(b []byte) string {
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

// RegisterDocument sends a transaction to register the document and returns tx hash.
func (e *EthService) RegisterDocument(privateKeyHex, filename, fileHash, minioId, tag string) (string, error) {
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return "", err
	}

	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, e.ChainID)
	if err != nil {
		return "", err
	}

	tx, err := e.Contract.RegisterDocument(auth, filename, fileHash, minioId, tag)
	if err != nil {
		return "", err
	}
	return tx.Hash().Hex(), nil
}

// GetDocumentsByName (call)
func (e *EthService) GetDocumentsByName(name string) ([]*big.Int, error) {
	return e.Contract.GetDocumentsByName(&bind.CallOpts{Context: e.Context}, name)
}

// GetDocument (call)
func (e *EthService) GetDocument(id *big.Int) (contracts.FileDocument, error) {
	return e.Contract.GetDocument(&bind.CallOpts{Context: e.Context}, id)
}

// VerifyDocument (call)
func (e *EthService) VerifyDocument(id *big.Int, givenHash string) (bool, error) {
	return e.Contract.VerifyDocument(&bind.CallOpts{Context: e.Context}, id, givenHash)
}
