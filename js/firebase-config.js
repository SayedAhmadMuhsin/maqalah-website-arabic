const firebaseConfig = {
  apiKey: "AIzaSyBFvIOUoVumsrY5Ew_N7xqXMHbBYOYfOQw",
  authDomain: "maqalah-app.firebaseapp.com",
  projectId: "maqalah-app",
  storageBucket: "maqalah-app.firebasestorage.app",
  messagingSenderId: "275244315355",
  appId: "1:275244315355:web:0eef88ac7695acafefd2fe"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
