# Firebase Data Import Guide

## Overview

You now have multiple ways to import data to your Firebase Realtime Database at:
```
https://cleanup-system-default-rtdb.firebaseio.com/
```

---

## Method 1: Browser UI (Easiest) 🖱️

### Step 1: Add Import Panel to Your App

In your `AdminDashboard.tsx` or admin page:

```typescript
import DataImportPanel from './components/DataImportPanel';

export function AdminDashboard() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <DataImportPanel 
        onImportComplete={() => console.log('Data imported!')}
      />
    </div>
  );
}
```

### Step 2: Click Import Button
- Open your app at `http://localhost:5173/`
- Navigate to admin section
- Click "Import Sample Data"
- Confirm the import

### Step 3: Verify
- Check your Firebase Console
- Go to **Realtime Database** tab
- Scroll through to see your imported data

---

## Method 2: Programmatic (For Scripts) 💻

### In Your Component/Page:

```typescript
import { executeImport } from './scripts/importData';

// Simple usage
const handleImport = async () => {
  try {
    const result = await executeImport();
    if (result.success) {
      console.log('✅ Data imported successfully!');
    }
  } catch (error) {
    console.error('Import failed:', error);
  }
};

// Usage in a function
export const AdminTools = () => {
  return (
    <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white">
      Import Data
    </button>
  );
};
```

---

## Method 3: Firebase Console Import 📤

### Manual Upload via Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **cleanup-system** project
3. Click **Realtime Database**
4. Click menu (**⋮**) → **Import JSON**
5. Select your JSON file
6. Click **Import**

**Supported JSON formats:**

```json
{
  "bins": {
    "bin_1": {
      "location": "Downtown",
      "status": "full"
    }
  },
  "users": {
    "user_1": {
      "email": "test@example.com",
      "name": "Test User"
    }
  }
}
```

---

## Method 4: Custom Import Service 🔧

### For Importing Your Own JSON Files:

```typescript
import {
  importBinsData,
  importCitizensData,
  importDetectionData,
  batchImport,
} from './services/importService';

// Import specific data type
const importMyBins = async () => {
  const myBinsData = [
    {
      location: 'My Location',
      latitude: 19.0760,
      longitude: 72.8777,
      capacity: 200,
    },
  ];

  await importBinsData(myBinsData);
};

// Batch import multiple types
const batchImportAll = async () => {
  const result = await batchImport({
    bins: binsArray,
    citizens: citizensArray,
    staff: staffArray,
    trucks: trucksArray,
    detections: detectionsArray,
  });

  console.log('Batch import results:', result);
};
```

---

## Data Being Imported

### Sample Data Included:

#### 4 Bins
- Downtown Mumbai - Main Street (75% full)
- Central Park - East Entrance (45% full)  
- Market Area - Zone A (95% full - CRITICAL)
- Residential Block B (20% full)

#### 3 Citizens
- Rajesh Kumar (3 reports)
- Priya Singh (5 reports)
- Anuj Patel (2 reports)

#### 2 Staff Members
- Sanjay Worker (Garbage Collector)
- Mohan Kumar (Vehicle Driver)

#### 2 Trucks
- MH-01-AB-1234 (Available)
- MH-01-CD-5678 (On Route)

#### 3 Reports/Detections
- Real bin detection
- Waste severity analysis
- AI-generated image detection

---

## Verify Import Success

### In Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **cleanup-system**
3. Click **Realtime Database**
4. You should see:

```
cleanup-system
  ├── bins/ (4 entries)
  ├── users/ (3 entries)
  ├── staff/ (2 entries)
  ├── trucks/ (2 entries)
  ├── reports/ (3 entries)
  └── ...
```

### In Your App:

```typescript
import { getAllBins, getAllCitizens } from './services/databaseService';

// Test if data imported
const testImport = async () => {
  const bins = await getAllBins();
  const citizens = await getAllCitizens();
  
  console.log(`Found ${bins.length} bins and ${citizens.length} citizens`);
};
```

---

## Clear Data (If Needed)

**⚠️ WARNING: This deletes everything!**

```typescript
import { clearAllData } from './services/importService';

// Must pass true to confirm
await clearAllData(true); // Deletes all data
```

---

## Customizing Import Data

### Edit sample data in `src/scripts/importData.ts`:

```typescript
const sampleBins = [
  {
    location: "Your Location",
    latitude: YOUR_LAT,
    longitude: YOUR_LNG,
    capacity: 200,
    fillLevel: 50,
    status: "half-full",
  },
  // Add more...
];

const sampleCitizens = [
  {
    email: "your.email@example.com",
    name: "Your Name",
    phone: "+91-1234567890",
    // ...
  },
  // Add more...
];
```

Then re-run the import.

---

## Real-Time Verification

After import, you can instantly see data updates:

```typescript
import { onBinsUpdate, onUsersUpdate } from './services/databaseService';

// Watch for changes in real-time
onBinsUpdate((bins) => {
  console.log('Updated bins:', bins);
});

onUsersUpdate((users) => {
  console.log('Updated users:', users);
});
```

---

## API Reference

### Available Import Functions

| Function | Purpose |
|----------|---------|
| `executeImport()` | Import all sample data |
| `importBinsData(data)` | Import bins array |
| `importCitizensData(data)` | Import citizens array |
| `importDetectionData(data)` | Import detection reports |
| `importStaffData(data)` | Import staff array |
| `importTrucksData(data)` | Import trucks array |
| `importGenericData(path, data)` | Import to any path |
| `batchImport(map)` | Import multiple types at once |
| `clearAllData(true)` | Delete all data (CAREFUL!) |

---

## Troubleshooting

**"Permission denied" error?**
- Check Firebase security rules in Realtime Database
- Ensure you're logged in as admin
- Update rules to allow imports

**Data not appearing?**
- Refresh the Firebase Console
- Check your Database URL is correct
- Verify imports completed without errors

**Want to import real data?**
1. Export your JSON files
2. Modify `src/scripts/importData.ts` to use your data
3. Run import again

---

## Next Steps

✅ Import completed
⏳ Visit your database at: https://cleanup-system-default-rtdb.firebaseio.com/
⏳ Integrate data into your components
⏳ Build real-time features
⏳ Deploy to production

---

Happy importing! 🚀
