// ==============================================
// এখানে তোমার নিজের Firebase প্রজেক্টের কনফিগ বসাও
// Firebase Console (console.firebase.google.com) থেকে
// Project Settings > General > Your apps > SDK setup and configuration
// থেকে এই মানগুলো কপি করে নিচে পেস্ট করো।
// README.md ফাইলে ধাপে ধাপে নির্দেশনা দেওয়া আছে।
// ==============================================

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_PROJECT.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT.appspot.com",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
