# OAU-SAN Admin Setup Guide

## Why That User Was Created First

The user "OLUWASEGUN ODUYERU" (josh.oduyeru@gmail.com) was created because:

1. **Fallback Data**: Your `store.ts` contains hardcoded fallback alumni data (lines 146-148)
2. **Seed Operation**: You likely ran `/api/seed` which populates the database with initial test data
3. **First Sign-up**: Or this was the first user to sign up through the signup form

## Architecture: Real Database Integration

Your app now uses **real MongoDB data** with proper API layers:

```
User Action (signup/login)
    ↓
Component (signup-view.tsx, login-view.tsx)
    ↓
Store Function (addAlumni, setCurrentUser)
    ↓
API Endpoint (/api/alumni, /api/auth/login)
    ↓
MongoDB Database (oausan.alumni collection)
```

## How to Add Admin Users

### Method 1: Using the Admin API (Programmatic)

```bash
# Make a POST request to promote a user to admin
curl -X POST http://localhost:3000/api/admin \
  -H "Content-Type: application/json" \
  -d '{"userId": "69d05384fcfdbfccb4edc916"}'
```

### Method 2: Using MongoDB Atlas Console (Direct)

1. Go to MongoDB Atlas → Collections
2. Open `oausan` → `alumni` collection
3. Find the user document
4. Click **Edit** and add: `"isAdmin": true`
5. Click **Update**

### Method 3: Create First Admin User

Insert this directly into MongoDB (before any sign-ups):

```json
{
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@oau.edu.ng",
  "password": "$2b$10$...", // bcrypted password
  "year": 2020,
  "degree": "Master's",
  "major": "Sociology & Anthropology",
  "isAdmin": true,
  "isVerified": true,
  "createdAt": ISODate(),
  "updatedAt": ISODate()
}
```

## New Features Added

### 1. User Profile Dropdown
- **Location**: `components/user-profile-dropdown.tsx`
- **Features**:
  - Avatar with user initials
  - Shows user email and role
  - Admin badge for admin users
  - Profile, Settings, and Logout options
  - Used in top navigation bar

### 2. Admin API Endpoints
- **GET** `/api/admin` - Get all admins or check if user is admin
- **POST** `/api/admin` - Promote user to admin
- **DELETE** `/api/admin?userId=xxx` - Remove admin privileges

### 3. Store Admin Functions
```typescript
// Promote user to admin
await useAlumniStore.getState().promoteToAdmin(userId)

// Remove admin status
await useAlumniStore.getState().removeAdminPrivileges(userId)

// List all admins
await useAlumniStore.getState().fetchAdmins()
```

## How to Use Admin Features

### Promote Someone to Admin (in browser console):

```typescript
import { useAlumniStore } from '@/lib/store'

const store = useAlumniStore.getState()
await store.promoteToAdmin('69d05384fcfdbfccb4edc916')
```

### Check User Type in Components:

```typescript
const { currentUser } = useAlumniStore()

if (currentUser?.isAdmin) {
  // Show admin-only features
}
```

## Real Database Integration Checklist

✅ **Signup** - Creates users in MongoDB with bcrypted passwords  
✅ **Login** - Fetches from MongoDB, validates password  
✅ **User Dropdown** - Shows real MongoDB user data  
✅ **Admin Status** - Stored in MongoDB, checked on login  
✅ **Alumni Data** - Fetched from `/api/alumni` (MongoDB)  
✅ **Events** - Fetched from `/api/events` (MongoDB)  
✅ **Jobs** - Fetched from `/api/jobs` (MongoDB)  
✅ **Badges** - Fetched from `/api/badges` (MongoDB)  

## Next Steps to Make It Fully Functional

1. **Create First Admin**:
   ```bash
   # Promote the existing user to admin
   curl -X POST http://localhost:3000/api/admin \
     -H "Content-Type: application/json" \
     -d '{"userId": "69d05384fcfdbfccb4edc916"}'
   ```

2. **Test Admin Features**:
   - Sign in with the admin account
   - Avatar dropdown shows "Admin" badge
   - Click "Admin Settings" (enable when routes created)

3. **Create Admin Dashboard** (Future):
   - User management (promote/demote admins)
   - System reports
   - Content moderation
   - Data management

## API Routes for Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/alumni` | GET | Fetch all alumni |
| `/api/alumni` | POST | Create new alumni |
| `/api/alumni/[id]` | GET | Get single alumni |
| `/api/alumni/[id]` | PUT | Update alumni |
| `/api/alumni/[id]` | DELETE | Delete alumni |
| `/api/admin` | GET | Get list of admins |
| `/api/admin` | POST | Promote user to admin |
| `/api/admin?userId=xxx` | DELETE | Remove admin privileges |
| `/api/auth/login` | POST | Login user |

## Environment Variables

Make sure these are set in Vercel:

```
MONGODB_URI=mongodb+srv://joshuaoduyeru:W3m5nkhDqenEHB9K@cluster0.aj9e7ws.mongodb.net/oausan
```

## Troubleshooting

**Q: User not showing as admin after promotion?**
- Clear browser cache/cookies
- Sign out and sign back in
- Check MongoDB directly to verify `isAdmin: true`

**Q: Can't see admin users?**
- Check `/api/admin` response in Network tab
- Verify MongoDB connection is working

**Q: Dropdown not showing?**
- Check browser console for errors
- Ensure `UserProfileDropdown` component is imported in `app-shell.tsx`
- Verify shadcn UI components are installed

## Security Notes

⚠️ **Important**:
- Never expose admin endpoints without authentication
- Add role-based access control (RBAC) middleware
- Validate admin status on every API call
- Use environment variables for sensitive data
- Consider implementing JWT tokens for stateless auth
