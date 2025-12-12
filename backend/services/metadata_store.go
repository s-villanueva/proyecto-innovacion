package services

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

type DocumentMetadata struct {
	ID                 string `json:"id"` // Blockchain ID (stringified) or MinIO object name if not on chain yet
	MinioID            string `json:"minioId"`
	Name               string `json:"name"`
	Size               string `json:"size"`
	Date               string `json:"date"`
	Hash               string `json:"hash"`
	AIStatus           string `json:"aiStatus"` // 'Processed' | 'Queued' | 'Failed'
	VerificationStatus string `json:"verificationStatus"`
	Type               string `json:"type"`
	Category           string `json:"category"`
	Summary            string `json:"summary"`
	Validity           string `json:"validity"`
	URL                string `json:"url"`
	Deleted            bool   `json:"deleted"`
}

type MetadataStore struct {
	FilePath string
	Data     map[string]DocumentMetadata
	mu       sync.RWMutex
}

var Store *MetadataStore

func InitMetadataStore(filePath string) error {
	Store = &MetadataStore{
		FilePath: filePath,
		Data:     make(map[string]DocumentMetadata),
	}
	return Store.Load()
}

func (s *MetadataStore) Load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	file, err := os.ReadFile(s.FilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil // Start empty
		}
		return err
	}

	return json.Unmarshal(file, &s.Data)
}

func (s *MetadataStore) Save() error {
	s.mu.RLock()
	defer s.mu.RUnlock()

	data, err := json.MarshalIndent(s.Data, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(s.FilePath, data, 0644)
}

func (s *MetadataStore) AddOrUpdate(meta DocumentMetadata) error {
	s.mu.Lock()
	s.Data[meta.ID] = meta
	s.mu.Unlock()
	return s.Save()
}

func (s *MetadataStore) Get(id string) (DocumentMetadata, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	meta, ok := s.Data[id]
	return meta, ok
}

func (s *MetadataStore) GetAll() []DocumentMetadata {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var list []DocumentMetadata
	for _, v := range s.Data {
		if !v.Deleted {
			list = append(list, v)
		}
	}
	return list
}

func (s *MetadataStore) Delete(id string) error {
	s.mu.Lock()
	if val, ok := s.Data[id]; ok {
		val.Deleted = true
		s.Data[id] = val
	}
	s.mu.Unlock()
	return s.Save()
}

func FormatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return string(bytes) + " B"
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func CurrentDate() string {
	return time.Now().Format("Jan 02, 2006")
}
