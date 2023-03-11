package functions

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"cloud.google.com/go/storage"
	firebase "firebase.google.com/go/v4"
	firestorage "firebase.google.com/go/v4/storage"
)

var (
	projectID  = os.Getenv("GOOGLE_CLOUD_PROJECT")
	bucketName = fmt.Sprintf("%s.appspot.com", projectID)
)

var app *firebase.App

var client *firestore.Client

var storageClient *firestorage.Client

// FirestoreEvent is the payload of a Firestore event.
type FirestoreEvent struct {
	OldValue   FirestoreValue `json:"oldValue"`
	Value      FirestoreValue `json:"value"`
	UpdateMask struct {
		FieldPaths []string `json:"fieldPaths"`
	} `json:"updateMask"`
}

// FirestoreValue holds Firestore fields.
type FirestoreValue struct {
	CreateTime time.Time `json:"createTime"`
	// Fields is the data for this value. The type depends on the format of your
	// database. Log an interface{} value and inspect the result to see a JSON
	// representation of your database fields.
	Fields     any       `json:"fields"`
	Name       string    `json:"name"`
	UpdateTime time.Time `json:"updateTime"`
}

func init() {
	conf := &firebase.Config{ProjectID: projectID}
	ctx := context.Background()

	var err error

	app, err = firebase.NewApp(ctx, conf)
	if err != nil {
		log.Fatalf("firebase new app: %v", err)
	}
	client, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("firestore client: %v", err)
	}
	storageClient, err = app.Storage(ctx)
	if err != nil {
		log.Fatalf("firestore storage: %v", err)
	}
}

func CopyPoolStatToStorage(ctx context.Context, e FirestoreEvent) error {
	log.Printf("for project: %s with bucket: %s", projectID, bucketName)

	docRef, err := client.Collection("pools").Doc("stat").Get(ctx)
	if err != nil {
		return fmt.Errorf("failed to get doc: %w", err)
	}
	bytes, err := json.Marshal(docRef.Data())
	if err != nil {
		return fmt.Errorf("failed to marshal %v to json: %w", e.Value.Fields, err)
	}

	bucket, err := storageClient.Bucket(bucketName)
	if err != nil {
		return fmt.Errorf("failed to get bucket %s due to: %w", bucketName, err)
	}

	handle := bucket.Object("public/pool-stat.json")

	w := handle.NewWriter(ctx)
	defer func() {
		w.Close()
		// ACL change after writer is closed.
		// It looks like the ACL will not be properly set if w.Close() is deferred but the ACL Set is not.
		err = handle.ACL().Set(ctx, storage.AllUsers, storage.RoleReader)
		if err != nil {
			log.Printf("failed to set acl: %v", err)
		}
	}()

	_, err = w.Write(bytes)
	if err != nil {
		return fmt.Errorf("failed to write object: %w", err)
	}

	return nil
}
