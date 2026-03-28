# 🚀 Add Admin & Staff Data to Firebase

## ✅ What Was Added

- **2 Admin Users** with different permission levels
- **2 Staff Users** with different roles and assignments
- Updated import script to include admin data
- Created `import-users.js` script for easy execution

## 📊 Sample Data Added

### Admin Users:
1. **Rajesh Sharma** (`admin@cleanup.com`)
   - Department: Operations
   - Permissions: manage_staff, view_reports, manage_bins, system_admin

2. **Priya Singh** (`superadmin@cleanup.com`)
   - Department: IT & Administration
   - Permissions: all_access, manage_admins, system_admin, data_export

### Staff Users:
1. **Sanjay Worker** (`staff1@cleanup.com`)
   - Role: Garbage Collector
   - Area: Downtown
   - Vehicle: truck_001
   - Status: available

2. **Mohan Kumar** (`staff2@cleanup.com`)
   - Role: Vehicle Driver
   - Area: Central
   - Vehicle: truck_002
   - Status: on-route

## 🔧 Setup Required

### Step 1: Add Firebase Credentials
You need to update `.env.local` with your actual Firebase web app credentials:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=cleanup-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cleanup-system
VITE_FIREBASE_STORAGE_BUCKET=cleanup-system.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_DATABASE_URL=https://cleanup-system-default-rtdb.firebaseio.com
```

**To get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `cleanup-system` project
3. Click ⚙️ **Project Settings** → **General** tab
4. Scroll to **Your apps** section
5. Click on your web app
6. Copy the values from **SDK configuration**

### Step 2: Run the Import

Once `.env.local` is updated, run:

```bash
node import-users.js
```

Or run directly:
```bash
node -e "import('./src/scripts/importData.ts').then(m => m.executeImport())"
```

## 📁 Database Structure

After import, your Firebase Realtime Database will have:

```
/admins/
  ├── admin/
  │   ├── adminId: "admin"
  │   ├── email: "admin@cleanup.com"
  │   ├── name: "Rajesh Sharma"
  │   ├── permissions: [...]
  │   └── role: "admin"
  └── superadmin/
      ├── adminId: "superadmin"
      ├── email: "superadmin@cleanup.com"
      ├── name: "Priya Singh"
      └── permissions: [...]

/staff/
  ├── staff1/
  │   ├── staffId: "staff1"
  │   ├── email: "staff1@cleanup.com"
  │   ├── name: "Sanjay Worker"
  │   ├── designation: "Garbage Collector"
  │   └── status: "available"
  └── staff2/
      ├── staffId: "staff2"
      ├── email: "staff2@cleanup.com"
      ├── name: "Mohan Kumar"
      ├── designation: "Vehicle Driver"
      └── status: "on-route"
```

## 🔍 Verification

After running the import:

1. **Check Firebase Console:**
   - Go to Realtime Database
   - You should see `/admins/` and `/staff/` nodes with the data

2. **Check Admin Dashboard:**
   - Login as admin
   - Go to "Operators" tab
   - You should see the 2 staff members

3. **Test Login:**
   - Try logging in with `admin@cleanup.com` or `superadmin@cleanup.com`
   - Should redirect to admin dashboard

## 🚨 Important Notes

- **Security:** The sample admin accounts have basic permissions. In production, use proper authentication.
- **Passwords:** These are just data entries. You'll need to implement proper authentication separately.
- **IDs:** User IDs are generated from email prefixes (e.g., `admin@cleanup.com` → `admin`)

## 🆘 Troubleshooting

### If import fails:
1. Check `.env.local` has correct Firebase credentials
2. Verify Firebase project has Realtime Database enabled
3. Check browser console for Firebase errors

### If data doesn't appear:
1. Refresh Firebase Console
2. Check the correct database URL in `.env.local`
3. Verify network connectivity

---

## 🎯 Next Steps

1. ✅ Update `.env.local` with Firebase credentials
2. ✅ Run `node import-users.js`
3. ✅ Verify data in Firebase Console
4. ✅ Test admin login functionality

Your Firebase database now has complete user management with admin and staff roles! 🎉