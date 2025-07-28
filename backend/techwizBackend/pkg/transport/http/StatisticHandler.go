package http

import (
	"github.com/labstack/echo/v4"
)

func (h Handler) getStatistics(c echo.Context) error {
	return c.JSON(h.services.StatisticService.Get())
}
