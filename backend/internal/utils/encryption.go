package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
)

func GenerateEncryptionKey() string {
	Logger.Info("Generating encryption key.")
	key := make([]byte, 32)
	if _, err := rand.Read(key); err != nil {
		Logger.Fatal("Failed to generate encryption key: ", err)
	}
	return base64.StdEncoding.EncodeToString(key)
}

func NormalizeAESKey(encodedKey string) ([]byte, error) {
	key, err := base64.StdEncoding.DecodeString(encodedKey)
	if err != nil {
		Logger.Error("Invalid base64-encoded AES key.")
		return nil, errors.New("invalid base64-encoded AES key")
	}
	if len(key) != 32 {
		Logger.Error("Invalid AES encryption key length.")
		return nil, errors.New("invalid AES encryption key length, must be 32 bytes")
	}
	return key, nil
}

func EncryptAES(plainText, encodedKey string) (string, error) {
	key, err := NormalizeAESKey(encodedKey)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		Logger.Error("Failed to create AES cipher block.")
		return "", err
	}

	nonce := make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		Logger.Error("Failed to generate nonce.")
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		Logger.Error("Failed to create GCM block cipher.")
		return "", err
	}

	cipherText := aesGCM.Seal(nil, nonce, []byte(plainText), nil)

	finalOutput := append(nonce, cipherText...)
	return base64.StdEncoding.EncodeToString(finalOutput), nil
}

func DecryptAES(cipherText, encodedKey string) (string, error) {
	if cipherText == "" || encodedKey == "" {
		Logger.Warn("Missing encrypted text or key for decryption.")
		return "", errors.New("missing encrypted text or key")
	}

	key, err := NormalizeAESKey(encodedKey)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		Logger.Error("Failed to create AES cipher block for decryption.")
		return "", err
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		Logger.Error("Failed to create GCM block cipher for decryption.")
		return "", err
	}

	decodedCipherText, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil {
		Logger.Error("Failed to decode base64 ciphertext.")
		return "", errors.New("invalid base64-encoded ciphertext")
	}

	if len(decodedCipherText) < 12+aesGCM.Overhead() {
		Logger.Error("Ciphertext too short to be valid.")
		return "", errors.New("invalid ciphertext length")
	}

	nonce, cipherData := decodedCipherText[:12], decodedCipherText[12:]

	plainText, err := aesGCM.Open(nil, nonce, cipherData, nil)
	if err != nil {
		Logger.Error("Failed to decrypt or verify the ciphertext.")
		return "", errors.New("decryption failed or authentication check failed")
	}

	return string(plainText), nil
}
