package controllers

import (
	"fmt"
	"math/big"
	"net/http"
	"time"

	"main/services"
	"github.com/gin-gonic/gin"
)

// Inyecta servicios desde tu main/router
type DocumentController struct {
	Eth   *services.EthService
	// Private key to sign txs (owner)
	PrivateKey string
}

func NewDocumentController(ethSvc *services.EthService, pk string) *DocumentController {
	return &DocumentController{Eth: ethSvc, PrivateKey: pk}
}

// POST /documents/upload
// form-data: file (file), tag (string)
func (dc *DocumentController) UploadHandler(c *gin.Context) {
	// 1) recibir archivo multipart
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file required"})
		return
	}
	tag := c.PostForm("tag")
	if tag == "" {
		tag = "unknown"
	}

	// Opcional: nombre que usarás en MinIO
	objectName := fmt.Sprintf("docs/%d-%s", time.Now().Unix(), fileHeader.Filename)

	// 2) leer contenido y subir a MinIO mediante servicio
	f, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot open file", "details": err.Error()})
		return
	}
	defer f.Close()
	content := make([]byte, fileHeader.Size)
	_, err = f.Read(content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot read file", "details": err.Error()})
		return
	}
	// subir usando la función UploadObject del paquete services
	err = services.UploadObject(objectName, content, fileHeader.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "minio upload failed", "details": err.Error()})
		return
	}

	// 3) calcular hash SHA-256
	fileHash := services.Sha256Hex(content)

	// 4) llamar a contrato (transacción)
	txHash, err := dc.Eth.RegisterDocument(dc.PrivateKey, fileHeader.Filename, fileHash, objectName, tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "contract register failed", "details": err.Error()})
		return
	}

	// Responder con txHash y minio objectName
	c.JSON(http.StatusOK, gin.H{
		"message":    "uploaded and registered",
		"minioId":    objectName,
		"fileHash":   fileHash,
		"txHash":     txHash,
		"filename":   fileHeader.Filename,
		"timestamp":  time.Now().Unix(),
	})
}

// GET /documents/search?name=archivo.pdf
func (dc *DocumentController) SearchByName(c *gin.Context) {
	name := c.Query("name")
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name query required"})
		return
	}
	ids, err := dc.Eth.GetDocumentsByName(name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Convertir big.Ints a strings
	out := make([]string, len(ids))
	for i, id := range ids {
		out[i] = id.String()
	}
	c.JSON(http.StatusOK, gin.H{"ids": out})
}

// GET /documents/:id/verify?hash=...
func (dc *DocumentController) VerifyHandler(c *gin.Context) {
	idStr := c.Param("id")
	hash := c.Query("hash")
	if idStr == "" || hash == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id and hash required"})
		return
	}
	id := new(big.Int)
	id, ok := id.SetString(idStr, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	okVerify, err := dc.Eth.VerifyDocument(id, hash)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": idStr, "match": okVerify})
}
