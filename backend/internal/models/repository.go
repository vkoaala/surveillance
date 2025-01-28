package models

type Repository struct {
	ID             uint   `gorm:"primaryKey"`
	Name           string `gorm:"not null"`
	URL            string `gorm:"unique;not null"`
	CurrentVersion string
	LatestRelease  string
	LastUpdated    string // Date of the latest release
	Changelog      string // Markdown-formatted release notes
	PublishedAt    string // Release date of LatestRelease
	LastScan       string // Last backend scan timestamp
}
