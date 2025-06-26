package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"techwizBackend/pkg/models"
)

type (
	IChatRepository interface {
		Create(chat *models.Chat) error
		GetRecipient(message *models.Message) []bson.ObjectID
		GetChatByMembers(member1 bson.ObjectID, member2 bson.ObjectID, chat *models.Chat) error
	}

	ChatRepository struct {
		db *mongo.Client
	}
)

func NewChatRepository(db *mongo.Client) *ChatRepository {
	return &ChatRepository{db: db}
}

func (r ChatRepository) Create(chat *models.Chat) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	res, err := coll.InsertOne(context.TODO(), chat)
	if err != nil {
		return errors.New("Failed to create chat")
	}
	insertedID := res.InsertedID.(bson.ObjectID)
	chat.Id = &insertedID
	return nil
}

func (r ChatRepository) GetRecipient(message *models.Message) []bson.ObjectID {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.D{{"_id", message.Chat}}
	var chat models.Chat
	if err := coll.FindOne(context.TODO(), filter).Decode(&chat); err != nil {
		return nil
	}
	return chat.MembersId
}

func (r ChatRepository) GetChatByMembers(
	member1 bson.ObjectID,
	member2 bson.ObjectID,
	chat *models.Chat,
) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"members_id": bson.M{
		"$all": []bson.ObjectID{member1, member2},
	}}
	if err := coll.FindOne(context.TODO(), filter).Decode(chat); err != nil {
		return errors.New("Chat not found")
	}
	return nil
}
