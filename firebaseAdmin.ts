import {
  initializeApp,
  getApps,
  App,
  getApp,
  cert,
  ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage"; // Correct import for getStorage

import serviceKey from "@/service_key.json"; // Ensure this path is correct

let app: App;

if (getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceKey as ServiceAccount), // Type assertion to ServiceAccount
  });
} else {
  app = getApp();
}

const adminDb = getFirestore(app);
const adminStorage = getStorage(app);

export { app as adminApp, adminDb, adminStorage };
