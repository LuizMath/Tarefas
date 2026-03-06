import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCqWSy68K_MLQ8_vdj1D3sgOffnTS8-Oy0",
  authDomain: "tarefasplus-afa1b.firebaseapp.com",
  projectId: "tarefasplus-afa1b",
  storageBucket: "tarefasplus-afa1b.firebasestorage.app",
  messagingSenderId: "876489378825",
  appId: "1:876489378825:web:685f38ef65ddc55559fcd8",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };
