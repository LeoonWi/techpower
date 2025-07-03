package http

import (
	"github.com/labstack/echo/v4"
	"techwizBackend/pkg/service"
	"techwizBackend/pkg/transport/ws"
)

type Handler struct {
	services *service.Service
}

func New(e *echo.Echo, service *service.Service, websocketConn *ws.WebsocketConnection) *Handler {
	h := Handler{services: service}

	auth := e.Group("auth")
	auth.POST("/signup", h.signup)
	auth.POST("/signin", h.signin)

	category := e.Group("category")
	category.POST("", h.createCategory)   // DONE
	category.GET("", h.getCategory)       // DONE
	category.PUT("", h.renameCategory)    // DONE
	category.DELETE("", h.removeCategory) // DONE

	user := e.Group("user")
	user.PATCH("/changepassword", h.changePassword)     // DONE
	user.PATCH("/changepermission", h.changePermission) // DONE
	user.GET("/:id", h.getUser)
	user.GET("", h.getUsers)
	user.PATCH("/category/add", h.addUserCategory)       // DONE
	user.PATCH("/category/remove", h.removeUserCategory) // DONE

	chat := e.Group("chat")
	chat.POST("/create/:member1/:member2", h.createChat)  // DONE
	chat.POST("/:idChat/:idUser", h.addUserToChat)        // DONE
	chat.DELETE("/:idChat/:idUser", h.removeUserFromChat) // DONE
	chat.GET("/:userId", h.getChats)                      // DONE
	//chat.GET("/:member1/:member2", h.getChatByMember)     // DONE

	request := e.Group("request")
	request.POST("/create", h.createRequest)

	e.GET("/ws", func(c echo.Context) error {
		return websocketConn.Ws(c)
	}) // DONE ???

	return &h
}
