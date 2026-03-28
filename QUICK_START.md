# Firebase Integration - Quick Start Guide

## ⚠️ CRITICAL SECURITY WARNING

**Your Firebase credentials were exposed in the chat. You MUST:**

1. **Immediately regenerate your service account key:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Delete the old `cleanup-system-firebase-adminsdk-fbsvc-e3edd028f6.json` file
   - Save the new key securely (NOT in version control)

2. **Secure your API keys:**
   - Never commit `.env.local` to git
   - Never paste real credentials in chat or public places
   - Use environment variables for all sensitive data

3. **Enable API restrictions in Firebase Console:**
   - Restrict API keys to only necessary APIs
   - Set HTTP/Android/iOS restrictions

---

## 🚀 Setup Instructions (5 Minutes)

### 1. Get Your Firebase Config

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select **cleanup-system** project
3. Click **Web App** (⚙️ icon → Project Settings)
4. Scroll to "Your apps" and click the web app config
5. Copy the config object

### 2. Create Environment File

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```
   (Windows) or `cp .env.example .env.local` (Mac/Linux)

2. Open `.env.local` and replace with your actual Firebase config:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=cleanup-system.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=cleanup-system
   VITE_FIREBASE_STORAGE_BUCKET=cleanup-system.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=116492...
   VITE_FIREBASE_APP_ID=1:116492...:web:...
   ```

### 3. Start Development Server

```bash
npm run dev
```

You should see a warning in the console if config is incomplete.

---

## 📁 Files Created/Modified

- `src/firebase.config.ts` - Firebase initialization
- `src/services/firebaseService.ts` - Reusable Firebase functions
- `src/hooks/useFirebaseAuth.ts` - Authentication hook
- `src/components/FirebaseLoginExample.tsx` - Example login component
- `.env.example` - Environment template
- `FIREBASE_SETUP.md` - Detailed setup documentation

---

## 📚 Usage Examples

### Import and Use in Your Components

```typescript
import { loginUser, getBins, uploadImage } from './services/firebaseService';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';

// In your component
const { user, loading } = useFirebaseAuth();

// Login example
const handleLogin = async (email, password) => {
  const user = await loginUser(email, password);
  console.log('Logged in:', user);
};

// Fetch data
const handleLoadBins = async () => {
  const bins = await getBins();
  setBins(bins);
};
```

### Available Functions

**Authentication:**
- `registerUser(email, password)`
- `loginUser(email, password)`
- `logoutUser()`

**Users:**
- `createUserProfile(userId, userData)`
- `getUserProfile(userId)`

**Bins:**
- `addBin(binData)`
- `getBins()`
- `getBinById(binId)`
- `updateBin(binId, updates)`

**Reports:**
- `addReport(reportData)`
- `getReports(filters)`

**Images:**
- `uploadImage(file, path)`
- `addUpload(uploadData)`
- `getUploads(userId)`

**Trucks:**
- `addTruck(truckData)`
- `getTrucks()`
- `updateTruck(truckId, updates)`

**Community:**
- `addPost(postData)`
- `getPosts()`
- `deletePost(postId)`

---

## 🔧 Next Steps

1. **Update Login Component:**
   - Integrate `loginUser` function in [Login.tsx](Login.tsx)
   - Use `useFirebaseAuth` hook to check authentication state
   - Reference [FirebaseLoginExample.tsx](src/components/FirebaseLoginExample.tsx)

2. **Update Dashboard Components:**
   - Use `getBins()` in [LiveBinStatus.tsx](LiveBinStatus.tsx)
   - Use `getTrucks()` in [TrackTruck.tsx](TrackTruck.tsx)
   - Use `getPosts()` in [Community.tsx](Community.tsx)

3. **Setup Image Upload:**
   - Use `uploadImage()` in [CitizenUploadModal.tsx](CitizenUploadModal.tsx)
   - Use `ImageUploadModal.tsx` for modal handling

4. **Enable Firestore Security Rules:**
   - Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for recommended rules
   - Update in Firebase Console → Firestore → Rules tab

---

## 🐛 Troubleshooting

**"apiKey is required"** 
→ Check `.env.local` file exists and has correct values

**"Could not load default credentials"**
→ Normal - this is frontend code, doesn't use service account

**Images not uploading?**
→ Check Cloud Storage rules in Firebase Console

**Firestore queries return empty?**
→ Check security rules aren't too restrictive

---

## 📖 Documentation

- [Full Setup Guide](FIREBASE_SETUP.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Storage Guide](https://firebase.google.com/docs/storage)

Happy coding! 🎉
