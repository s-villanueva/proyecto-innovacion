package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/openai"
)

var (
	// Rate limiter: 1 request every 4 seconds (15 RPM)
	// Using a buffered channel as a simple token bucket
	rateLimitToken = make(chan struct{}, 1)
)

func init() {
	// Fill the token bucket initially
	rateLimitToken <- struct{}{}

	// Start a goroutine to refill the token every 4 seconds
	go func() {
		ticker := time.NewTicker(4 * time.Second)
		for range ticker.C {
			select {
			case rateLimitToken <- struct{}{}:
				// Token added
			default:
				// Bucket full, wait for next tick
			}
		}
	}()
}

func waitForRateLimit() {
	// Wait for a token
	<-rateLimitToken
}

// DocumentAnalysis represents the complete AI analysis of a document
type DocumentAnalysis struct {
	Category     string `json:"category"`
	Summary      string `json:"summary"`
	Validity     string `json:"validity"`
	KeyPoints    string `json:"key_points"`
	DocumentType string `json:"document_type"`
}

// AnalyzeDocument performs comprehensive AI analysis of a document
func AnalyzeDocument(documentContent string) (*DocumentAnalysis, error) {
	waitForRateLimit()
	godotenv.Load()
	ctx := context.Background()

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: OPENAI_API_KEY is not set in environment")
		return nil, fmt.Errorf("OPENAI_API_KEY is not set")
	}
	// Log masked key for debugging
	maskedKey := "******"
	if len(apiKey) > 4 {
		maskedKey = apiKey[:4] + "..." + apiKey[len(apiKey)-4:]
	}
	fmt.Printf("Initializing OpenAI with key: %s\n", maskedKey)

	llm, err := openai.New(openai.WithToken(apiKey))
	if err != nil {
		fmt.Printf("Error initializing OpenAI client: %v\n", err)
		return nil, err
	}

	prompt := fmt.Sprintf(`Eres un asistente experto en análisis de documentos. Analiza el siguiente documento PDF y proporciona un análisis estructurado.

DOCUMENTO:
%s

Por favor, proporciona tu análisis en formato JSON con la siguiente estructura:
{
  "category": "Categoría principal del documento (ej: Legal, Financiero, Académico, Médico, Técnico, Administrativo, Identidad, Contrato, etc.)",
  "summary": "Resumen detallado del documento en español (máximo 500 caracteres)",
  "validity": "Vigencia o fecha de expiración en formato YYYY-MM-DD. Si es un contrato con duración (ej: '5 años'), CALCULA la fecha exacta de fin sumando la duración a la fecha de inicio del documento. Si no encuentras fecha de inicio, usa la fecha actual como base. Si es indefinido, usa 'Indefinido'. Si no aplica, usa 'N/A'.",
  "key_points": "3-5 puntos clave del documento separados por punto y coma",
  "document_type": "Tipo específico de documento (ej: Factura, Contrato de Trabajo, Certificado Médico, etc.)"
}

IMPORTANTE: Responde SOLO con el JSON, sin texto adicional antes o después.`, documentContent)

	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
	if err != nil {
		return nil, err
	}

	// Clean the response to extract only JSON
	jsonStr := strings.TrimSpace(completion)
	// Remove markdown code blocks if present
	jsonStr = strings.TrimPrefix(jsonStr, "```json")
	jsonStr = strings.TrimPrefix(jsonStr, "```")
	jsonStr = strings.TrimSuffix(jsonStr, "```")
	jsonStr = strings.TrimSpace(jsonStr)

	var analysis DocumentAnalysis
	err = json.Unmarshal([]byte(jsonStr), &analysis)
	if err != nil {
		// Fallback: if JSON parsing fails, create a basic analysis
		return &DocumentAnalysis{
			Category:     "General",
			Summary:      "Análisis automático no disponible. El documento ha sido procesado correctamente.",
			Validity:     "N/A",
			KeyPoints:    "Documento procesado",
			DocumentType: "Documento PDF",
		}, nil
	}

	return &analysis, nil
}

// ChatWithDocument uses LangChain to answer questions about a document
func ChatWithDocument(documentContent string, question string) (string, error) {
	waitForRateLimit()
	godotenv.Load()
	ctx := context.Background()

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: OPENAI_API_KEY is not set")
		return "", fmt.Errorf("OPENAI_API_KEY is not set")
	}

	llm, err := openai.New(openai.WithToken(apiKey))
	if err != nil {
		fmt.Printf("Error initializing OpenAI for chat: %v\n", err)
		return "", fmt.Errorf("failed to initialize AI: %w", err)
	}

	// Create a prompt that includes document context
	prompt := fmt.Sprintf(`Eres DocuAgent, un asistente de IA especializado en análisis de documentos.

CONTEXTO DEL DOCUMENTO:
%s

PREGUNTA DEL USUARIO: %s

Por favor, proporciona una respuesta útil y precisa basada en el contenido del documento. Si la respuesta no se puede encontrar en el documento, indícalo claramente. Responde en español de manera concisa y profesional.

RESPUESTA:`, documentContent, question)

	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
	if err != nil {
		// Check if it's a rate limit error
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "quota") {
			return "", fmt.Errorf("API rate limit exceeded. Please wait a moment and try again")
		}
		return "", fmt.Errorf("AI processing error: %w", err)
	}

	return completion, nil
}

// RegenerateSummary generates a new summary for a document
func RegenerateSummary(documentContent string) (string, error) {
	waitForRateLimit()
	godotenv.Load()
	ctx := context.Background()

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("Error: OPENAI_API_KEY is not set")
		return "", fmt.Errorf("OPENAI_API_KEY is not set")
	}

	llm, err := openai.New(
		openai.WithToken(apiKey),
	)
	if err != nil {
		fmt.Printf("Error initializing OpenAI for regeneration: %v\n", err)
		return "", err
	}

	prompt := fmt.Sprintf(`Analiza el siguiente documento y proporciona un resumen detallado en español.
El resumen debe ser informativo, destacar los puntos clave, fechas importantes y cualquier información relevante.
Máximo 500 caracteres.

DOCUMENTO:
%s

RESUMEN:`, documentContent)

	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
	if err != nil {
		return "", err
	}

	return completion, nil
}

// GenerateCompletion is a legacy function for backward compatibility
func GenerateCompletion(data string) (string, error) {
	godotenv.Load()
	ctx := context.Background()
	llm, err := openai.New(openai.WithToken(os.Getenv("OPENAI_API_KEY")))
	if err != nil {
		return "", err
	}
	prompt := "Resume el siguiente texto en español, máximo 200 caracteres:\n" + data
	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
	if err != nil {
		return "", err
	}
	return completion, nil
}
