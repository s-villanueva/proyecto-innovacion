package main

import (
	"fmt"

	"main/config"
	"main/controllers"
	"main/routes"
	"main/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Demo upload removed as it depended on MinIO SDK

	cfg := config.LoadS3Config()
	services.InitStorage(cfg)

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

	// Init Metadata Store
	if err := services.InitMetadataStore("metadata.json"); err != nil {
		fmt.Println("Warning: could not load metadata store:", err)
	}

	// Init Text Cache
	if err := services.InitTextCache(); err != nil {
		fmt.Println("Warning: could not initialize text cache:", err)
	}

	dc := controllers.NewDocumentController(services.Eth, ethCfg.PrivateKey, services.Store)
	routes.RegisterRoutes(r, dc)
	r.Run(":8080")
}
