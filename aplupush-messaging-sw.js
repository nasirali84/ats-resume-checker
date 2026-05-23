importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.3.2/firebase-messaging.js');

// Initialize Aplu
const apluPushConfig = {
    apiKey: "AIzaSyBk0_Mtkm4zcrasVxHns2_E1YFjMoIb5OY",
	authDomain: "aplu-a19.firebaseapp.com",
	projectId: "aplu-a19",
	storageBucket: "aplu-a19.firebasestorage.app",
	messagingSenderId: "369676301185",
	appId: "1:369676301185:web:0a03a48c9315ecdc8f6e80"
};

try {
    importScripts('https://push.aplu.io/import-aplu-messaging.js');
} catch (err) {
    console.warn("Couldn't load aplu-script, falling back: ", err);
}