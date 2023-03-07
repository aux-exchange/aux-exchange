# Pool Stat

`pool-stat` is a go binary to load pool statistics.

This can be run locally. Furthermore, if you have [Google Firebase](https://firebase.google.com) setup, the raw data and output can be loaded into Google Cloud Storage and Cloud Firestore.

The stats will be saved into collection `pools` and document `stat` in Firestore.

Since loading events from fullnode is a long process, the raw evenvts for the last 7 days can be either saved into an output file or on Google Cloud Storage. **Note**: the bucket will be `your-firebase-project-id.appspot.com` since this is connecting from firebase.
