package services

import (
	"context"
	"os"

	"github.com/joho/godotenv"
	"github.com/tmc/langchaingo/llms"
	"github.com/tmc/langchaingo/llms/googleai"
)

func GenerateCompletion(data string) (string, error) {
	godotenv.Load()
	ctx := context.Background()
	llm, err := googleai.New(ctx, googleai.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		return "", err
	}
	prompt := "I want you to tell me what is this talking about in not more than 200 characters. Make sure to make it in Spanish\n" + data
	completion, err := llms.GenerateFromSinglePrompt(ctx, llm, prompt)
	if err != nil {
		return "", err
	}
	return completion, nil
}
