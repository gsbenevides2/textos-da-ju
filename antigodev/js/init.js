if (typeof firebase === 'undefined') throw new Error('hosting/init-error: Firebase SDK not detected. You must include it before /__/firebase/init.js'); 
firebase.initializeApp({
  "apiKey": "AIzaSyCoRj25llKfW8RDuNHe5kRCN-ogwCgYOJI",
  "databaseURL": "https://textos-da-ju.firebaseio.com",
  "storageBucket": "textos-da-ju.appspot.com",
  "authDomain": "textos-da-ju.web.app",
  "messagingSenderId": "886437033630",
  "projectId": "textos-da-ju",
  "appId": "1:886437033630:web:1ae8bddbce232d02"
});
