

import {getFirestore} from "firebase-admin/firestore";


const firestore = getFirestore();


export const source = {
    repository: firestore,
};
