/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AnswerQuestionAndMoveNext, Evaluate, ListActiveExam, StartExam} from "../controller/ExamController";
const examRouter = express.Router();

examRouter.get("/active", ListActiveExam);
examRouter.post("/start", StartExam);
examRouter.post("/answer", AnswerQuestionAndMoveNext);
examRouter.post("/evaluate", Evaluate);

export {examRouter};
