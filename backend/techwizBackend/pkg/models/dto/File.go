package dto

type File struct {
	Id          string `json:"id,omitempty"`
	Name        string `json:"name,omitempty"`
	Path        string `json:"path,omitempty"`
	ContentType string `json:"content_type,omitempty"`
}
