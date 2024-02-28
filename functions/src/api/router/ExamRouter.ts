/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AnswerQuestion, ListActiveExam, StartExam} from "../controller/ExamController";
const examRouter = express.Router();

examRouter.get("/active", ListActiveExam);
examRouter.post("/start", StartExam);
examRouter.post("/answer", AnswerQuestion);

export {examRouter};
