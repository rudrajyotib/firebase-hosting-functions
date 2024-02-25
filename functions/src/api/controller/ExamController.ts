/* eslint-disable max-len */
import {Request, Response} from "express";
import functions = require("firebase-functions")
import {ExamRepository} from "../../repository/ExamRepository";
import {ExamInstanceSummaryDto} from "../interfaces/ExamInstanceSummaryDto";
import {ExamInstanceSummary} from "../../model/ExamInstanceSummary";


export const ListActiveExam =
    async (req: Request, res: Response) => {
        const examineeId = req.query.examineeId;
        functions.logger.log("received exam request for", examineeId);
        const examInstances =await ExamRepository.listActiveExams(""+examineeId);
        const examSummaries: ExamInstanceSummaryDto[] =
        examInstances.map((examInstance: ExamInstanceSummary)=>{
            const examSummary: ExamInstanceSummaryDto = {
                id: examInstance.examInstanceId,
                label: examInstance.examTitle + " by " + examInstance.organiser,
                examineeId: ""+examineeId,
                organiser: examInstance.organiser,
                status: examInstance.status,
            };
            return examSummary;
        });
        res.status(200).json(examSummaries);
    };
