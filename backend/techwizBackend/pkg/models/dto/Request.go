package dto

import "time"

type Status struct {
	StatusCode int    `json:"status_code,omitempty"`
	Reason     string `json:"reason,omitempty"`
}

type Request struct {
	Id          string    `json:"id,omitempty"`
	Name        string    `json:"name,omitempty"`
	PhoneNumber string    `json:"phone_number,omitempty"`
	Address     string    `json:"address,omitempty"`
	Comment     string    `json:"comment,omitempty"`
	Price       float64   `json:"price,omitempty"`
	Status      Status    `json:"status,omitempty"`
	Files       []File    `json:"files,omitempty"`
	DateTime    time.Time `json:"datetime,omitempty"`
	Category    Category  `json:"category,omitempty"`
	CategoryId  string    `json:"category_id,omitempty"`
	Worker      User      `json:"worker,omitempty"`
	WorkerId    string    `json:"worker_id,omitempty"`
}
