# LMS API Error Response Standards

## Base Error Structure

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "statusCode": 500,
    "status": "error"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid request data",
  "error": {
    "statusCode": 400,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 401 Unauthorized

```json
{
  "success": false,
  "message": "Please login to access this resource",
  "error": {
    "statusCode": 401,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "error": {
    "statusCode": 403,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found",
  "error": {
    "statusCode": 404,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 409 Conflict

```json
{
  "success": false,
  "message": "User already exists",
  "error": {
    "statusCode": 409,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 422 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "error": {
    "statusCode": 422,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 429 Too Many Requests

```json
{
  "success": false,
  "message": "Too many requests. Please try again later",
  "error": {
    "statusCode": 429,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal Server Error",
  "error": {
    "statusCode": 500,
    "status": "error"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# 503 Service Unavailable

```json
{
  "success": false,
  "message": "Service temporarily unavailable",
  "error": {
    "statusCode": 503,
    "status": "error"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# JWT Expired

```json
{
  "success": false,
  "message": "Access token has expired",
  "error": {
    "statusCode": 401,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# Invalid Token

```json
{
  "success": false,
  "message": "Invalid access token",
  "error": {
    "statusCode": 401,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# Database Error (Development)

```json
{
  "success": false,
  "message": "Database connection failed",
  "error": {
    "statusCode": 500,
    "status": "error"
  },
  "stack": "...",
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

---

# Unknown Route

```json
{
  "success": false,
  "message": "Can't find /api/v1/unknown-route on this server!",
  "error": {
    "statusCode": 404,
    "status": "fail"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```
