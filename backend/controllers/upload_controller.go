package controllers

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"main/services"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadFile(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archivo no recibido"})
		return
	}

	// metadata opcional
	tag := c.PostForm("tag")
	if tag == "" {
		tag = "unknown"
	}

	// abrir el archivo
	f, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se puede abrir el archivo"})
		return
	}
	defer f.Close()

	// leer todo en memoria (si tus archivos pueden ser grandes, usa streaming)
	data, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error leyendo el archivo"})
		return
	}

	// calcular hash SHA256
	h := sha256.Sum256(data)
	hashHex := hex.EncodeToString(h[:])

	// nombre único del objeto
	ext := filepath.Ext(fileHeader.Filename)
	objectName := fmt.Sprintf("docs/%d-%s%s", time.Now().Unix(), hashHex[:8], ext)

	// AI Analysis (solo si es PDF)
	var summary string
	if ext == ".pdf" {
		text, err := services.ExtractTextFromPDFBytes(data)
		if err != nil {
			log.Println("Error extracting text from PDF:", err)
		} else {
			// Limitar texto para no exceder tokens (ej. 2000 chars)
			if len(text) > 2000 {
				text = text[:2000]
			}
			summary, err = services.GenerateCompletion(text)
			if err != nil {
				log.Println("Error generating summary:", err)
				summary = "Error generating summary"
			}
		}
	}

	// subir a MinIO
	if err := services.UploadObject(objectName, data, fileHeader.Header.Get("Content-Type")); err != nil {
		log.Println("Error subiendo a MinIO:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error subiendo archivo"})
		return
	}

	// Prepare response
	response := gin.H{
		"object":   objectName,
		"hash":     hashHex,
		"bucket":   services.BucketName,
		"tag":      tag,
		"filename": fileHeader.Filename,
		"summary":  summary,
	}

	// Registrar en blockchain si el servicio está activo
	if services.Eth != nil {
		pk := os.Getenv("ETH_PRIVATE_KEY")
		if pk != "" {
			txHash, err := services.Eth.RegisterDocument(pk, fileHeader.Filename, hashHex, objectName, tag)
			if err != nil {
				log.Println("Error registrando en blockchain:", err)
				response["blockchain_error"] = err.Error()
			} else {
				log.Println("Documento registrado en blockchain. Tx:", txHash)
				response["tx_hash"] = txHash
				// Asumimos Sepolia por defecto para el ejemplo, o podríamos configurarlo.
				// El usuario pidió "la forma de comprobar".
				response["verification_url"] = fmt.Sprintf("https://sepolia.etherscan.io/tx/%s", txHash)
				response["verification_instruction"] = "Check the transaction hash on an Ethereum block explorer."
			}
		}
	}

	c.JSON(http.StatusOK, response)
}
