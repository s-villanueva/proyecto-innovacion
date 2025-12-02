package services

import "testing"

func TestSha256Hex(t *testing.T) {
    got := Sha256Hex([]byte("hello"))
    want := "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
    if got != want {
        t.Fatalf("Sha256Hex mismatch: got %s want %s", got, want)
    }
}
