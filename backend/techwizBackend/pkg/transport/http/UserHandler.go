package http

import (
	"github.com/labstack/echo/v4"
	"go.mongodb.org/mongo-driver/v2/bson"
	"net/http"
	"techwizBackend/pkg/models"
)

func (h Handler) changePassword(c echo.Context) error {
	var user models.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid request body"},
		)
	}

	// validation data
	if len(user.Id.Hex()) < 24 || len(user.Password) < 6 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid id or password"})
	}

	status := 0
	if err := h.services.UserService.ChangePassword(&user, &status); err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(
		status,
		map[string]string{"status": "ok"},
	)
}

func (h Handler) changePermission(c echo.Context) error {
	var err error
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid id"})
	}
	permissionOld := c.Param("permissionOld")
	permissionNew := c.Param("permissionNew")

	var status int
	if err := h.services.UserService.ChangePermission(id, permissionOld, permissionNew, &status); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(
		status,
		map[string]string{"status": "ok"},
	)
}

func (h Handler) getUser(c echo.Context) error {
	id := c.Param("id")
	if len(id) < 24 {
		return c.JSON(
			http.StatusBadRequest,
			map[string]string{"error": "Invalid id"},
		)
	}

	var status int
	var user models.User
	if err := h.services.UserService.GetUser(id, &user, &status); err != nil {
		return c.JSON(
			status,
			map[string]string{"error": err.Error()},
		)
	}

	return c.JSON(status, user)
}

func (h Handler) getUsers(c echo.Context) error {
	return c.JSON(
		http.StatusOK,
		h.services.UserService.GetUsers(),
	)
}

func (h Handler) getMasters(c echo.Context) error {
	return c.JSON(
		http.StatusOK,
		h.services.UserService.GetMasters(),
	)
}

func (h Handler) addUserCategory(c echo.Context) error {
	idUser, err := bson.ObjectIDFromHex(c.QueryParam("user"))
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid id"},
		)
	}
	idCategory, err := bson.ObjectIDFromHex(c.QueryParam("category"))
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid category"},
		)
	}

	if status, err := h.services.UserService.AddCategory(idUser, idCategory); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]bson.ObjectID{"added": idCategory})
}

func (h Handler) removeUserCategory(c echo.Context) error {
	idUser, err := bson.ObjectIDFromHex(c.QueryParam("user"))
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid id"},
		)
	}
	idCategory, err := bson.ObjectIDFromHex(c.QueryParam("category"))
	if err != nil {
		return c.JSON(
			http.StatusUnprocessableEntity,
			map[string]string{"error": "Invalid category"},
		)
	}

	if status, err := h.services.UserService.RemoveCategory(idUser, idCategory); err != nil {
		return c.JSON(status, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]bson.ObjectID{"remove": idCategory})
}

func (h Handler) changeStatus(c echo.Context) error {
	var err error
	id, err := bson.ObjectIDFromHex(c.QueryParam("id"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid id"})
	}
	event := c.QueryParam("event")
	status := c.QueryParam("status")

	code, err := h.services.UserService.ChangeStatus(id, event, status)
	if err != nil {
		return c.JSON(code, map[string]string{"error": err.Error()})
	}

	return c.JSON(code, map[string]string{"status": "ok"})
}

func (h Handler) dismissUser(c echo.Context) error {
	id, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusUnprocessableEntity, map[string]string{"error": "Invalid id"})
	}

	if status, err := h.services.UserService.DismissUser(id); err != nil {
		return c.JSON(status, map[string]string{"err": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]bson.ObjectID{"dismissed": id})
}

func (h Handler) updateUser(c echo.Context) error {
	userId, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "Invalid user ID"})
	}

	var user models.User
	if err := c.Bind(&user); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}

	if user.Nickname == "" && user.PhoneNumber == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": "At least one field (nickname or phone_number) must be provided"})
	}

	if err := h.services.UserService.UpdateUser(userId, &user); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"status": "ok"})
}
