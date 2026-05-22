import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey:            "AIzaSyCmhcl9MM-JmXq5ps82oVQu_9v5E5QVXn8",
    authDomain:        "sellnook-1.firebaseapp.com",
    projectId:         "sellnook-1",
    storageBucket:     "sellnook-1.firebasestorage.app",
    messagingSenderId: "567018222611",
    appId:             "1:567018222611:web:eca7ff654a6729d984fbe6"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const API  = "https://sellnook-backend.onrender.com";

export { app, auth, db, API };
