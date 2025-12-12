package controllers

import (
	"bytes"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"time"

	"main/services"

	"github.com/gin-gonic/gin"
)

// Inyecta servicios desde tu main/router
type DocumentController struct {
	Eth *services.EthService
	// Private key to sign txs (owner)
	PrivateKey string
	Store      *services.MetadataStore
}

func NewDocumentController(ethSvc *services.EthService, pk string, store *services.MetadataStore) *DocumentController {
	return &DocumentController{Eth: ethSvc, PrivateKey: pk, Store: store}
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
		tag = "General"
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

	// 5) Get document count for ID
	count, _ := dc.Eth.GetDocumentCount()
	if count == nil {
		count = big.NewInt(0)
	}
	docID := count.String()

	// 6) AI Processing - Enhanced analysis with category detection
	summary := "Pending analysis..."
	aiStatus := "Queued"
	category := tag // Default to user-provided tag
	validity := "N/A"

	// Extract text from PDF and perform comprehensive analysis
	text, err := services.ExtractTextFromPDFBytes(content)
	if err == nil && text != "" {
		// Save text to cache for fast future access
		if err := services.SaveTextCache(docID, text); err != nil {
			log.Println("Warning: failed to cache text:", err)
		}

		// Use enhanced AI analysis
		analysis, err := services.AnalyzeDocument(text)
		if err == nil && analysis != nil {
			summary = analysis.Summary
			category = analysis.Category // AI-detected category
			validity = analysis.Validity
			aiStatus = "Processed"
		} else {
			// Fallback to simple summary if analysis fails
			generatedSummary, err := services.GenerateCompletion(text)
			if err == nil {
				summary = generatedSummary
				aiStatus = "Processed"
			} else {
				aiStatus = "Failed"
			}
		}
	} else {
		aiStatus = "Failed"
	}

	// 7) Save Metadata
	meta := services.DocumentMetadata{
		ID:                 docID,
		MinioID:            objectName,
		Name:               fileHeader.Filename,
		Size:               services.FormatBytes(fileHeader.Size),
		Date:               services.CurrentDate(),
		Hash:               fileHash,
		AIStatus:           aiStatus,
		VerificationStatus: "Verified",
		Type:               "pdf",
		Category:           category, // AI-detected or user-provided
		Summary:            summary,
		Validity:           validity, // AI-detected validity
		URL:                "",
		Deleted:            false,
	}
	dc.Store.AddOrUpdate(meta)

	// Responder con txHash y minio objectName
	c.JSON(http.StatusOK, gin.H{
		"message":   "uploaded and registered",
		"minioId":   objectName,
		"fileHash":  fileHash,
		"txHash":    txHash,
		"filename":  fileHeader.Filename,
		"timestamp": time.Now().Unix(),
		"meta":      meta,
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

// GET /documents
func (dc *DocumentController) ListDocuments(c *gin.Context) {
	count, err := dc.Eth.GetDocumentCount()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get document count", "details": err.Error()})
		return
	}

	limit := count.Int64()
	var docs []services.DocumentMetadata

	// Loop backwards to show newest first
	for i := limit - 1; i >= 0; i-- {
		bigId := big.NewInt(i)
		idStr := bigId.String()

		// Check local store first
		meta, ok := dc.Store.Get(idStr)
		if ok {
			if !meta.Deleted {
				// Generate preview URL
				if meta.MinioID != "" {
					url, err := services.GetPresignedURL(meta.MinioID)
					if err == nil {
						meta.URL = url
					}
				}
				docs = append(docs, meta)
			}
			continue
		}

		// If not in local store (e.g. uploaded before metadata store was added), fetch from chain
		d, err := dc.Eth.GetDocument(bigId)
		if err != nil {
			continue
		}

		// Generate preview URL
		var url string
		if d.MinioId != "" {
			previewURL, err := services.GetPresignedURL(d.MinioId)
			if err == nil {
				url = previewURL
			}
		}

		// Create basic metadata from chain data
		meta = services.DocumentMetadata{
			ID:                 idStr,
			MinioID:            d.MinioId,
			Name:               d.Filename,
			Size:               "Unknown",
			Date:               time.Unix(d.Timestamp.Int64(), 0).Format("Jan 02, 2006"),
			Hash:               d.Hash,
			AIStatus:           "Queued",
			VerificationStatus: "Verified",
			Type:               "pdf", // Always PDF
			Category:           d.Tag,
			Summary:            "No summary available.",
			Validity:           "N/A",
			URL:                url,
			Deleted:            false,
		}
		// Save to store for next time
		dc.Store.AddOrUpdate(meta)
		docs = append(docs, meta)
	}

	c.JSON(http.StatusOK, docs)
}

// GET /stats
func (dc *DocumentController) GetStats(c *gin.Context) {
	docs := dc.Store.GetAll()
	total := len(docs)
	verified := 0
	aiInsights := 0

	for _, d := range docs {
		if d.VerificationStatus == "Verified" {
			verified++
		}
		if d.AIStatus == "Processed" {
			aiInsights++
		}
	}

	// Mock changes for demo
	stats := []gin.H{
		{"label": "Total Documents", "value": strconv.Itoa(total), "change": "+12%", "icon": "description"},
		{"label": "Blockchain Verified", "value": fmt.Sprintf("%d%%", 100), "change": "+0%", "icon": "verified_user"}, // Assuming all are verified if on chain
		{"label": "AI Insights", "value": strconv.Itoa(aiInsights), "change": "+5%", "icon": "auto_awesome"},
	}

	c.JSON(http.StatusOK, stats)
}

// DELETE /documents/:id
func (dc *DocumentController) DeleteHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}

	err := dc.Store.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

// GET /documents/:id/preview
func (dc *DocumentController) GetPreviewURL(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}

	meta, ok := dc.Store.Get(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Generate presigned URL for MinIO object
	url, err := services.GetPresignedURL(meta.MinioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate preview URL", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}

// POST /documents/:id/chat
func (dc *DocumentController) ChatHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}

	var req struct {
		Question string `json:"question"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	meta, ok := dc.Store.Get(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Try to get cached text first (fast path)
	// Try to get cached text first (fast path)
	documentText, err := services.GetTextCache(id)
	if err != nil {
		// Cache miss - fallback to downloading from Supabase and extracting (for old documents)
		log.Printf("Cache miss for document %s, downloading from Storage...", id)

		// Download from Storage using Presigned URL or direct download if public
		// Since we have GetPresignedURL, let's use that to get a URL and then download it
		url, err := services.GetPresignedURL(meta.MinioID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get download url", "details": err.Error()})
			return
		}

		resp, err := http.Get(url)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to download document", "details": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to download document", "details": resp.Status})
			return
		}

		// Read content
		buf := new(bytes.Buffer)
		_, err = buf.ReadFrom(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read document", "details": err.Error()})
			return
		}
		content := buf.Bytes()

		// Extract text from PDF
		documentText, err = services.ExtractTextFromPDFBytes(content)
		if err != nil {
			// Final fallback to summary
			documentText = meta.Summary
		} else {
			// Cache it for next time
			if cacheErr := services.SaveTextCache(id, documentText); cacheErr != nil {
				log.Printf("Warning: failed to cache text for document %s: %v", id, cacheErr)
			}
		}
	}

	// Use AI agent to answer question
	answer, err := services.ChatWithDocument(documentText, req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI processing failed", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"answer": answer})
}

// POST /documents/:id/regenerate-summary
func (dc *DocumentController) RegenerateSummaryHandler(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id required"})
		return
	}

	meta, ok := dc.Store.Get(id)
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "document not found"})
		return
	}

	// Try to get cached text first (fast path)
	documentText, err := services.GetTextCache(id)
	if err != nil {
		// Cache miss - fallback to downloading from Storage and extracting
		log.Printf("Cache miss for document %s, downloading from Storage...", id)

		url, err := services.GetPresignedURL(meta.MinioID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get download url", "details": err.Error()})
			return
		}

		resp, err := http.Get(url)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to download document", "details": err.Error()})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != 200 {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to download document", "details": resp.Status})
			return
		}

		// Read content
		buf := new(bytes.Buffer)
		_, err = buf.ReadFrom(resp.Body)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to read document", "details": err.Error()})
			return
		}
		content := buf.Bytes()

		// Extract text from PDF
		documentText, err = services.ExtractTextFromPDFBytes(content)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to extract text from PDF", "details": err.Error()})
			return
		}

		// Cache it for next time
		if cacheErr := services.SaveTextCache(id, documentText); cacheErr != nil {
			log.Printf("Warning: failed to cache text for document %s: %v", id, cacheErr)
		}
	}

	// Perform comprehensive AI analysis
	analysis, err := services.AnalyzeDocument(documentText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI processing failed", "details": err.Error()})
		return
	}

	// Update metadata with new analysis
	meta.Summary = analysis.Summary
	meta.Category = analysis.Category // Update category based on AI analysis
	meta.Validity = analysis.Validity
	meta.AIStatus = "Processed"
	dc.Store.AddOrUpdate(meta)

	c.JSON(http.StatusOK, gin.H{
		"summary":  analysis.Summary,
		"category": analysis.Category,
		"validity": analysis.Validity,
	})
}
