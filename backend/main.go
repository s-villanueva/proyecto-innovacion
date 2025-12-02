package main

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"main/config"
	"main/routes"
	"main/services"

	"github.com/gin-gonic/gin"
)

func runUploadDemo() error {
	cfg := config.LoadMinIOConfig()
	services.InitMinIO(cfg)

	filePath := "mockuptest.pdf"
	data, err := os.ReadFile(filePath)
	if err != nil {
		return fmt.Errorf("read sample file: %w", err)
	}
	objectName := fmt.Sprintf("demo/%d-%s", time.Now().Unix(), filepath.Base(filePath))
	if err := services.UploadObject(objectName, data, "application/pdf"); err != nil {
		// Si falla la subida a MinIO (credenciales/endpoint), hacemos un fallback local
		fmt.Println("MinIO upload failed, falling back to local storage:", err)
		if err := os.MkdirAll("uploads", 0o755); err != nil {
			return fmt.Errorf("create uploads dir: %w", err)
		}
		localPath := filepath.Join("uploads", filepath.Base(objectName))
		if werr := os.WriteFile(localPath, data, 0o644); werr != nil {
			return fmt.Errorf("local write failed: %w (orig: %v)", werr, err)
		}
		fmt.Println("wrote local file:", localPath)
		// adjust objectName to point to local path for downstream steps
		objectName = localPath
	} else {
		fmt.Println("uploaded object:", objectName)
	}

	// Optional: try to register on-chain if env vars are set
	rpc := os.Getenv("ETH_RPC_URL")
	contractAddr := os.Getenv("ETH_CONTRACT_ADDR")
	pk := os.Getenv("ETH_PRIVATE_KEY")
	if rpc != "" && contractAddr != "" && pk != "" {
		ethSvc, err := services.NewEthService(rpc, contractAddr)
		if err != nil {
			return fmt.Errorf("init eth service: %w", err)
		}
		// compute hash
		hash := services.Sha256Hex(data)
		tx, err := ethSvc.RegisterDocument(pk, filepath.Base(filePath), hash, objectName, "demo")
		if err != nil {
			return fmt.Errorf("register document: %w", err)
		}
		fmt.Println("registered tx:", tx)
	} else {
		fmt.Println("ETH env not set; skipping on-chain registration")
	}
	return nil
}

func main() {
	if os.Getenv("DEMO_UPLOAD") == "1" {
		if err := runUploadDemo(); err != nil {
			fmt.Fprintln(os.Stderr, "demo failed:", err)
			os.Exit(1)
		}
		return
	}

	cfg := config.LoadMinIOConfig()
	services.InitMinIO(cfg)

	ethCfg := config.LoadEthConfig()
	services.InitEth(ethCfg)

	r := gin.Default()
	// CORS middleware for frontend
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.Static("/public", "./public")
	r.StaticFile("/", "./public/index.html")

	routes.RegisterRoutes(r)
	r.Run(":8080")
}
