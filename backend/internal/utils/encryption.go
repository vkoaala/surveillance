package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
)

func GenerateEncryptionKey() string {
	Logger.Info("Generating encryption key.")
	key := make([]byte, 32)
	rand.Read(key)
	return base64.StdEncoding.EncodeToString(key)
}

func NormalizeAESKey(encodedKey string) ([]byte, error) {
	key, err := base64.StdEncoding.DecodeString(encodedKey)
	if err != nil || len(key) != 32 {
		Logger.Error("Invalid AES encryption key provided.")
		return nil, errors.New("invalid AES encryption key")
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

	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	rand.Read(iv)

	stream := cipher.NewCFBEncrypter(block, iv)
	stream.XORKeyStream(cipherText[aes.BlockSize:], []byte(plainText))

	return base64.StdEncoding.EncodeToString(cipherText), nil
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

	data, err := base64.StdEncoding.DecodeString(cipherText)
	if err != nil || len(data) < aes.BlockSize {
		Logger.Error("Invalid encrypted data provided.")
		return "", errors.New("invalid encrypted data")
	}

	iv := data[:aes.BlockSize]
	decrypted := make([]byte, len(data)-aes.BlockSize)

	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(decrypted, data[aes.BlockSize:])

	return string(decrypted), nil
}
