/* eslint-disable new-cap */
import express = require("express")
import {ListActiveExam, StartExam} from "../controller/ExamController";
const examRouter = express.Router();

examRouter.get("/active", ListActiveExam);
examRouter.post("/start", StartExam);

export {examRouter};
