package main

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/pkg/transport/http"
)

func main() {
	e := echo.New()
	http.New(e)
	err := e.Start(":8080")
	if err != nil {
		return
	}
}
