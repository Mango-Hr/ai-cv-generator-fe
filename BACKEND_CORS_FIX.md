# Backend CORS Configuration Required

## Problem

The backend API at `https://ai-cv-generator-be-production.up.railway.app` is working and responds successfully to requests, **but it's missing CORS (Cross-Origin Resource Sharing) headers**.

When the browser tries to fetch from the frontend (different domain/port), the response is blocked because:
1. Frontend makes request from: `http://localhost:5174` or `https://ai-cv-generator.onrender.com`
2. Backend is at: `https://ai-cv-generator-be-production.up.railway.app`
3. These are different origins, so browser blocks it unless backend sends CORS headers

**Error User Sees:** `TypeError: Failed to fetch`

---

## Solution: Add CORS Headers to Backend

The backend needs to respond with these HTTP headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
Access-Control-Allow-Credentials: true
```

### Implementation by Framework

#### **Express.js (Node.js)**

```javascript
// Option 1: Use cors middleware
const cors = require('cors');
app.use(cors());

// Option 2: Manual CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Client-Access-Token, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Option 3: For specific routes
app.post('/api/v1/public/submissions', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  // ... rest of handler
});
```

#### **FastAPI (Python)**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### **Django**

```python
# settings.py
INSTALLED_APPS = [
    # ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    # ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://localhost:3000",
    "https://ai-cv-generator.onrender.com",
    "https://admin-ai-cv-generator.onrender.com",
]
```

#### **Flask**

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

#### **Go (Gin)**

```go
import "github.com/gin-contrib/cors"

r := gin.Default()
r.Use(cors.Default())
```

---

## What to Allow

### Domains to Whitelist

For development:
```
http://localhost:5174
http://localhost:3000
http://localhost:5175
```

For production:
```
https://ai-cv-generator.onrender.com
https://admin-ai-cv-generator.onrender.com
```

### Headers to Allow

```
Content-Type
X-Client-Access-Token
Authorization
Accept
```

### Methods to Allow

```
GET
POST
PATCH
DELETE
OPTIONS
```

---

## Testing CORS Fix

After updating backend, test with:

```bash
curl -X OPTIONS https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions \
  -H "Origin: http://localhost:5174" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

Look for these in the response headers:
```
Access-Control-Allow-Origin: * (or your domain)
Access-Control-Allow-Methods: POST, GET, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
```

---

## Verification Steps

1. **Test backend directly** (should work):
   ```bash
   curl -X POST https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions \
     -H "Content-Type: application/json" \
     -d '{"first_name":"Test",...}'
   ```
   ✅ Backend responds with data

2. **Check CORS headers**:
   ```bash
   curl -I -X POST https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions
   ```
   Look for `Access-Control-Allow-Origin` in response

3. **Test from browser** (will work after CORS fix):
   - Open frontend: `http://localhost:5174/submit` or deployment URL
   - Fill form and submit
   - Check DevTools → Network tab
   - Request should succeed with 200 status

---

## Backend Repository

The backend code is at:
- **GitHub:** Search for `ai-cv-generator-be` in your organization
- **Railway:** `ai-cv-generator-be-production` service
- **Note:** You need to update the backend code and deploy it

---

## Quick Checklist

- [ ] Backend CORS middleware installed/configured
- [ ] `Access-Control-Allow-Origin` header is set
- [ ] `Access-Control-Allow-Methods` includes POST
- [ ] `Access-Control-Allow-Headers` includes Content-Type and X-Client-Access-Token
- [ ] Backend deployed to Railway
- [ ] OPTIONS preflight request returns 200 with CORS headers
- [ ] Frontend can now submit forms successfully

---

## After Fixing Backend

Once backend CORS is fixed:

1. The "Failed to fetch" error will disappear
2. Form submission will work
3. You'll see successful response with submission_id and access_token
4. Chat will be able to connect to WebSocket

---

**Status:** Waiting for backend CORS configuration  
**What's needed:** Backend team to add CORS headers to the API  
**Impact:** Frontend will work once CORS is enabled
