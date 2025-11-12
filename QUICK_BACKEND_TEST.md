# Quick Backend API Testing Guide

## ✅ Your Backend is Now Running!

Backend server should be running at: **http://localhost:3000**

---

## 🧪 Method 1: Use Browser (Quickest)

### Test if backend is alive:
Open your browser and go to:
```
http://localhost:3000
```
You should see a response!

---

## 🧪 Method 2: Use PowerShell (No Extension Needed)

### 1. Test Basic Endpoint
```powershell
Invoke-WebRequest -Uri "http://localhost:3000" -Method GET
```

### 2. Login to Get Token
```powershell
$body = @{
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $body -ContentType "application/json"

# Save the token
$token = $response.token
Write-Host "Token: $token"
```

### 3. Get All Question Templates (Rubrics)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/question" -Method GET -Headers @{Authorization = "Bearer $token"}
```

### 4. Create a Question Template
```powershell
$rubric = @{
    title = "SKPM - Standard Kualiti"
    description = "Rubrik penilaian guru"
    questions = @(
        @{
            questionId = "4.1.1"
            aspect = "Perancangan Pengajaran"
            standard_kualiti = "Guru merancang PdPc dengan teliti"
            tindakan = "Menyediakan RPH lengkap"
            rubric_levels = @(
                "Cemerlang - RPH lengkap",
                "Baik - RPH ada",
                "Memuaskan - RPH asas",
                "Tidak Memuaskan - Tiada RPH"
            )
        }
    )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://localhost:3000/question" -Method POST -Body $rubric -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
```

---

## 🧪 Method 3: Use Thunder Client Extension

1. Click the Thunder Client icon in VS Code sidebar (⚡)
2. Click "New Request"
3. Choose method (GET, POST, etc.)
4. Enter URL: `http://localhost:3000/question`
5. Add headers if needed:
   - Key: `Authorization`
   - Value: `Bearer YOUR_TOKEN_HERE`
6. Click "Send"

---

## 📋 Quick Test Checklist

### Check if everything works:

```powershell
# 1. Test main endpoint
Invoke-WebRequest -Uri "http://localhost:3000"

# 2. Check MongoDB connection
# Look at backend terminal - should show "Connected to MongoDB"

# 3. Test auth endpoint
$loginBody = '{"email":"test@example.com","password":"test123"}' 
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
```

If you get errors:
- ❌ "Connection refused" → Backend not running
- ❌ "404 Not Found" → Wrong URL or route not registered
- ❌ "401 Unauthorized" → Need to login first / invalid token
- ✅ JSON response → Working!

---

## 🎯 Test Complete Cerapan Flow

Once you have a token, follow these steps:

### Step 1: Create a Rubric Template
See Method 2, Step 4 above

### Step 2: Start an Evaluation
```powershell
$evalBody = @{
    teacherId = "teacher_user_id"
    templateId = "YOUR_TEMPLATE_ID_FROM_STEP_1"
    period = "Semester 1, 2025"
    subject = "Matematik"
    class = "5 Amanah"
} | ConvertTo-Json

$eval = Invoke-RestMethod -Uri "http://localhost:3000/cerapan/start" -Method POST -Body $evalBody -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}

# Save evaluation ID
$evalId = $eval._id
Write-Host "Evaluation ID: $evalId"
```

### Step 3: Submit Self-Evaluation
```powershell
$selfEval = @{
    answers = @(
        @{
            questionId = "4.1.1"
            answer = "Saya sentiasa menyediakan RPH yang lengkap"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/cerapan/self-evaluation/$evalId" -Method PUT -Body $selfEval -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
```

### Step 4: Get Admin Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/cerapan/admin/tasks" -Method GET -Headers @{Authorization = "Bearer $token"}
```

### Step 5: Submit Observation 1
```powershell
$obs1 = @{
    marks = @(
        @{
            questionId = "4.1.1"
            mark = 4
            comment = "Sangat baik, teruskan!"
        }
    )
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "http://localhost:3000/cerapan/observation-1/$evalId" -Method PUT -Body $obs1 -ContentType "application/json" -Headers @{Authorization = "Bearer $token"}
```

---

## 🔍 Check Database

```powershell
# Open MongoDB shell
mongosh

# Switch to your database
use your_database_name

# View all evaluations
db.cerapans.find().pretty()

# View all question templates
db.questiontemplates.find().pretty()

# Count by status
db.cerapans.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])
```

---

## 📝 Common Issues

**"Cannot connect to MongoDB"**
→ Start MongoDB: `mongod` or check if it's running

**"Token expired"**
→ Login again to get a new token

**"Template not found"**
→ Create a question template first (Step 1)

**"User not found"**
→ Make sure user exists in database

---

## 🎉 Next Steps

Once backend testing works:
1. ✅ Test frontend pages
2. ✅ Test complete user flow
3. ✅ Check data in MongoDB
4. ✅ Celebrate! 🎊

---

**For detailed testing guide, see:**
`backend/CERAPAN_API_TESTING.md`
