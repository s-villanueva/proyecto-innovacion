package services

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type SupabaseStore struct {
	DB *sql.DB
}

var DBStore *SupabaseStore

func InitSupabaseStore() error {
	connStr := os.Getenv("SUPABASE_DB_URL")
	if connStr == "" {
		return fmt.Errorf("SUPABASE_DB_URL is not set")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	if err := db.Ping(); err != nil {
		return err
	}

	log.Println("Connected to Supabase Postgres")
	DBStore = &SupabaseStore{DB: db}
	return nil
}

func (s *SupabaseStore) AddOrUpdate(meta DocumentMetadata, userID string) error {
	query := `
		INSERT INTO documents (id, user_id, minio_id, name, size, date, hash, ai_status, verification_status, doc_type, category, summary, validity, url, is_deleted)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		ON CONFLICT (id) DO UPDATE SET
			minio_id = EXCLUDED.minio_id,
			name = EXCLUDED.name,
			size = EXCLUDED.size,
			date = EXCLUDED.date,
			hash = EXCLUDED.hash,
			ai_status = EXCLUDED.ai_status,
			verification_status = EXCLUDED.verification_status,
			doc_type = EXCLUDED.doc_type,
			category = EXCLUDED.category,
			summary = EXCLUDED.summary,
			validity = EXCLUDED.validity,
			url = EXCLUDED.url,
			is_deleted = EXCLUDED.is_deleted;
	`
	_, err := s.DB.Exec(query,
		meta.ID, userID, meta.MinioID, meta.Name, meta.Size, meta.Date, meta.Hash,
		meta.AIStatus, meta.VerificationStatus, meta.Type, meta.Category, meta.Summary,
		meta.Validity, meta.URL, meta.Deleted,
	)
	return err
}

func (s *SupabaseStore) Get(id string, userID string) (DocumentMetadata, bool) {
	query := `SELECT id, minio_id, name, size, date, hash, ai_status, verification_status, doc_type, category, summary, validity, url, is_deleted 
	          FROM documents WHERE id = $1 AND user_id = $2 AND is_deleted = false`

	row := s.DB.QueryRow(query, id, userID)

	var meta DocumentMetadata
	err := row.Scan(
		&meta.ID, &meta.MinioID, &meta.Name, &meta.Size, &meta.Date, &meta.Hash,
		&meta.AIStatus, &meta.VerificationStatus, &meta.Type, &meta.Category, &meta.Summary,
		&meta.Validity, &meta.URL, &meta.Deleted,
	)

	if err == sql.ErrNoRows {
		return DocumentMetadata{}, false
	} else if err != nil {
		log.Println("Error fetching document:", err)
		return DocumentMetadata{}, false
	}

	return meta, true
}

func (s *SupabaseStore) GetAll(userID string) []DocumentMetadata {
	query := `SELECT id, minio_id, name, size, date, hash, ai_status, verification_status, doc_type, category, summary, validity, url, is_deleted 
	          FROM documents WHERE user_id = $1 AND is_deleted = false ORDER BY created_at DESC`

	rows, err := s.DB.Query(query, userID)
	if err != nil {
		log.Println("Error listing documents:", err)
		return []DocumentMetadata{}
	}
	defer rows.Close()

	var list []DocumentMetadata
	for rows.Next() {
		var meta DocumentMetadata
		if err := rows.Scan(
			&meta.ID, &meta.MinioID, &meta.Name, &meta.Size, &meta.Date, &meta.Hash,
			&meta.AIStatus, &meta.VerificationStatus, &meta.Type, &meta.Category, &meta.Summary,
			&meta.Validity, &meta.URL, &meta.Deleted,
		); err == nil {
			list = append(list, meta)
		}
	}
	return list
}

func (s *SupabaseStore) Delete(id string, userID string) error {
	query := `UPDATE documents SET is_deleted = true WHERE id = $1 AND user_id = $2`
	_, err := s.DB.Exec(query, id, userID)
	return err
}

// Helper to get stats
func (s *SupabaseStore) GetStats(userID string) (int, int, int) {
	var total, verified, ai int

	// Total
	s.DB.QueryRow("SELECT COUNT(*) FROM documents WHERE user_id = $1 AND is_deleted = false", userID).Scan(&total)

	// Verified (assuming 'Verified' status)
	s.DB.QueryRow("SELECT COUNT(*) FROM documents WHERE user_id = $1 AND is_deleted = false AND verification_status = 'Verified'", userID).Scan(&verified)

	// AI Insights (assuming summary is not empty)
	s.DB.QueryRow("SELECT COUNT(*) FROM documents WHERE user_id = $1 AND is_deleted = false AND summary != ''", userID).Scan(&ai)

	return total, verified, ai
}
