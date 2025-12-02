package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type MinIOConfig struct {
	Endpoint   string
	AccessKey  string
	SecretKey  string
	BucketName string
}

func LoadMinIOConfig() MinIOConfig {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: could not load .env:", err)
	}

	cfg := MinIOConfig{
		Endpoint:   os.Getenv("MINIO_URL"),
		AccessKey:  os.Getenv("ACCESS_KEY"),
		SecretKey:  os.Getenv("SECRET_KEY"),
		BucketName: os.Getenv("MINIO_BUCKET"),
	}

	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" || cfg.BucketName == "" {
		log.Fatal("Missing MinIO environment variables")
	}

	return cfg
}

type EthConfig struct {
	RPCURL       string
	PrivateKey   string
	ContractAddr string
}

func LoadEthConfig() EthConfig {
	// .env ya cargado por LoadMinIOConfig o main, pero por seguridad:
	_ = godotenv.Load()

	cfg := EthConfig{
		RPCURL:       os.Getenv("ETH_RPC_URL"),
		PrivateKey:   os.Getenv("ETH_PRIVATE_KEY"),
		ContractAddr: os.Getenv("ETH_CONTRACT_ADDR"),
	}

	if cfg.RPCURL == "" || cfg.PrivateKey == "" || cfg.ContractAddr == "" {
		log.Println("Warning: Missing ETH environment variables. Blockchain features disabled.")
	}

	return cfg
}
