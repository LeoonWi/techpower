package http

import (
	"github.com/labstack/echo/v4"
	"net/http"
	"strconv"
)

func (h Handler) getStatistics(c echo.Context) error {
	days, err := strconv.Atoi(c.Param("days"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "days must be integer"})
	}
	return c.JSON(h.services.StatisticService.Get(days))
}
