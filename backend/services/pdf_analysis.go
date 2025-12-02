package services

import (
	"bytes"
	"github.com/ledongthuc/pdf"
)

// Extrae texto de PDF (sin OCR, si PDF es escaneado usar Tesseract)
func ExtractTextFromPDFBytes(data []byte) (string, error) {
	r := bytes.NewReader(data)
	reader, err := pdf.NewReader(r, int64(len(data)))
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	totalPage := reader.NumPage()
	for i := 1; i <= totalPage; i++ {
		page := reader.Page(i)
		if page.V.IsNull() {
			continue
		}
		ptext, err := page.GetPlainText(nil)
		if err != nil {
			// intentar continuar con el siguiente
			continue
		}
		buf.WriteString(ptext)
	}
	return buf.String(), nil
}
