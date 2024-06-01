/* eslint-disable max-len */
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


import functions = require("firebase-functions")
import {initializeApp} from "firebase-admin/app";
initializeApp();
import express = require("express")
import {getFirestore} from "firebase-admin/firestore";
// import { QuestionRepository } from './repository/QuestionRepository';
import {Request, Response} from "express";
import {examRouter} from "./api/router/ExamRouter";
import {AddExamConverter as addExamConverter, AddExamAndExaminee as addExamAndExaminee} from "./api/TestOnly";
import {organiserAdminRouter} from "./api/router/OrganiserAdminRouter";
const app = express();

const db = getFirestore();


app.get("/", (_req: any, _res: any) => {
    _res.send("Success at API Root");
});

app.get("/api", (_req: any, _res: any) => {
    console.log("console logging for api");
    functions.logger.log("received api request");
    db.collection("questions").doc("ZfQRsFN1AR7pGf2V4ZRD")
        .get()
        .then((snapshot) => {
            const data = snapshot.data();
            functions.logger.log("data as ::"+data);
            console.log("data as ::"+data);
            const finalData = {version: 3, ...data};
            _res.send(finalData);
        })
        .catch((rejection) => {
            const data = rejection.data();
            functions.logger.log("rejection");
            _res.send(data);
        });
    // _res.send('Success at API')
});

app.get("/apx", (_req: any, _res: any) => {
    _res.send("Success at APX");
});

app.get("/apn", (_req: any, _res: any) => {
    _res.send("Success at APN11");
});


app.use("/exams", examRouter);
app.use("/org", organiserAdminRouter);
app.get("/loadtestdata", (_req: Request, _res: Response) => {
    addExamAndExaminee(_req, _res);
});
app.get("/loadtestdatac", (_req: Request, _res: Response) => {
    addExamConverter(_req, _res);
});
const main = express();
main.use("/api", app);


exports.app = functions.https.onRequest(main);
