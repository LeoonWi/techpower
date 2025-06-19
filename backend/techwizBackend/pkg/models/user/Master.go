package user

import "techwizBackend/pkg/models/category"

type Status string

const (
	Defualt Status = "defualt"
	Senior  Status = "senior"
	Premium Status = "premium"
)

func (s Status) IsValid() bool {
	switch s {
	case Defualt, Senior, Premium:
		return true
	default:
		return false
	}
}

type Master struct {
	Fullname    string              `json:"fullname,omitempty"`
	PhoneNumber string              `json:"phone_number,omitempty"`
	Password    string              `json:"password,omitempty"`
	Nickname    string              `json:"nickname,omitempty"`
	Photo       string              `json:"photo,omitempty"`
	Status      Status              `json:"status,omitempty"` // default, senior or premium
	Category    []category.Category `json:"category,omitempty"`
	Balance     float32             `json:"balance,omitempty"`
	Commission  int                 `json:"commission,omitempty"`
}
