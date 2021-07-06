import * as firebase from 'firebase'
require('@firebase/firestore')
const firebaseConfig = {
    apiKey: "AIzaSyDx1nqpKkc-nvzS3nIbekAS9LcJRDSPJog",
    authDomain: "wily-5dd69.firebaseapp.com",
    projectId: "wily-5dd69",
    storageBucket: "wily-5dd69.appspot.com",
    messagingSenderId: "471546794467",
    appId: "1:471546794467:web:71996e900002ef6b1f50d6"
};
firebase.initializeApp(firebaseConfig);
export default firebase.firestore() ;