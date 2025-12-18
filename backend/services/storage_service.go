package services

import (
	"bytes"
	"fmt"
	"main/config"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

var (
	S3Client      *s3.S3
	StorageBucket string
)

func InitStorage(cfg config.S3Config) {
	StorageBucket = cfg.Bucket

	// Configure AWS Session
	sess, err := session.NewSession(&aws.Config{
		Region:           aws.String(cfg.Region),
		Endpoint:         aws.String(cfg.Endpoint),
		Credentials:      credentials.NewStaticCredentials(cfg.AccessKey, cfg.SecretKey, ""),
		S3ForcePathStyle: aws.Bool(true), // Required for Supabase/MinIO
	})
	if err != nil {
		panic(fmt.Sprintf("Failed to create AWS session: %v", err))
	}

	S3Client = s3.New(sess)
	fmt.Println("S3 Storage initialized with endpoint:", cfg.Endpoint)
}

// UploadObject uploads a file to S3
func UploadObject(name string, data []byte, contentType string) error {
	_, err := S3Client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(StorageBucket),
		Key:         aws.String(name),
		Body:        bytes.NewReader(data),
		ContentType: aws.String(contentType),
	})
	return err
}

// GetPresignedURL generates a signed URL for a file (valid for 1 hour)
func GetPresignedURL(objectName string) (string, error) {
	req, _ := S3Client.GetObjectRequest(&s3.GetObjectInput{
		Bucket: aws.String(StorageBucket),
		Key:    aws.String(objectName),
	})

	urlStr, err := req.Presign(1 * time.Hour)
	if err != nil {
		return "", err
	}
	return urlStr, nil
}

// DownloadObject retrieves a file from S3
func DownloadObject(name string) ([]byte, error) {
	resp, err := S3Client.GetObject(&s3.GetObjectInput{
		Bucket: aws.String(StorageBucket),
		Key:    aws.String(name),
	})
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	buf := new(bytes.Buffer)
	_, err = buf.ReadFrom(resp.Body)
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}
