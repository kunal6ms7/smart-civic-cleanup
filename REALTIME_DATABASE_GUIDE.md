# Firebase Realtime Database Implementation Guide

## Overview

Your Cleanup-System project now fully supports Firebase Realtime Database for storing:
- **Citizens** - Regular users reporting issues
- **Staff** - Garbage collectors and field workers
- **Admins** - System administrators
- **Bins** - Trash bin locations and status
- **Reports** - Citizen reports about bins
- **Trucks** - Garbage collection vehicles
- **Community Posts** - User forum posts

---

## Database Structure

```
cleanup-system (root)
├── users/
│   └── {userId}
│       ├── email
│       ├── name
│       ├── phone
│       ├── address
│       ├── role: "citizen"
│       ├── reportsCount
│       └── createdAt
├── staff/
│   └── {staffId}
│       ├── email
│       ├── name
│       ├── designation
│       ├── status: "available" | "on-route" | "collecting"
│       └── vehicleId
├── admins/
│   └── {adminId}
│       ├── email
│       ├── name
│       ├── permissions: [...]
│       └── createdAt
├── bins/
│   └── {binId}
│       ├── location
│       ├── latitude/longitude
│       ├── fillLevel
│       ├── status: "empty" | "half-full" | "full"
│       └── lastUpdated
├── reports/
│   └── {reportId}
│       ├── userId
│       ├── binId
│       ├── description
│       ├── status: "pending" | "in-progress" | "resolved"
│       └── createdAt
├── trucks/
│   └── {truckId}
│       ├── registrationNumber
│       ├── driverId
│       ├── status: "available" | "on-route" | "full"
│       ├── latitude/longitude
│       └── lastUpdated
└── communityPosts/
    └── {postId}
        ├── userId
        ├── title
        ├── content
        ├── likes
        └── createdAt
```

---

## Usage Examples

### 1. Create a Citizen User During Login

```typescript
import { createCitizenUser, getUserProfile } from './services/databaseService';

const handleCitizenSignup = async (userId: string, email: string) => {
  try {
    const result = await createCitizenUser(userId, {
      email,
      name: 'John Doe',
      phone: '+91-9876543210',
      address: 'Mumbai, India',
      language: 'en',
      reportsCount: 0,
    });
    console.log('Citizen registered:', result.userId);
  } catch (error) {
    console.error('Signup failed:', error);
  }
};
```

### 2. Create Staff User (Admin Only)

```typescript
import { createStaffUser, updateStaffStatus } from './services/databaseService';

const handleAddStaff = async () => {
  try {
    const result = await createStaffUser('staff_123', {
      email: 'worker@cleanup.com',
      name: 'Rajesh Kumar',
      designation: 'Garbage Collector',
      vehicleId: 'truck_001',
      assignedArea: 'Downtown Mumbai',
    });
    
    // Update their status to available
    await updateStaffStatus('staff_123', 'available');
  } catch (error) {
    console.error('Staff creation failed:', error);
  }
};
```

### 3. Create Admin User (System Only)

```typescript
import { createAdminUser } from './services/databaseService';

const handleCreateAdmin = async (adminId: string) => {
  try {
    await createAdminUser(adminId, {
      email: 'admin@cleanup.com',
      name: 'System Admin',
      phone: '+91-8765432109',
      permissions: ['manage_users', 'manage_staff', 'view_reports', 'manage_bins'],
    });
  } catch (error) {
    console.error('Admin creation failed:', error);
  }
};
```

### 4. Add Trash Bin Locations

```typescript
import { addBinLocation, getAllBins } from './services/databaseService';

const handleAddBin = async () => {
  try {
    const result = await addBinLocation({
      location: 'High Street, Downtown',
      latitude: 19.0760,
      longitude: 72.8777,
      capacity: 200, // liters
      status: 'empty',
    });
    console.log('Bin added:', result.binId);
  } catch (error) {
    console.error('Failed to add bin:', error);
  }
};

// Load all bins in a component
const loadAllBins = async () => {
  const bins = await getAllBins();
  console.log('Available bins:', bins);
};
```

### 5. Citizen Reports Issues

```typescript
import { createReport, getUserReports } from './services/databaseService';

const handleReportBin = async (userId: string, binId: string) => {
  try {
    const result = await createReport(userId, {
      binId,
      description: 'Bin is overflowing and needs immediate attention',
      category: 'full',
      latitude: 19.0760,
      longitude: 72.8777,
      imageUrl: 'https://...',
      status: 'pending',
    });
    console.log('Report created:', result.reportId);
  } catch (error) {
    console.error('Report failed:', error);
  }
};

// Get all reports by a user
const myReports = await getUserReports(userId);
```

### 6. Track Garbage Trucks (Real-Time)

```typescript
import { addTruck, updateTruckLocation, updateTruckStatus } from './services/databaseService';
import { onTrucksUpdate } from './services/databaseService';
import { useEffect, useState } from 'react';

// Add a new truck
const handleAddTruck = async () => {
  try {
    const result = await addTruck({
      registrationNumber: 'MH-01-AB-1234',
      driverName: 'Sanjay Patel',
      driverId: 'staff_123',
      capacity: 5000,
    });
    console.log('Truck added:', result.truckId);
  } catch (error) {
    console.error('Failed to add truck:', error);
  }
};

// Real-time truck tracking in component
function TruckTracker() {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    // Subscribe to real-time truck updates
    const unsubscribe = onTrucksUpdate(
      (updatedTrucks) => {
        setTrucks(updatedTrucks);
        console.log('Trucks updated:', updatedTrucks);
      },
      (error) => console.error('Error:', error)
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Active Trucks ({trucks.length})</h2>
      {trucks.map((truck) => (
        <div key={truck.id}>
          <p>Vehicle: {truck.registrationNumber}</p>
          <p>Status: {truck.status}</p>
          <p>Location: {truck.latitude}, {truck.longitude}</p>
        </div>
      ))}
    </div>
  );
}
```

### 7. Update Bin Fill Level (Real-Time)

```typescript
import { updateBinStatus, onBinsUpdate } from './services/databaseService';
import { useEffect, useState } from 'react';

// Update bin status
const handleUpdateBin = async (binId: string) => {
  try {
    await updateBinStatus(binId, {
      status: 'half-full',
      fillLevel: 65,
    });
  } catch (error) {
    console.error('Failed to update bin:', error);
  }
};

// Real-time bin updates
function LiveBinStatus() {
  const [bins, setBins] = useState([]);

  useEffect(() => {
    const unsubscribe = onBinsUpdate(
      (updatedBins) => setBins(updatedBins),
      (error) => console.error('Error:', error)
    );

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>Bin Status</h2>
      {bins.map((bin) => (
        <div key={bin.id}>
          <p>{bin.location}</p>
          <p>Status: {bin.status}</p>
          <p>Fill Level: {bin.fillLevel}%</p>
        </div>
      ))}
    </div>
  );
}
```

### 8. Community Forum Posts

```typescript
import { createPost, getAllPosts, likePost } from './services/databaseService';

const handleCreatePost = async (userId: string) => {
  try {
    const result = await createPost(userId, {
      title: 'Tips for Reducing Waste',
      content: 'Here are some amazing ways to reduce waste...',
      category: 'tips',
      imageUrl: 'https://...',
    });
    console.log('Post created:', result.postId);
  } catch (error) {
    console.error('Failed to create post:', error);
  }
};

const handleLikePost = async (postId: string) => {
  try {
    const result = await likePost(postId);
    console.log('Post liked! Total likes:', result.likes);
  } catch (error) {
    console.error('Failed to like post:', error);
  }
};
```

### 9. Admin Dashboard - View All Data

```typescript
import {
  getAllCitizens,
  getAllStaff,
  getAllAdmins,
  getAllReports,
  getAllBins,
  getAllTrucks,
} from './services/databaseService';

const handleLoadDashboard = async () => {
  try {
    const [citizens, staff, admins, reports, bins, trucks] = await Promise.all([
      getAllCitizens(),
      getAllStaff(),
      getAllAdmins(),
      getAllReports(),
      getAllBins(),
      getAllTrucks(),
    ]);

    console.log('Dashboard Data:', {
      totalCitizens: citizens.length,
      totalStaff: staff.length,
      totalAdmins: admins.length,
      pendingReports: reports.filter((r) => r.status === 'pending').length,
      fullBins: bins.filter((b) => b.status === 'full').length,
      activeTrucks: trucks.filter((t) => t.status === 'on-route').length,
    });
  } catch (error) {
    console.error('Dashboard load failed:', error);
  }
};
```

---

## Integration with Your Components

### Login.tsx
```typescript
import { createCitizenUser, createStaffUser, createAdminUser } from './services/databaseService';

const handleLogin = async (role: 'citizen' | 'staff' | 'admin') => {
  const userId = auth.currentUser.uid;
  
  if (role === 'citizen') {
    await createCitizenUser(userId, { email, name, phone });
  } else if (role === 'staff') {
    await createStaffUser(userId, { email, name, designation });
  } else {
    await createAdminUser(userId, { email, name, permissions: [] });
  }
};
```

### LiveBinStatus.tsx
```typescript
import { onBinsUpdate } from './services/databaseService';

useEffect(() => {
  const unsubscribe = onBinsUpdate((bins) => setBins(bins));
  return () => unsubscribe();
}, []);
```

### TrackTruck.tsx
```typescript
import { onTrucksUpdate } from './services/databaseService';

useEffect(() => {
  const unsubscribe = onTrucksUpdate((trucks) => setTrucks(trucks));
  return () => unsubscribe();
}, []);
```

### CommandCenter.tsx (Admin)
```typescript
import {
  getAllReports,
  getAllStaff,
  updateReportStatus,
  updateStaffStatus,
} from './services/databaseService';

useEffect(() => {
  const loadAdminData = async () => {
    const reports = await getAllReports();
    const staff = await getAllStaff();
    setReports(reports);
    setStaff(staff);
  };
  
  loadAdminData();
}, []);
```

---

## Real-Time Features

All functions include real-time listeners for live updates:

```typescript
// Watch users as they register
const unsub1 = onUsersUpdate(
  (users) => console.log('Users updated:', users),
  (error) => console.error(error)
);

// Watch bins as their status changes
const unsub2 = onBinsUpdate((bins) => updateUI(bins));

// Watch reports as they're submitted
const unsub3 = onReportsUpdate((reports) => refreshDashboard(reports));

// Watch trucks in real-time
const unsub4 = onTrucksUpdate((trucks) => updateMap(trucks));

// Cleanup when done
return () => {
  unsub1();
  unsub2();
  unsub3();
  unsub4();
};
```

---

## Available Functions

### Users (Citizens)
- `createCitizenUser(userId, userData)` - Register citizen
- `getUserProfile(userId)` - Fetch user profile
- `updateUserProfile(userId, updates)` - Update user info
- `getAllCitizens()` - Get all citizens

### Staff
- `createStaffUser(staffId, staffData)` - Register staff
- `getStaffProfile(staffId)` - Fetch staff profile
- `updateStaffStatus(staffId, status)` - Change staff status
- `getAllStaff()` - Get all staff
- `getAvailableStaff()` - Get only available staff

### Admins
- `createAdminUser(adminId, adminData)` - Create admin
- `getAdminProfile(adminId)` - Fetch admin profile
- `getAllAdmins()` - Get all admins

### Bins
- `addBinLocation(binData)` - Add new bin
- `getAllBins()` - Fetch all bins
- `updateBinStatus(binId, updates)` - Update bin status/fill level

### Reports
- `createReport(userId, reportData)` - Submit citizen report
- `getAllReports()` - Fetch all reports
- `getUserReports(userId)` - Fetch user's reports
- `updateReportStatus(reportId, status)` - Update report status

### Trucks
- `addTruck(truckData)` - Add garbage truck
- `getAllTrucks()` - Fetch all trucks
- `updateTruckLocation(truckId, lat, lng)` - Update GPS location
- `updateTruckStatus(truckId, status)` - Update truck status

### Community
- `createPost(userId, postData)` - Create forum post
- `getAllPosts()` - Fetch all posts
- `likePost(postId)` - Like a post

### Real-Time Listeners
- `onUsersUpdate(callback)` - Listen to user changes
- `onBinsUpdate(callback)` - Listen to bin changes
- `onTrucksUpdate(callback)` - Listen to truck changes
- `onReportsUpdate(callback)` - Listen to report changes

---

## Testing Data

To test your database connection, add some dummy data:

```typescript
import { addBinLocation, createCitizenUser } from './services/databaseService';

// Add test bins
await addBinLocation({
  location: 'Downtown',
  latitude: 19.0760,
  longitude: 72.8777,
});

// Add test citizen
await createCitizenUser('test_user_1', {
  email: 'test@example.com',
  name: 'Test User',
});
```

---

## Security Rules (Update in Firebase Console)

```javascript
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "$uid === auth.uid"
      }
    },
    "staff": {
      ".read": "auth != null",
      ".write": "root.child('admins').child(auth.uid).exists()"
    },
    "admins": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": "false"
    },
    "bins": {
      ".read": "auth != null",
      ".write": "root.child('staff').child(auth.uid).exists() || root.child('admins').child(auth.uid).exists()"
    },
    "reports": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "trucks": {
      ".read": "auth != null",
      ".write": "root.child('staff').child(auth.uid).exists() || root.child('admins').child(auth.uid).exists()"
    },
    "communityPosts": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

## Troubleshooting

**Data not saving?**
- Check Firebase Realtime Database is enabled
- Verify security rules allow write operations
- Check console for error messages

**Real-time updates not working?**
- Ensure unsubscribe function is called properly
- Check browser console for listener errors
- Verify data path exists in database

**Permission denied errors?**
- Update security rules in Firebase Console
- Ensure user is authenticated
- Check user role permissions

---

Your database is now fully connected and ready to store all citizen, staff, and admin data! 🎉
