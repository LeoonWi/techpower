package userDTO

type User struct {
	Id          string `json:"id,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
	Password    string `json:"password,omitempty"`
	Permission  string `json:"permission,omitempty"`
}
