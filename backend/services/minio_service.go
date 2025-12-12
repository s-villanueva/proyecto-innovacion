package services

import (
	"bytes"
	"context"
	"log"
	"main/config"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

var MinioClient *minio.Client
var BucketName string

func InitMinIO(cfg config.MinIOConfig) {
	endpoint := cfg.Endpoint
	accessKey := cfg.AccessKey
	secretKey := cfg.SecretKey
	BucketName = cfg.BucketName

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: false, // cambia a true si usas TLS
	})
	if err != nil {
		log.Fatalf("Error inicializando MinIO: %v", err)
	}

	MinioClient = client

	ctx := context.Background()

	exists, err := MinioClient.BucketExists(ctx, BucketName)
	if err != nil {
		// No forzamos la salida: registramos el error y permitimos fallbacks en el caller
		log.Println("Warning: error comprobando bucket:", err)
		return
	}
	if !exists {
		err = MinioClient.MakeBucket(ctx, BucketName, minio.MakeBucketOptions{})
		if err != nil {
			log.Println("Warning: no se pudo crear el bucket", BucketName, ":", err)
			return
		}
		// opcional: esperar un poco
		time.Sleep(500 * time.Millisecond)
	}
}

func UploadObject(name string, data []byte, contentType string) error {
	_, err := MinioClient.PutObject(
		context.Background(),
		BucketName,
		name,
		bytes.NewReader(data),
		int64(len(data)),
		minio.PutObjectOptions{ContentType: contentType},
	)
	return err
}

// GetPresignedURL generates a temporary presigned URL for viewing/downloading a file
func GetPresignedURL(objectName string) (string, error) {
	// Generate presigned URL valid for 1 hour
	url, err := MinioClient.PresignedGetObject(
		context.Background(),
		BucketName,
		objectName,
		time.Hour*1,
		nil,
	)
	if err != nil {
		log.Println("Error generating presigned URL:", err)
		return "", err
	}
	return url.String(), nil
}
