package controllers

import (
	"log"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func PreviewFile(c *gin.Context) {
	filename := c.Param("filename")
	log.Println("Preview requested for raw param:", filename)

	// Wildcard params often start with /, remove it
	if len(filename) > 0 && filename[0] == '/' {
		filename = filename[1:]
	}
	log.Println("Preview looking for Storage object:", filename)

	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "filename required"})
		return
	}

	// Generate presigned URL
	url, err := services.GetPresignedURL(filename)
	if err != nil {
		log.Println("Error generating preview URL:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "archivo no encontrado"})
		return
	}

	// Redirect to the signed URL
	c.Redirect(http.StatusTemporaryRedirect, url)
}
