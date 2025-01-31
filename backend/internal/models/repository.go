package models

type Repository struct {
	ID             uint   `gorm:"primaryKey"`
	Name           string `gorm:"not null"`
	URL            string `gorm:"unique;not null"`
	CurrentVersion string
	LatestRelease  string
	LastUpdated    string
	Changelog      string
	PublishedAt    string
	LastScan       string
}
