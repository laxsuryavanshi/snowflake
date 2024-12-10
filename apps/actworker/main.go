package main

import (
	"bufio"
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/r3labs/sse/v2"
	log "github.com/sirupsen/logrus"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type jobStatus int

const (
	queued jobStatus = iota
	inProgress
	completed
	failed
)

func (s jobStatus) String() string {
	return [...]string{"Queued", "In Progress", "Completed", "Failed"}[s]
}

type job struct {
	Id        bson.ObjectID `bson:"_id"`
	Repo      string        `bson:"repo"`
	Branch    string        `bson:"branch"`
	Status    jobStatus     `bson:"status"`
	CreatedAt bson.DateTime `bson:"created_at"`
}

var (
	server         *http.Server
	sseServer      *sse.Server
	client         *mongo.Client
	jobsCollection *mongo.Collection
)

func main() {
	log.Infof("Started process with ID: %d", os.Getpid())

	ctx, cancel := context.WithCancel(context.Background())

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	defer func() { signal.Stop(quit); cancel() }()
	go func() {
		defer cleanupResources(ctx)
		select {
		case <-quit:
			cancel()
		case <-ctx.Done():
		}
	}()

	startClient()
	go startExecutor()
	startServer()
}

func startClient() {
	var uri string
	if uri = os.Getenv("MONGODB_URI"); uri == "" {
		uri = "mongodb://localhost"
	}

	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(uri).SetServerAPIOptions(serverAPI)

	var err error
	log.Infof("Connecting to MongoDB: %s", uri)
	if client, err = mongo.Connect(opts); err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	if err := client.Ping(context.TODO(), nil); err != nil {
		log.Fatalf("Failed to establish connection with MongoDB: %v", err)
	}
	log.Infof("Connection established successfully with MongoDB")

	jobsCollection = client.Database("act").Collection("jobs")
}

func shutdownClient(ctx context.Context) {
	log.Infoln("Closing MongoDB connection")
	if err := client.Disconnect(ctx); err != nil {
		log.Fatalf("Failed to close MongoDB client: %v", err)
	}
	log.Infoln("MongoDB connection closed successfully")
}

func startServer() {
	var port string
	if port = os.Getenv("PORT"); port == "" {
		port = "8080"
	}
	server = &http.Server{Addr: fmt.Sprintf(":%s", port), Handler: http.DefaultServeMux}

	sseServer = sse.New()
	http.HandleFunc("/events", sseServer.ServeHTTP)

	log.Infof("Listening on port: %s", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func shutdownServer(ctx context.Context) {
	log.Infoln("Shutting down server")
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Failed to shutdown server: %v", err)
	}
	log.Infoln("Server shutdown successfully")
}

func startExecutor() {
	for {
		j, err := getJob()
		if err != nil {
			if err == mongo.ErrNoDocuments {
				time.Sleep(2 * time.Second)
			} else {
				log.Errorf("MongoDB error while fetching job: %v", err)
			}
			continue
		}

		if err := execute(j); err != nil {
			/// TODO: save job status to failed
		} else {
			/// TODO: save job status to success
		}
	}
}

func cleanupResources(ctx context.Context) {
	log.Infoln("Cleaning up resources")
	shutdownServer(ctx)
	shutdownClient(ctx)
}

func getJob() (job, error) {
	filter := bson.D{{Key: "status", Value: queued}}
	update := bson.D{{Key: "$set", Value: bson.D{{Key: "status", Value: inProgress}}}}
	opts := options.FindOneAndUpdate().
		SetSort(bson.D{{Key: "created_at", Value: 1}}).
		SetReturnDocument(options.After)

	var j job
	err := jobsCollection.
		FindOneAndUpdate(context.TODO(), filter, update, opts).
		Decode(&j)

	return j, err
}

func execute(j job) error {
	temp, err := os.MkdirTemp("", "actworker-clone-*")
	if err != nil {
		log.Errorf("Failed to create temp directory: %v", err)
		return err
	}

	stream := sseServer.CreateStream(j.Id.Hex())
	defer sseServer.RemoveStream(stream.ID)

	if err := cloneRepo(j.Repo, j.Branch, temp); err != nil {
		return err
	}

	if err := runActions(temp, stream); err != nil {
		return err
	}

	log.Infof("Cleaning up directory %s", temp)
	if err := os.RemoveAll(temp); err != nil {
		log.Errorf("Failed to cleanup directory: %s due to %v", temp, err)
		return err
	}

	return nil
}

func cloneRepo(repo string, branch string, dir string) error {
	log.Printf("Cloning %s into %s...", repo, dir)
	if _, err := git.PlainClone(dir, false, &git.CloneOptions{
		URL:           repo,
		ReferenceName: plumbing.ReferenceName(branch),
		SingleBranch:  true,
		Depth:         1,
		Progress:      os.Stdout,
	}); err != nil {
		log.Errorf("Failed to clone repo: %v", err)
		return err
	}

	return nil
}

func runActions(dir string, stream *sse.Stream) error {
	cmd := exec.Command("act", "--json")
	cmd.Dir = dir
	cmd.Stderr = cmd.Stdout

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Errorf("Failed to create stdout pipe: %v", err)
		return err
	}

	if err := cmd.Start(); err != nil {
		log.Errorf("Failed to start command: %v", err)
		return err
	}

	scanner := bufio.NewScanner(stdout)
	for scanner.Scan() {
		sseServer.Publish(stream.ID, &sse.Event{Data: scanner.Bytes()})
	}
	if err := scanner.Err(); err != nil {
		log.Errorf("Error reading output: %v", err)
		return err
	}

	if err := cmd.Wait(); err != nil {
		log.Errorf("Command failed with error: %v", err)
		return err
	}

	return nil
}
