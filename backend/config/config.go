package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type S3Config struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	Region    string
}

func LoadS3Config() S3Config {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: could not load .env:", err)
	}

	cfg := S3Config{
		Endpoint:  os.Getenv("S3_ENDPOINT"),
		AccessKey: os.Getenv("AWS_ACCESS_KEY_ID"),
		SecretKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
		Bucket:    os.Getenv("S3_BUCKET"),
		Region:    os.Getenv("AWS_REGION"),
	}

	if cfg.Endpoint == "" || cfg.AccessKey == "" || cfg.SecretKey == "" || cfg.Bucket == "" {
		log.Fatal("Missing S3 environment variables")
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
