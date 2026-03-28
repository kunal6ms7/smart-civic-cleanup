# Firebase Data Import - Quick Reference

## Files Created

```
📁 src/
├── services/
│   └── importService.ts          ← Import utility functions
├── scripts/
│   └── importData.ts             ← Main import script with sample data
└── components/
    └── DataImportPanel.tsx       ← UI component for importing
    
📄 DATA_IMPORT_GUIDE.md           ← Complete documentation
```

---

## 3 Quick Ways to Import Data

### 1️⃣ **Easiest: Click Button in Admin Panel** (2 minutes)

```tsx
import DataImportPanel from './components/DataImportPanel';

function AdminPage() {
  return <DataImportPanel />;
}
```

Then click "Import Sample Data" button.

---

### 2️⃣ **Code: Run Import Function** (1 minute)

```tsx
import { executeImport } from './scripts/importData';

// Anywhere in your code:
await executeImport();

// Data imported! ✅
```

---

### 3️⃣ **Firebase Console: Upload JSON** (3 minutes)

1. Go to Firebase Console
2. Select cleanup-system → Realtime Database
3. Click ⋮ → Import JSON
4. Upload your JSON file
5. Click Import

---

## What Gets Imported

| Category | Count | Details |
|----------|-------|---------|
| 🗑️ Bins | 4 | Various locations with fill levels |
| 👥 Citizens | 3 | Sample users with reports |
| 👷 Staff | 2 | Garbage collectors |
| 🚛 Trucks | 2 | Collection vehicles |
| 📊 Reports | 3 | Detection/analysis data |

**Total: 14 database entries** ready to use!

---

## After Import: What's Available?

All these functions now have real data:

```typescript
// Get data
const bins = await getAllBins();        // Returns 4 bins
const users = await getAllCitizens();   // Returns 3 citizens
const staff = await getAllStaff();      // Returns 2 staff
const trucks = await getAllTrucks();    // Returns 2 trucks
const reports = await getAllReports();  // Returns 3 reports

// Watch live updates
onBinsUpdate((bins) => {});
onUsersUpdate((users) => {});
onTrucksUpdate((trucks) => {});
```

---

## Verify Import

### In Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select **cleanup-system**
3. Click **Realtime Database**
4. You should see:
   - bins/ folder with 4 entries
   - users/ folder with 3 entries
   - staff/ folder with 2 entries
   - trucks/ folder with 2 entries
   - reports/ folder with 3 entries

### In Your App:
```typescript
// Add to any component to verify
useEffect(() => {
  const checkData = async () => {
    const bins = await getAllBins();
    console.log(`✅ Database has ${bins.length} bins!`);
  };
  
  checkData();
}, []);
```

---

## Using Imported Data in Components

### LiveBinStatus.tsx
```typescript
import { getAllBins, onBinsUpdate } from './services/databaseService';

function LiveBinStatus() {
  const [bins, setBins] = useState([]);

  useEffect(() => {
    // Get initial 4 imported bins
    getAllBins().then(setBins);

    // Watch for real-time updates
    const unsub = onBinsUpdate(setBins);
    return () => unsub();
  }, []);

  return (
    <div>
      {bins.map(bin => (
        <div key={bin.id}>
          <p>{bin.location}</p>
          <p>Fill: {bin.fillLevel}%</p>
        </div>
      ))}
    </div>
  );
}
```

### AdminDashboard.tsx
```typescript
import { getAllCitizens, getAllStaff, getAllReports, getAllTrucks } from './services/databaseService';

async function AdminDashboard() {
  const [citizens, citizens] = useState([]);
  
  useEffect(() => {
    const loadData = async () => {
      const [c, s, r, t] = await Promise.all([
        getAllCitizens(),  // 3 citizens
        getAllStaff(),     // 2 staff
        getAllReports(),   // 3 reports
        getAllTrucks(),    // 2 trucks
      ]);
      
      setStats({
        totalUsers: c.length,        // 3
        totalStaff: s.length,        // 2
        pendingReports: r.filter(r => r.status === 'pending').length,
        totalTrucks: t.length,       // 2
      });
    };
    
    loadData();
  }, []);
}
```

---

## Database Structure After Import

```
cleanup-system-default-rtdb
├── bins
│   ├── -N71kL8x9sQ9: { location: "Downtown Mumbai...", fillLevel: 75 }
│   ├── -N71kL93x9sQ0: { location: "Central Park...", fillLevel: 45 }
│   ├── -N71kL95x9sQ1: { location: "Market Area...", fillLevel: 95 }
│   └── -N71kL97x9sQ2: { location: "Residential...", fillLevel: 20 }
│
├── users
│   ├── citizen1: { email: "...", name: "Rajesh Kumar", reportsCount: 3 }
│   ├── citizen2: { email: "...", name: "Priya Singh", reportsCount: 5 }
│   └── citizen3: { email: "...", name: "Anuj Patel", reportsCount: 2 }
│
├── staff
│   ├── staff1: { name: "Sanjay Worker", status: "available" }
│   └── staff2: { name: "Mohan Kumar", status: "on-route" }
│
├── trucks
│   ├── -N71kM1x9sQ0: { registration: "MH-01-AB-1234", status: "available" }
│   └── -N71kM2x9sQ1: { registration: "MH-01-CD-5678", status: "on-route" }
│
└── reports
    ├── -N71kM3x9sQ0: { userId: "citizen1", status: "resolved" }
    ├── -N71kM4x9sQ1: { userId: "citizen2", status: "pending" }
    └── -N71kM5x9sQ2: { userId: "system", status: "completed" }
```

---

## Common Tasks After Import

### Get All Bins
```typescript
const bins = await getAllBins();
// Returns 4 bins with different fill levels
```

### Find Full Bins
```typescript
const bins = await getAllBins();
const fullBins = bins.filter(b => b.fillLevel >= 90);
// Returns 1 bin at Market Area (95% full)
```

### Get Specific User
```typescript
const user = await getUserProfile('citizen1');
// Returns: { email: "...", name: "Rajesh Kumar", reportsCount: 3 }
```

### Track Trucks in Real-Time
```typescript
onTrucksUpdate((trucks) => {
  const activeTrucks = trucks.filter(t => t.status === 'on-route');
  updateMapWithTrucks(activeTrucks);
});
```

### Get Reports for Dashboard
```typescript
const reports = await getAllReports();
const pending = reports.filter(r => r.status === 'pending');
const completed = reports.filter(r => r.status === 'completed');
```

---

## If Something Goes Wrong

**Option 1: Clear and Re-import**
```typescript
import { clearAllData, executeImport } from './services/importService';

// Clear
await clearAllData(true);

// Re-import
await executeImport();
```

**Option 2: Check Console Errors**
```
Open DevTools (F12) → Console tab
Look for error messages with [Firebase] tag
```

**Option 3: Check Security Rules**
Firebase Console → Realtime Database → Rules
Ensure rules allow read/write on these paths:
- `bins`
- `users`
- `staff`
- `trucks`
- `reports`

---

## Database URL

Your data is stored at:
```
https://cleanup-system-default-rtdb.firebaseio.com/
```

Access it in code via:
```typescript
import { rtdb } from './firebase.config';
```

---

## Next Steps

1. ✅ Import functions created
2. ⏳ Choose import method (UI, code, or Firebase Console)
3. ⏳ Run the import
4. ⏳ Add DataImportPanel to your AdminDashboard
5. ⏳ Use getAllBins(), getAllCitizens(), etc. in your components
6. ⏳ Test real-time updates with onBinsUpdate(), onUsersUpdate(), etc.

---

## Support

- 📖 See [DATA_IMPORT_GUIDE.md](DATA_IMPORT_GUIDE.md) for detailed docs
- 📖 See [REALTIME_DATABASE_GUIDE.md](REALTIME_DATABASE_GUIDE.md) for API reference
- 💬 Check [DatabaseIntegrationExamples.tsx](src/components/DatabaseIntegrationExamples.tsx) for code examples

---

**Ready to import? Choose your method above!** 🚀
