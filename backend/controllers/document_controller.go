package controllers

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"main/services"

	"github.com/gin-gonic/gin"
)

type DocumentController struct {
	Eth        *services.EthService
	PrivateKey string
	Store      *services.MetadataStore
}

func NewDocumentController(eth *services.EthService, privateKey string, store *services.MetadataStore) *DocumentController {
	return &DocumentController{
		Eth:        eth,
		PrivateKey: privateKey,
		Store:      store,
	}
}

func (dc *DocumentController) UploadHandler(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	tag := c.PostForm("tag")
	if tag == "" {
		tag = "General"
	}

	// Read file content
	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot open file"})
		return
	}
	defer file.Close()

	content, err := io.ReadAll(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read file"})
		return
	}

	// 1. Upload to storage
	objectName := fmt.Sprintf("docs/%d-%s", c.Request.Context().Value("timestamp"), fileHeader.Filename)
	err = services.UploadObject(objectName, content, fileHeader.Header.Get("Content-Type"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Storage upload failed"})
		return
	}

	// 2. Calculate hash
	fileHash := services.Sha256Hex(content)

	// 3. Register on blockchain
	txHash := ""
	if dc.Eth != nil {
		txHash, err = dc.Eth.RegisterDocument(dc.PrivateKey, fileHeader.Filename, fileHash, objectName, tag)
		if err != nil {
			log.Printf("Blockchain registration failed: %v\n", err)
		}
	}

	// 4. AI Analysis
	summary := "Pending analysis..."
	category := tag
	validity := "N/A"
	aiStatus := "Queued"

	text, err := services.ExtractTextFromPDFBytes(content)
	if err == nil && text != "" {
		analysis, err := services.AnalyzeDocument(text)
		if err == nil && analysis != nil {
			summary = analysis.Summary
			category = analysis.Category
			validity = analysis.Validity
			aiStatus = "Processed"
		} else {
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

	// 5. Generate document ID
	docID := fmt.Sprintf("%d", c.Request.Context().Value("timestamp"))
	if dc.Eth != nil {
		count, _ := dc.Eth.GetDocumentCount()
		if count != nil {
			docID = count.String()
		}
	}

	// 6. Save metadata
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
		Category:           category,
		Summary:            summary,
		Validity:           validity,
		URL:                "",
		Deleted:            false,
	}

	err = dc.Store.AddOrUpdate(meta)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save metadata"})
		return
	}

	// Cache text for future use
	if aiStatus == "Processed" && text != "" {
		if cacheErr := services.SaveTextCache(docID, text); cacheErr != nil {
			log.Println("Warning: failed to cache text:", cacheErr)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Upload successful",
		"id":      docID,
		"txHash":  txHash,
		"meta":    meta,
	})
}

func (dc *DocumentController) ListDocuments(c *gin.Context) {

	docs := dc.Store.GetAll()

	// Enrich with Presigned URLs
	for i := range docs {
		url, err := services.GetPresignedURL(docs[i].MinioID)
		if err == nil {
			docs[i].URL = url
		}
	}

	c.JSON(http.StatusOK, docs)
}

func (dc *DocumentController) GetStats(c *gin.Context) {
	docs := dc.Store.GetAll()

	total := len(docs)
	verified := 0
	ai := 0

	for _, doc := range docs {
		if doc.VerificationStatus == "Verified" {
			verified++
		}
		if doc.AIStatus == "Processed" && doc.Summary != "" {
			ai++
		}
	}

	stats := []gin.H{
		{"label": "Total Documents", "value": strconv.Itoa(total), "change": "+0%", "icon": "description"},
		{"label": "Blockchain Verified", "value": strconv.Itoa(verified), "change": "+0%", "icon": "verified_user"},
		{"label": "AI Insights", "value": strconv.Itoa(ai), "change": "+0%", "icon": "auto_awesome"},
	}
	c.JSON(http.StatusOK, stats)
}

func (dc *DocumentController) DeleteHandler(c *gin.Context) {
	id := c.Param("id")

	if err := dc.Store.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete document"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Document deleted"})
}

func (dc *DocumentController) GetPreviewURL(c *gin.Context) {
	id := c.Param("id")

	meta, found := dc.Store.Get(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	url, err := services.GetPresignedURL(meta.MinioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate preview URL"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}

// POST /documents/:id/regenerate-summary
func (dc *DocumentController) RegenerateSummaryHandler(c *gin.Context) {
	id := c.Param("id")

	meta, found := dc.Store.Get(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Try to get cached text first
	documentText, err := services.GetTextCache(id)
	if err != nil {
		// Cache miss - return error as we need full text for re-analysis
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Document text not available for re-analysis"})
		return
	}

	// Perform comprehensive AI analysis
	analysis, err := services.AnalyzeDocument(documentText)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI processing failed"})
		return
	}

	// Update metadata with new analysis
	meta.Summary = analysis.Summary
	meta.Category = analysis.Category
	meta.Validity = analysis.Validity
	meta.AIStatus = "Processed"
	dc.Store.AddOrUpdate(meta)

	c.JSON(http.StatusOK, gin.H{
		"summary":  analysis.Summary,
		"category": analysis.Category,
		"validity": analysis.Validity,
	})
}

func (dc *DocumentController) ChatHandler(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Question string `json:"question"`
	}
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	meta, found := dc.Store.Get(id)
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "Document not found"})
		return
	}

	// Try to get cached text first
	documentText, err := services.GetTextCache(id)
	if err != nil {
		// Cache miss - use summary as fallback
		log.Printf("Cache miss for document %s, using summary", id)
		documentText = meta.Summary
	}

	// Use AI to answer question
	answer, err := services.ChatWithDocument(documentText, req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "AI processing failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"answer": answer})
}
