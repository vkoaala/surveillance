package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"io"

	"golang.org/x/crypto/pbkdf2"
)

var derivedKey []byte
var saltValue string

func SetEncryptionParameters(secret, salt string) {
	derivedKey = pbkdf2.Key([]byte(secret), []byte(salt), 10000, 32, sha256.New)
	saltValue = salt
}

func GetSalt() string {
	return saltValue
}

func GenerateRandomSalt(length int) (string, error) {
	salt := make([]byte, length)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(salt), nil
}

func EncryptAES(plainText string) (string, error) {
	if derivedKey == nil {
		return "", errors.New("encryption key not set")
	}
	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	cipherText := aesGCM.Seal(nil, nonce, []byte(plainText), nil)
	finalOutput := append(nonce, cipherText...)
	return base64.StdEncoding.EncodeToString(finalOutput), nil
}

func DecryptAES(cipherText string) (string, error) {
	if derivedKey == nil {
		return "", errors.New("encryption key not set")
	}
	block, err := aes.NewCipher(derivedKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	decoded, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		return "", errors.New("invalid base64 ciphertext")
	}
	if len(decoded) < 12+aesGCM.Overhead() {
		return "", errors.New("invalid ciphertext length")
	}
	nonce, data := decoded[:12], decoded[12:]
	plainText, err := aesGCM.Open(nil, nonce, data, nil)
	if err != nil {
		return "", errors.New("decryption failed or authentication check failed")
	}
	return string(plainText), nil
}
