"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionGet = exports.collectionDeleteItem = exports.collectionDeleteMany = exports.collectionAddMany = exports.collectionPatchItem = exports.singlePatch = exports.initFirebaseAdmin = exports.initFirebaseVite = exports.initFirebase = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
const app_2 = require("firebase/app");
const lite_1 = require("firebase/firestore/lite");
let db;
const initFirebase = (config) => {
    const app = (0, app_2.initializeApp)(config);
    db = (0, lite_1.getFirestore)(app);
};
exports.initFirebase = initFirebase;
const initFirebaseVite = (env) => {
    const firebaseConfig = {
        apiKey: env['VITE_FIREBASE_API_KEY_1'],
        authDomain: env['VITE_FIREBASE_AUTH_DOMAIN_1'],
        databaseURL: env['VITE_FIREBASE_DATABASE_URL_1'],
        projectId: env['VITE_FIREBASE_PROJECT_ID_1'],
        storageBucket: env['VITE_FIREBASE_STORAGE_BUCKET_1'],
        messagingSenderId: env['VITE_FIREBASE_MESSAGING_SENDER_ID_1'],
        appId: env['VITE_FIREBASE_APP_ID_1'],
        measurementId: env['VITE_FIREBASE_MEASUREMENT_ID_1'],
    };
    (0, exports.initFirebase)(firebaseConfig);
};
exports.initFirebaseVite = initFirebaseVite;
const initFirebaseAdmin = () => {
    const serviceAccountPath = path.resolve('../../firebaseServiceAccount.json');
    console.log('serviceAccountPath ->', serviceAccountPath);
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Service account file not found');
    }
    const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountJson);
    const { project_id } = serviceAccount;
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)(serviceAccountPath),
        databaseURL: `https://${project_id}.firebaseio.com`,
        storageBucket: `gs://${project_id}.appspot.com`,
    });
    return (0, storage_1.getStorage)().bucket();
};
exports.initFirebaseAdmin = initFirebaseAdmin;
const ts = () => new Date().toISOString();
const generateCreatedDate = () => ({
    _createdDate: ts(),
});
const generateModifiedDate = () => ({
    _modifiedDate: ts(),
});
const withDates = (data, withCreatedDate, withModifiedDate) => {
    let output = Object.assign({}, data);
    if (withCreatedDate) {
        output = Object.assign(Object.assign({}, output), generateCreatedDate());
    }
    if (withModifiedDate) {
        output = Object.assign(Object.assign({}, output), generateModifiedDate());
    }
    return output;
};
function singlePatch(nodeName, data) {
    const ref = (0, lite_1.doc)(db, 'singles', nodeName);
    return (0, lite_1.setDoc)(ref, withDates(data, false, true), { merge: true });
}
exports.singlePatch = singlePatch;
function collectionPatchItem(nodeName, id, data) {
    const ref = (0, lite_1.doc)(db, nodeName, id);
    return (0, lite_1.setDoc)(ref, withDates(data, false, true), { merge: true });
}
exports.collectionPatchItem = collectionPatchItem;
function collectionAddMany(nodeName, data) {
    const batch = (0, lite_1.writeBatch)(db);
    Object.keys(data).forEach((id) => {
        const ref = (0, lite_1.doc)(db, nodeName, id);
        batch.set(ref, data[id]);
    });
    return batch.commit();
}
exports.collectionAddMany = collectionAddMany;
function collectionDeleteMany(nodeName, ids) {
    const batch = (0, lite_1.writeBatch)(db);
    ids.forEach((id) => {
        const ref = (0, lite_1.doc)(db, nodeName, id);
        batch.delete(ref);
    });
    return batch.commit();
}
exports.collectionDeleteMany = collectionDeleteMany;
function collectionDeleteItem(nodeName, id) {
    const ref = (0, lite_1.doc)(db, nodeName, id);
    return (0, lite_1.deleteDoc)(ref);
}
exports.collectionDeleteItem = collectionDeleteItem;
function collectionGet(nodeName) {
    return __awaiter(this, void 0, void 0, function* () {
        const ref = (0, lite_1.collection)(db, nodeName);
        const snapshot = yield (0, lite_1.getDocs)(ref);
        return snapshot.docs.map((doc) => doc.data());
    });
}
exports.collectionGet = collectionGet;
