# Backend CORS Configuration - Action Plan

## Current Status

**Error:** `No 'Access-Control-Allow-Origin' header is present on the requested resource`

**Location:** Backend at `https://ai-cv-generator-be-production.up.railway.app`

**Problem:** Backend is rejecting requests from frontend at `https://ai-cv-generator-fe.onrender.com` because it doesn't have CORS headers enabled.

---

## What Needs to Happen (Backend Team)

### Step 1: Add CORS Middleware/Headers

The backend needs to respond with these HTTP headers:

```
Access-Control-Allow-Origin: https://ai-cv-generator-fe.onrender.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
Access-Control-Allow-Credentials: true
```

Or allow all origins (simpler for MVP):

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
```

### Step 2: Handle Preflight Requests

Browsers send an `OPTIONS` preflight request before POST. The backend must respond with:
- Status code: `200` or `204`
- Same CORS headers as above

### Step 3: Implementation (By Backend Framework)

#### **Express.js (Node.js)**
```javascript
// Option 1: Install and use cors package
npm install cors

// In app.js:
const cors = require('cors');
app.use(cors({
  origin: ['https://ai-cv-generator-fe.onrender.com', 'http://localhost:5174'],
  credentials: true,
}));

// Option 2: Manual CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (['https://ai-cv-generator-fe.onrender.com', 'http://localhost:5174'].includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-Client-Access-Token, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

#### **FastAPI (Python)**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-cv-generator-fe.onrender.com",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### **Django (Python)**
```python
# settings.py
INSTALLED_APPS = [
    'corsheaders',
    # ... other apps
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]

CORS_ALLOWED_ORIGINS = [
    "https://ai-cv-generator-fe.onrender.com",
    "http://localhost:5174",
]
```

#### **Flask (Python)**
```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://ai-cv-generator-fe.onrender.com", "http://localhost:5174"],
        "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-Client-Access-Token", "Authorization"],
    }
})
```

#### **Go (Gin)**
```go
import "github.com/gin-contrib/cors"

func main() {
    r := gin.Default()
    
    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"https://ai-cv-generator-fe.onrender.com", "http://localhost:5174"},
        AllowMethods:     []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Content-Type", "X-Client-Access-Token", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
    }))
    
    // ... routes
}
```

#### **Java (Spring Boot)**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins(
                "https://ai-cv-generator-fe.onrender.com",
                "http://localhost:5174"
            )
            .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

---

## Verification Steps

### Step 1: Test Backend Directly (Should still work)
```bash
curl -X POST https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User",...}'
```
✅ Should get 200 status and response

### Step 2: Check CORS Headers
```bash
curl -I -X POST https://ai-cv-generator-be-production.up.railway.app/api/v1/public/submissions \
  -H "Origin: https://ai-cv-generator-fe.onrender.com" \
  -H "Access-Control-Request-Method: POST"
```

Look for response headers:
```
Access-Control-Allow-Origin: https://ai-cv-generator-fe.onrender.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-Client-Access-Token, Authorization
```

✅ All three should be present

### Step 3: Test Browser Request (After CORS fix)
1. Go to `https://ai-cv-generator-fe.onrender.com`
2. Click "📋 Auto-fill"
3. Click "Submit Resume"
4. Should see success in console (no CORS error)

---

## Deployment Steps

### For Railway Backend

1. **Update code** with CORS middleware
2. **Commit to Git**:
   ```bash
   git add .
   git commit -m "feat: enable CORS for frontend domains"
   git push
   ```
3. **Railway auto-deploys** on push (if configured)
4. **Wait for deployment** to complete (check Railway dashboard)
5. **Test with cURL** to verify headers
6. **Test from frontend** at `https://ai-cv-generator-fe.onrender.com`

---

## What Frontend Team Can Do (While Waiting)

### Option 1: Test Locally (Bypass CORS for dev)
```bash
npm run dev
# Frontend at http://localhost:5174
# This may allow CORS from localhost during development
```

### Option 2: Use CORS Proxy (Temporary - Not recommended for production)
```javascript
// In submissionService.js (TEMPORARY ONLY)
const API_BASE_URL = 'https://cors-anywhere.herokuapp.com/https://ai-cv-generator-be-production.up.railway.app'
```
⚠️ **NOT for production** - only for testing

### Option 3: Backend Proxy (Best for now)
If backend team can quickly add a `/proxy` endpoint that doesn't require CORS, frontend can use that temporarily.

---

## Domains to Allow

### Development
```
http://localhost:5174
http://localhost:3000
http://127.0.0.1:5174
```

### Production
```
https://ai-cv-generator-fe.onrender.com
https://admin-ai-cv-generator.onrender.com
```

### Test/Staging (if needed)
```
https://ai-cv-generator-fe-staging.onrender.com
```

---

## Timeline

| Step | Who | Time | Blocking |
|------|-----|------|----------|
| Backend adds CORS | Backend Team | 5-10 min | ✅ Critical |
| Push to Git | Backend Team | 1 min | ✅ Critical |
| Railway deploys | Automatic | 2-5 min | ✅ Critical |
| Frontend tests | Frontend Team | 2 min | ✅ Verification |
| **Total** | **Both teams** | **~15 min** | **To unblock submissions** |

---

## Checklist for Backend Team

- [ ] CORS middleware installed/imported
- [ ] CORS configured with allowed origins:
  - [ ] `https://ai-cv-generator-fe.onrender.com`
  - [ ] `http://localhost:5174` (development)
- [ ] CORS methods allowed: `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`
- [ ] CORS headers allowed: `Content-Type`, `X-Client-Access-Token`, `Authorization`
- [ ] OPTIONS preflight requests return 200 with CORS headers
- [ ] Code committed to Git
- [ ] Deployed to Railway (auto-deploy or manual)
- [ ] Verified with cURL test
- [ ] Verified from browser (no CORS error in console)

---

## After CORS is Fixed

Once backend CORS is enabled:

1. ✅ Frontend form submissions will work
2. ✅ Chat WebSocket will connect properly
3. ✅ File uploads will work
4. ✅ Real-time chat will function
5. ✅ No more "Failed to fetch" errors

Then the full end-to-end flow will work:
1. User fills form → 2. Submit to backend → 3. Receive submission_id → 4. Chat with AI → 5. Generate resume

---

## Current Frontend Readiness

✅ **Frontend is 100% ready:**
- Form validation working
- API endpoint correct
- Payload format correct
- Error handling in place
- All tests pass locally

⏳ **Only waiting on:** Backend CORS headers

---

## Contact/Next Steps

**For Backend Team:**
1. Review this document
2. Pick the framework-specific solution above
3. Implement CORS
4. Test with cURL
5. Deploy to Railway
6. Notify when complete

**For Frontend Team (Israel):**
1. Share this doc with backend team
2. While waiting, test locally: `npm run dev`
3. Once CORS enabled, test production: `https://ai-cv-generator-fe.onrender.com`

---

## Additional Resources

- [MDN CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CORS Tester Tool](https://www.test-cors.org)
- [Express CORS Package](https://www.npmjs.com/package/cors)
- [FastAPI CORS Docs](https://fastapi.tiangolo.com/tutorial/cors/)

---

**Status:** ⏳ Waiting for backend CORS configuration  
**Impact:** Blocks all production form submissions  
**Estimated Fix Time:** 10-15 minutes  
**Difficulty:** Easy (copy-paste solution above)
