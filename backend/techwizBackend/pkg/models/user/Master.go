package user

import "techwizBackend/pkg/models/category"

type Master struct {
	Fullname    string              `json:"fullname,omitempty"`
	PhoneNumber string              `json:"phone_number,omitempty"`
	Password    string              `json:"password,omitempty"`
	Nickname    string              `json:"nickname,omitempty"`
	Photo       string              `json:"photo,omitempty"`
	Status      int                 `json:"status,omitempty"`
	Category    []category.Category `json:"category,omitempty"`
	Balance     float32             `json:"balance,omitempty"`
	Commission  int                 `json:"commission,omitempty"`
}
