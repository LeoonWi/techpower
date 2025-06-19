package user

type SuperAdmin struct {
	Fullname    string `json:"fullname,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
	Password    string `json:"password,omitempty"`
}
