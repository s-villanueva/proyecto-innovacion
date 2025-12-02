package controllers

import (
	"context"
	"io"
	"log"
	"main/services"
	"mime"
	"net/http"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
)

func PreviewFile(c *gin.Context) {
	filename := c.Param("filename")
	log.Println("Preview requested for raw param:", filename)

	// Wildcard params often start with /, remove it
	if len(filename) > 0 && filename[0] == '/' {
		filename = filename[1:]
	}
	log.Println("Preview looking for MinIO object:", filename)

	if filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "filename required"})
		return
	}

	// Validar permiso: opcional consulta al smart contract
	// if !services.Eth.CanAccess(user, filename) { ... }

	obj, err := services.MinioClient.GetObject(context.Background(), services.BucketName, filename, minio.GetObjectOptions{})
	if err != nil {
		log.Println("MinIO GetObject error:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "archivo no encontrado"})
		return
	}

	// obtener stat/metadata
	stat, err := obj.Stat()
	if err != nil {
		log.Println("MinIO Stat error (file might not exist):", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "archivo no encontrado"})
		return
	}

	// fijar headers
	// fijar headers
	contentType := stat.ContentType
	if contentType == "" || contentType == "application/octet-stream" {
		// Try to guess from filename
		ext := filepath.Ext(filename)
		mimeType := mime.TypeByExtension(ext)
		if mimeType != "" {
			contentType = mimeType
		} else {
			contentType = "application/octet-stream"
		}
	}
	c.Header("Content-Type", contentType)
	c.Header("Content-Disposition", "inline; filename=\""+filename+"\"")
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Expires", "0")
	c.Status(http.StatusOK)

	// stream del objeto directamente al ResponseWriter
	_, err = io.Copy(c.Writer, obj)
	if err != nil {
		log.Println("Error streaming object:", err)
	}
}
