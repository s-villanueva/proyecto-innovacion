package routes

import (
	"main/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r gin.IRouter, dc *controllers.DocumentController) {
	r.POST("/upload", dc.UploadHandler)
	r.GET("/preview/*filename", controllers.PreviewFile)
	r.GET("/documents", dc.ListDocuments)
	r.GET("/documents/:id/preview", dc.GetPreviewURL)
	r.POST("/documents/:id/chat", dc.ChatHandler)
	r.POST("/documents/:id/regenerate-summary", dc.RegenerateSummaryHandler)
	r.GET("/stats", dc.GetStats)
	r.DELETE("/documents/:id", dc.DeleteHandler)
}
