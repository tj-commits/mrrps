
  import { initializeApp } from 'firebase/app'
   import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVWiWTsaDos007-nnpbvvgkGhloecQ7ks",
  authDomain: "mrrps-eca1d.firebaseapp.com",
  projectId: "mrrps-eca1d",
  storageBucket: "mrrps-eca1d.appspot.com",
  messagingSenderId: "852118260985",
  appId: "1:852118260985:web:83e3643300cc7c99676628"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const storage = getStorage(app)

export { storage }