package repository

import (
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"log"
	"os"
)

func New() *mongo.Client {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		if err := godotenv.Load(); err != nil {
			log.Fatal("Error loading .env file")
		}
		uri = os.Getenv("MONGODB_URI")
	}
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		log.Println(err)
		panic(err)
	}
	return client
}
