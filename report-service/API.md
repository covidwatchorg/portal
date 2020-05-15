# API Endpoints

Note: In addition to listed response codes, all endpoints may return 500 on
internal server error.

## `/challenge`

### Behavior

Generates a new proof of work challenge and stores it in the database.

### Request

Method: `GET`

Request body: None

### Response

Code: 200 on success

```json
{
   "work_factor" : 1024,
   "nonce" : "54be07e7445880272d5f36cc56c78b6b"
}
```
