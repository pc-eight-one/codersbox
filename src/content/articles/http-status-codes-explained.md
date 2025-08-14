---
title: "HTTP Status Codes Explained"
description: "A handy guide to common HTTP status codes and when to use them."
publishDate: 2025-08-08
tags: ["HTTP", "Web", "Backend", "API"]
readTime: "7 min read"
featured: false
---

# HTTP Status Codes Explained

Here's a quick reference for frequently used HTTP status codes.

## Reference Table

| Code | Name                    | When to Use                                 |
|------|-------------------------|---------------------------------------------|
| 200  | OK                      | Successful GET/PUT/PATCH/DELETE             |
| 201  | Created                 | Resource created via POST                   |
| 204  | No Content              | Successful request, no body returned        |
| 301  | Moved Permanently       | Permanent redirect                          |
| 302  | Found                   | Temporary redirect                          |
| 304  | Not Modified            | Client cache is still valid                 |
| 400  | Bad Request             | Validation error, malformed request         |
| 401  | Unauthorized            | Missing/invalid auth                        |
| 403  | Forbidden               | Authenticated but not allowed               |
| 404  | Not Found               | Resource does not exist                     |
| 409  | Conflict                | State conflict (e.g., versioning)           |
| 429  | Too Many Requests       | Rate limiting kicked in                     |
| 500  | Internal Server Error   | Unexpected server error                     |
| 503  | Service Unavailable     | Temporary overload/maintenance              |

## Tips

- Prefer 409 over 400 for optimistic concurrency conflicts
- Use 422 Unprocessable Entity for domain validation errors
- Include machine-friendly error codes in response body

## Example Error Body

```json
{
  "error": {
    "code": "USER_EMAIL_TAKEN",
    "message": "This email is already registered.",
    "docs": "https://api.example.com/docs/errors#USER_EMAIL_TAKEN"
  }
}
```

## Conclusion

Consistent status codes improve DX and observability.