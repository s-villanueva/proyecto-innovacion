package main

import (
	"log"
	"main/config"
	"main/controllers"
	"main/routes"
	"main/services"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize JSON Metadata Store
	if err := services.InitMetadataStore("metadata.json"); err != nil {
		log.Fatal("Failed to init metadata store:", err)
	}

	// Initialize Storage (MinIO/S3)
	s3Cfg := config.LoadS3Config()
	services.InitStorage(s3Cfg)

	// Initialize Ethereum
	ethCfg := config.LoadEthConfig()
	services.InitEth(ethCfg)

	// Initialize text cache
	if err := services.InitTextCache(); err != nil {
		log.Println("Warning: could not initialize text cache:", err)
	}

	// Initialize Controller
	docController := controllers.NewDocumentController(services.Eth, ethCfg.PrivateKey, services.Store)

	// Setup Router
	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, ngrok-skip-browser-warning")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Register routes without authentication middleware
	routes.RegisterRoutes(r, docController)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
