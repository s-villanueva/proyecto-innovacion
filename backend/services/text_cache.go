package services

import (
	"fmt"
	"os"
	"path/filepath"
)

const textCacheDir = "text_cache"

// InitTextCache creates the text cache directory if it doesn't exist
func InitTextCache() error {
	return os.MkdirAll(textCacheDir, 0755)
}

// SaveTextCache saves extracted PDF text to a cache file
func SaveTextCache(docID string, text string) error {
	filename := filepath.Join(textCacheDir, fmt.Sprintf("%s.txt", docID))
	return os.WriteFile(filename, []byte(text), 0644)
}

// GetTextCache retrieves cached PDF text
func GetTextCache(docID string) (string, error) {
	filename := filepath.Join(textCacheDir, fmt.Sprintf("%s.txt", docID))
	data, err := os.ReadFile(filename)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// DeleteTextCache removes a cached text file
func DeleteTextCache(docID string) error {
	filename := filepath.Join(textCacheDir, fmt.Sprintf("%s.txt", docID))
	return os.Remove(filename)
}
