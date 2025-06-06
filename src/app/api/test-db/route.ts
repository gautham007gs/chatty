
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Our initialized Firestore instance
import { collection, getDocs, limit } from 'firebase/firestore';

export async function GET() {
  // This is a simple test to try and read from Firestore.
  // For this to work, you need:
  // 1. A Firebase project with Firestore enabled.
  // 2. Your Firebase config keys in .env.local (or environment variables).
  // 3. Firestore security rules that allow reads (e.g., allow read: if true; for testing ONLY).

  try {
    // Try to get a list of collections as a basic test.
    // Or, try to read a few documents from a known collection if you have one.
    // Example: Get 1 document from a 'users' collection (replace 'users' with your collection name)
    // const usersCol = collection(db, 'users');
    // const q = query(usersCol, limit(1));
    // const userSnapshot = await getDocs(q);

    // For a more generic test, let's try listing collections.
    // Firestore doesn't have a direct "list collections" client-side API for security reasons.
    // So, let's try to read from a hypothetical 'test_collection'.
    // You would need to create this collection and add a document in your Firestore console for this to succeed.
    
    const testColRef = collection(db, '_internal_test_collection_do_not_use_for_prod'); // A dummy collection
    const querySnapshot = await getDocs(limit(testColRef, 1));
    
    if (!querySnapshot.empty) {
      return NextResponse.json({ 
        message: 'Successfully connected to Firestore and read a document.',
        documentId: querySnapshot.docs[0].id
      });
    } else {
       return NextResponse.json({ 
        message: 'Connected to Firestore, but the test collection is empty or does not exist. Please create a collection named "_internal_test_collection_do_not_use_for_prod" with at least one document in your Firestore console for a successful read test.',
      });
    }

  } catch (error: any) {
    console.error("Firestore connection test error:", error);
    return NextResponse.json(
      { 
        message: 'Failed to connect to Firestore or read data.', 
        error: error.message,
        details: "Ensure your Firebase project is set up, Firestore is enabled, environment variables (NEXT_PUBLIC_FIREBASE_...) are correct in .env.local, and Firestore security rules allow access."
      }, 
      { status: 500 }
    ); // Added missing closing parenthesis here
  }
}
