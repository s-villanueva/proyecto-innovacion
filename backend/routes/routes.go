package routes

import (
	"main/controllers"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.POST("/upload", controllers.UploadFile)
	r.GET("/preview/*filename", controllers.PreviewFile)
}
