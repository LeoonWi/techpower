package repository

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"log"
	"techwizBackend/pkg/models"
)

type (
	IChatRepository interface {
		Create(chat *models.Chat) error
		GetRecipient(message *models.Message) []bson.ObjectID
		GetChatByMembers(member1 bson.ObjectID, member2 bson.ObjectID, chat *models.Chat) error
		RenameByCategory(id bson.ObjectID, name string) error
		RemoveByCategory(id bson.ObjectID) error
		GetChats(idUser bson.ObjectID, chats *[]models.Chat) error
		GetChatById(id bson.ObjectID, chat *models.Chat) error
		GetChatByCategory(id bson.ObjectID, chat *models.Chat) error
		AddUser(idUser bson.ObjectID, idChat bson.ObjectID) error
		RemoveUser(idUser bson.ObjectID, idChat bson.ObjectID) error
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

func (r ChatRepository) GetChatByMembers(member1 bson.ObjectID, member2 bson.ObjectID, chat *models.Chat) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"members_id": bson.M{
		"$all": []bson.ObjectID{member1, member2},
	}}
	if err := coll.FindOne(context.TODO(), filter).Decode(chat); err != nil {
		return errors.New("Chat not found")
	}
	return nil
}

func (r ChatRepository) RenameByCategory(id bson.ObjectID, name string) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"category_id": id}
	update := bson.M{"$set": bson.M{"name": name}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return errors.New("Failed to rename chat")
	}

	return nil
}

func (r ChatRepository) RemoveByCategory(id bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"category_id": id}

	if _, err := coll.DeleteOne(context.TODO(), filter); err != nil {
		return errors.New("Failed to remove chat")
	}
	return nil
}

func (r ChatRepository) GetChats(idUser bson.ObjectID, chats *[]models.Chat) error {
	collChats := r.db.Database("TechPower").Collection("Chats")
	collUsers := r.db.Database("TechPower").Collection("Users")
	filter := bson.M{"members_id": idUser}
	cursor, err := collChats.Find(context.TODO(), filter)
	if err != nil {
		return errors.New("Chats not found")
	}
	defer cursor.Close(context.TODO())

	if err = cursor.All(context.TODO(), chats); err != nil {
		return errors.New("Failed to get chats")
	}

	for i, chat := range *chats {
		if chat.Name == "" && len(chat.MembersId) == 2 {
			var user models.User
			var id bson.ObjectID
			if idUser == chat.MembersId[0] {
				id = chat.MembersId[1]
			} else {
				id = chat.MembersId[0]
			}
			filter := bson.M{"_id": id}
			err := collUsers.FindOne(context.TODO(), filter).Decode(&user)
			if err != nil {
				log.Println(err.Error())
				continue
			}
			(*chats)[i].Name = user.FullName
		}
	}
	return nil
}

func (r ChatRepository) GetChatById(id bson.ObjectID, chat *models.Chat) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"_id": id}

	if err := coll.FindOne(context.TODO(), filter).Decode(chat); err != nil {
		return errors.New("Chat not found")
	}

	return nil
}

func (r ChatRepository) GetChatByCategory(id bson.ObjectID, chat *models.Chat) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"category_id": id}

	if err := coll.FindOne(context.TODO(), filter).Decode(chat); err != nil {
		return errors.New("Chat not found")
	}

	return nil
}

func (r ChatRepository) AddUser(idUser bson.ObjectID, idChat bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"_id": idChat}
	update := bson.M{"$push": bson.M{"members_id": idUser}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return err
	}

	return nil
}

func (r ChatRepository) RemoveUser(idUser bson.ObjectID, idChat bson.ObjectID) error {
	coll := r.db.Database("TechPower").Collection("Chats")
	filter := bson.M{"_id": idChat}
	update := bson.M{"$pull": bson.M{"members_id": idUser}}

	if _, err := coll.UpdateOne(context.TODO(), filter, update); err != nil {
		return err
	}

	return nil
}
