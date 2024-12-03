package main

import (
	"context"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type JobStatus int

const (
	Queued JobStatus = iota
	InProgress
	Completed
	Failed
)

func (s JobStatus) String() string {
	return [...]string{"Queued", "In Progress", "Completed", "Failed"}[s]
}

type Job struct {
	Id        bson.ObjectID `bson:"_id"`
	Repo      string        `bson:"repo"`
	Branch    string        `bson:"branch"`
	Status    JobStatus     `bson:"status"`
	CreatedAt bson.DateTime `bson:"created_at"`
}

func main() {
	var uri string
	if uri = os.Getenv("MONGODB_URI"); uri == "" {
		log.Fatal("You must set your 'MONGODB_URI' environment variable.")
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	client, err := mongo.Connect(opts)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err := client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()

	collection := client.Database("act").Collection("jobs")

	for {
		filter := bson.D{{Key: "status", Value: Queued}}
		update := bson.D{{Key: "$set", Value: bson.D{{Key: "status", Value: InProgress}}}}
		opts := options.FindOneAndUpdate().
			SetSort(bson.D{{Key: "created_at", Value: 1}}).
			SetReturnDocument(options.After)

		var job Job
		err := collection.FindOneAndUpdate(context.TODO(), filter, update, opts).Decode(&job)

		if err == mongo.ErrNoDocuments {
			time.Sleep(2 * time.Second)
			continue
		} else if err != nil {
			panic(err)
		}

		temp, err := os.MkdirTemp("", "actworker-clone-*")
		if err != nil {
			panic(err)
		}

		log.Printf("Cloning %s into %s...", job.Repo, temp)
		_, err = git.PlainClone(temp, false, &git.CloneOptions{
			URL:           job.Repo,
			ReferenceName: plumbing.ReferenceName(job.Branch),
			SingleBranch:  true,
			Depth:         1,
			Progress:      os.Stdout,
		})

		if err != nil {
			panic(err)
		}

		command := exec.Command("act")
		command.Dir = temp
		command.Stdout = os.Stdout

		if err = command.Run(); err != nil {
			panic(err)
		}
	}
}
