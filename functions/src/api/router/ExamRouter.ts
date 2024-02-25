/* eslint-disable new-cap */
import express = require("express")
import {ListActiveExam} from "../controller/ExamController";
const examRouter = express.Router();

examRouter.get("/active", ListActiveExam);

export {examRouter};
