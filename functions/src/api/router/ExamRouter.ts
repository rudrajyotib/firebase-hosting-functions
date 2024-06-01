/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AnswerQuestion, Evaluate, ListActiveExam, StartExam} from "../controller/ExamController";
const examRouter = express.Router();

examRouter.get("/active", ListActiveExam);
examRouter.post("/start", StartExam);
examRouter.post("/answer", AnswerQuestion);
examRouter.post("/evaluate", Evaluate);

export {examRouter};
