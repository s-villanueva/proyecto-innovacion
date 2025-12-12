package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"main/services"

	"github.com/joho/godotenv"
)

func main() {
	// 1. Load .env from project root
	cwd, _ := os.Getwd()
	envPath := filepath.Join(cwd, "../../.env")
	if err := godotenv.Load(envPath); err != nil {
		// Try loading from current dir as fallback
		if err := godotenv.Load(); err != nil {
			log.Printf("Warning: .env not found at %s or current dir", envPath)
		}
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		log.Fatal("OPENAI_API_KEY is not set")
	}
	// Print first 5 chars to verify it's the NEW key
	maskedKey := apiKey
	if len(apiKey) > 5 {
		maskedKey = apiKey[:5] + "..." + apiKey[len(apiKey)-3:]
	}
	fmt.Printf("Using API Key: %s (Length: %d)\n", maskedKey, len(apiKey))

	// 2. Test AnalyzeDocument
	fmt.Println("\n--- Testing AnalyzeDocument ---")
	dummyText := "Este es un contrato de arrendamiento válido desde el 1 de enero de 2024 hasta el 31 de diciembre de 2024. Las partes acuerdan el pago mensual de 1000 USD."
	analysis, err := services.AnalyzeDocument(dummyText)
	if err != nil {
		fmt.Printf("AnalyzeDocument FAILED: %v\n", err)
	} else {
		fmt.Printf("AnalyzeDocument SUCCESS:\nCategory: %s\nSummary: %s\nValidity: %s\n",
			analysis.Category, analysis.Summary, analysis.Validity)
	}

	// 3. Test ChatWithDocument
	fmt.Println("\n--- Testing ChatWithDocument ---")
	question := "What is the monthly payment?"
	answer, err := services.ChatWithDocument(dummyText, question)
	if err != nil {
		fmt.Printf("ChatWithDocument FAILED: %v\n", err)
	} else {
		fmt.Printf("ChatWithDocument SUCCESS:\nAnswer: %s\n", answer)
	}
}
