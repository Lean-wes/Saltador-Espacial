// Configuración de Firebase - REEMPLAZA con tus credenciales
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456",
    measurementId: "G-XXXXXXXXXX"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics();

// Configuración de AdMob (para apps móviles con Cordova/Capacitor)
// Para web pura, usamos Google AdSense como se muestra en el HTML
const adConfig = {
    bannerAdUnitId: 'ca-app-pub-xxx/xxx',      // Para móvil
    interstitialAdUnitId: 'ca-app-pub-xxx/xxx', // Para móvil
    rewardedAdUnitId: 'ca-app-pub-xxx/xxx',     // Para móvil
    // IDs de AdSense para web:
    adsenseClientId: 'ca-pub-TU_ID',
    adsenseSlots: {
        banner: 'TU_SLOT_BANNER',
        native: 'TU_SLOT_NATIVO'
    }
};

// Exportar para uso global
window.firebaseConfig = firebaseConfig;
window.adConfig = adConfig;
window.analytics = analytics;
