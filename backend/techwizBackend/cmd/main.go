package main

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/handler"
)

func main() {
	e := echo.New()
	handler.New(e)
	conn := "mongodb://admin:admin@localhost:27017/"
	e.Start(":8080")
}
