# Quick Setup: Make Your First Admin

## Step 1: Create Admin Via Browser Console

After logging in, open your browser **Developer Console** (F12) and run:

```javascript
// Get the userId of the currently logged-in user
const store = window.localStorage.getItem('oau-san-store')
console.log(JSON.parse(store).state.currentUser)
```

Copy the `_id` or `id` value. Then run:

```javascript
// Fetch to promote current user to admin
fetch('/api/admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: '69d05384fcfdbfccb4edc916' })
}).then(r => r.json()).then(console.log)
```

## Step 2: Verify Admin Status

1. **Sign out** and **sign back in**
2. Click the **avatar** in the top right
3. You should see an **"Admin"** badge in the dropdown
4. The user profile dropdown now shows your admin status

## Why Your First User Was Created

The user "OLUWASEGUN ODUYERU" was created because:

- ✅ **Real database** is now connected to MongoDB Atlas
- ✅ User data is saved in `oausan.alumni` collection
- ✅ Passwords are bcrypted for security
- ✅ The app uses real API endpoints (not static fallback data)

## What's New

### 1. User Profile Dropdown Component
- Modern avatar with user initials
- Shows email and role
- Admin badge for admin users
- Quick logout button

### 2. Real Database Integration
All data now comes from MongoDB:
- **Signup**: Saves to database
- **Login**: Validates against database
- **Badges, Jobs, Events**: Fetched from collection in real-time
- **Admin Status**: Stored in database

### 3. Admin Management API
```
POST   /api/admin              → Promote user to admin
GET    /api/admin              → Get list of all admins  
GET    /api/admin?userId=xxx   → Check if user is admin
DELETE /api/admin?userId=xxx   → Remove admin privileges
```

## Architecture

```
┌─────────────────────────────┐
│  React Components           │
│  (signup, login, dropdown)  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Zustand Store              │
│  (state management)         │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  Next.js API Routes         │
│  (/api/alumni, /api/admin)  │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  MongoDB Atlas              │
│  (oausan database)          │
└─────────────────────────────┘
```

## Testing the Admin Features

### Test 1: Signup
1. Go to signup form
2. Create a new account
3. Account saved to MongoDB automatically

### Test 2: Login
1. Log out
2. Log back in with your credentials
3. Data fetched from MongoDB

### Test 3: Admin Promotion
1. Open browser console
2. Run the promotion command above
3. Sign out and back in
4. Click avatar dropdown - you now see "Admin" badge

## Next: Build Admin Dashboard

To fully leverage admin features, create:

1. **Admin Panel** (`/admin` page)
   - Manage users
   - View analytics
   - Moderate content

2. **Admin Routes** (add to navigation)
   - User Management
   - System Settings
   - Reports & Analytics

3. **Role-Based Access** (middleware)
   - Protect admin routes
   - Check `isAdmin` flag on backend

## Key Files Modified

- ✨ `/components/user-profile-dropdown.tsx` - New dropdown component
- ✨ `/app/api/admin/route.ts` - New admin API
- 📝 `/lib/store.ts` - Added admin functions
- 📝 `/components/app-shell.tsx` - Uses new dropdown
- 📝 `/ADMIN_SETUP.md` - Full documentation

## Your MongoDB Collections

The app automatically creates and uses:
- **alumni** - User profiles with `isAdmin` field
- **events** - Events data
- **jobs** - Job postings
- **badges** - User badges
- **mentors** - Mentor profiles
- **event_registrations** - Event attendance
- **mentor_requests** - Mentorship applications

## Environment Check

✅ MongoDB URI configured on Vercel  
✅ Database connected and storing data  
✅ User authentication working  
✅ Admin system ready  

You're all set! Your app is now a real, functional database-backed application.
