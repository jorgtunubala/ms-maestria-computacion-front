export const environment = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4413',

    firebaseConfig: {
        apiKey: window['env']?.FIREBASE_API_KEY || '',
        authDomain: window['env']?.FIREBASE_AUTH_DOMAIN || '',
        projectId: window['env']?.FIREBASE_PROJECT_ID || '',
        storageBucket: window['env']?.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: window['env']?.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: window['env']?.FIREBASE_APP_ID || '',
    },
};

export const gestion_solicitudes = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4412',
};

export const gestion_autenticacion = {
    production: true,
    api_url: 'https://apptest.unicauca.edu.co:4410',
};
