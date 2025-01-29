package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"log"
)

// Generate a new AES encryption key (32 bytes)
func GenerateEncryptionKey() string {
	key := make([]byte, 32)
	_, err := rand.Read(key)
	if err != nil {
		log.Println("❌ [Encryption] Failed to generate AES key:", err)
		return ""
	}
	return base64.StdEncoding.EncodeToString(key)
}

// Normalize and validate AES encryption key
func NormalizeAESKey(encodedKey string) ([]byte, error) {
	rawKey, err := base64.StdEncoding.DecodeString(encodedKey)
	if err != nil || len(rawKey) != 32 {
		log.Println("❌ [Encryption] Invalid AES key. Expected 32 bytes, got", len(rawKey))
		return nil, errors.New("invalid AES encryption key")
	}
	return rawKey, nil
}

// Encrypt a string using AES
func EncryptAES(plainText, encodedKey string) (string, error) {
	key, err := NormalizeAESKey(encodedKey)
	if err != nil {
		log.Println("❌ [Encryption] Encryption failed:", err)
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		log.Println("❌ [Encryption] AES cipher creation failed:", err)
		return "", err
	}

	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	_, err = rand.Read(iv)
	if err != nil {
		log.Println("❌ [Encryption] IV generation failed:", err)
		return "", err
	}

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(cipherText[aes.BlockSize:], []byte(plainText))

	encryptedText := base64.StdEncoding.EncodeToString(cipherText)
	return encryptedText, nil
}

// Decrypt a string using AES
func DecryptAES(cipherText, encodedKey string) (string, error) {
	if cipherText == "" || encodedKey == "" {
		log.Println("❌ [Decryption] Missing encrypted text or key")
		return "", errors.New("missing encrypted text or key")
	}

	key, err := NormalizeAESKey(encodedKey)
	if err != nil {
		log.Println("❌ [Decryption] Decryption failed:", err)
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		log.Println("❌ [Decryption] AES cipher creation failed:", err)
		return "", err
	}

	data, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil || len(data) < aes.BlockSize {
		log.Println("❌ [Decryption] Invalid encrypted data")
		return "", errors.New("invalid encrypted data")
	}

	iv := data[:aes.BlockSize]
	decrypted := make([]byte, len(data)-aes.BlockSize)

	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(decrypted, data[aes.BlockSize:])

	return string(decrypted), nil
}
