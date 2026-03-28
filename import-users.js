#!/usr/bin/env node

/**
 * Firebase Data Import Script
 * Adds admin and staff data to Firebase Realtime Database
 */

import { executeImport } from './src/scripts/importData.ts';

async function runImport() {
    try {
        console.log('🚀 Starting Firebase data import...\n');
        await executeImport();
        console.log('\n✅ Import completed successfully!');
        console.log('📊 Check your Firebase Console to verify the data was added.');
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

runImport();