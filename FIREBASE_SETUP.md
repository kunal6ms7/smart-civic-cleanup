# Firebase Setup Guide for Cleanup-System

## Step 1: Get Your Firebase Web Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **cleanup-system** project
3. Click the gear icon → **Project Settings**
4. Scroll to "Your apps" section and click on your Web app (or create one if missing)
5. Copy the Firebase config object
6. It will look like:
```javascript
{
  apiKey: "AIzaSy...",
  authDomain: "cleanup-system.firebaseapp.com",
  projectId: "cleanup-system",
  storageBucket: "cleanup-system.appspot.com",
  messagingSenderId: "116492...",
  appId: "1:116492...:web:..."
}
```

## Step 2: Update Firebase Configuration

1. Open [src/firebase.config.ts](src/firebase.config.ts)
2. Replace the placeholder values with your actual Firebase config:
   - `apiKey` - from Step 1
   - `messagingSenderId` - from Step 1
   - `appId` - from Step 1

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Build → Firestore Database**
2. Click **Create Database**
3. Select region: `us-central1` (or any region)
4. Start in **Test Mode** (for development)
5. Create database

## Step 4: Create Required Collections

In Firestore, create these collections:
- `users` - For storing user profiles
- `bins` - For storing trash bin locations & status
- `reports` - For storing citizen reports
- `uploads` - For storing image uploads metadata
- `trucks` - For tracking garbage collection trucks
- `communityPosts` - For community forum posts

## Step 5: Enable Authentication

1. Go to **Build → Authentication**
2. Click **Get Started**
3. Enable **Email/Password** authentication
4. Enable **Google** authentication (optional but recommended)

## Step 6: Configure Cloud Storage

1. Go to **Build → Storage**
2. Click **Get Started**
3. Start in **Test Mode**
4. Choose location: `us-central1`

## Step 7: Test the Connection

Run your dev server:
```bash
npm run dev
```

The app will now connect to Firebase automatically!

## Usage Examples

### Login a User
```typescript
import { loginUser } from './services/firebaseService';

const handleLogin = async (email: string, password: string) => {
  try {
    const user = await loginUser(email, password);
    console.log('Logged in:', user.email);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Upload an Image
```typescript
import { uploadImage, addUpload } from './services/firebaseService';

const handleImageUpload = async (file: File, userId: string) => {
  const path = `uploads/${userId}/${file.name}`;
  const url = await uploadImage(file, path);
  
  await addUpload({
    userId,
    imageUrl: url,
    description: 'Uploaded image',
  });
};
```

### Add a Report
```typescript
import { addReport } from './services/firebaseService';

const handleCreateReport = async (reportData: any) => {
  const reportId = await addReport({
    userId: currentUser.uid,
    ...reportData,
  });
  console.log('Report created:', reportId);
};
```

### Fetch Bins
```typescript
import { getBins } from './services/firebaseService';

const loadBins = async () => {
  const bins = await getBins();
  console.log('Available bins:', bins);
};
```

## Security Rules (Important!)

After testing, update your Firestore security rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Anyone authenticated can read bins
    match /bins/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Reports collection
    match /reports/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Community posts
    match /communityPosts/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables (Optional)

Create a `.env.local` file in your project root:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=cleanup-system.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cleanup-system
VITE_FIREBASE_STORAGE_BUCKET=cleanup-system.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then update [src/firebase.config.ts](src/firebase.config.ts):
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
```

## Troubleshooting

**Error: "Could not load the default credentials"**
- This is normal for frontend. The service account JSON is for backend only.

**Images not uploading?**
- Check Cloud Storage security rules
- Ensure bucket is created in Firebase Console

**Can't read from Firestore?**
- Check Firestore security rules
- Ensure user is authenticated
- Check browser console for detailed errors
