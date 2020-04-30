cd functions
npm run build
cd ..
GOOGLE_APPLICATION_CREDENTIALS=service-account-credentials.json firebase functions:shell
