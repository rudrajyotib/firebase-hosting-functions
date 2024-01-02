/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// import {onRequest} from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


import functions = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app');
initializeApp()
import express = require('express')
import { getFirestore } from 'firebase-admin/firestore';
import { QuestionRepository } from './repository/QuestionRepository';
const app = express()

const db = getFirestore()


app.get('/', (_req: any, _res: any) => {
    _res.send('Success at API Root')
})

app.get('/api', (_req: any, _res: any) => {
    console.log('console logging for api')
    functions.logger.log('received api request')
    db.collection('questions').doc('ZfQRsFN1AR7pGf2V4ZRD')
    .get()
    .then(snapshot  => {
        const data = snapshot.data()
        functions.logger.log('data as ::'+data)
        console.log('data as ::'+data)
        const finalData = {version: 3, ...data}
       _res.send(finalData)
    })
    .catch(rejection => {
        const data = rejection.data()
        functions.logger.log('rejection')
        _res.send(data)
    })
    // _res.send('Success at API')
})

app.get('/apx', (_req: any, _res: any) => {
    _res.send('Success at APX')
})

app.get('/apn', (_req: any, _res: any) => {
    _res.send('Success at APN')
})

app.get('/question', (_req: any, _res: any) => {
    QuestionRepository.getQuestion('ZfQRsFN1AR7pGf2V4ZRD2')
    .then(questionData => {
        _res.send(questionData)
    })
    // _res.send('Success at APN')
})



const main = express()
main.use('/api', app)

exports.app = functions.https.onRequest(main)