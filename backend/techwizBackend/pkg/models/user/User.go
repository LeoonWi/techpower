package user

type (
	IUser interface{}

	User struct {
		PhoneNumber string `json:"phone_number,omitempty"`
		Password    string `json:"password,omitempty"`
		Permission  int    `json:"permission,omitempty"`
	}
)
