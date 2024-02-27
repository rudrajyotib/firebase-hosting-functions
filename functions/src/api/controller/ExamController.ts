/* eslint-disable max-len */
import {Request, Response} from "express";
import functions = require("firebase-functions")
import {ExamRepository} from "../../repository/ExamRepository";
import {ExamInstanceSummary} from "../../model/ExamInstanceSummary";
import {ActiveExamQueryResponseDefinition, ResponseQuestionBody, StartExamResponse} from "../interfaces/ExamInteractionDto";
import {RepositoryResponse} from "../../repository/data/RepositoryResponse";
import {ExamInstanceState} from "../../model/ExamInstanceState";
import {ApiResponse} from "../interfaces/ApiResponse";


export const ListActiveExam =
    async (req: Request, res: Response) => {
        const examineeId = req.query.examineeId;
        functions.logger.log("received exam request for", examineeId);
        const examInstances = await ExamRepository.listActiveExams("" + examineeId);
        if (examInstances.responseCode !== 0 || !examInstances.data) {
            res.status(400).send("No exam found");
            return;
        }
        const examSummaries: ActiveExamQueryResponseDefinition[] =
            examInstances.data.map((examInstance: ExamInstanceSummary) => {
                const examSummary: ActiveExamQueryResponseDefinition = {
                    id: examInstance.examInstanceId,
                    label: examInstance.examTitle + " by " + examInstance.organiser,
                    examineeId: "" + examineeId,
                    organiser: examInstance.organiser,
                    status: examInstance.status,
                };
                return examSummary;
            });
        res.status(200).json(examSummaries);
    };

export const StartExam =
    async (req: Request, res: Response) => {
        const examineeId = req.body.examineeId;
        const examInstanceId = req.body.examInstanceId;
        functions.logger.log("received exam start for", examineeId);
        const repositoryResponse: RepositoryResponse<ExamInstanceState> = await ExamRepository.startExam(examineeId, examInstanceId);
        const apiResponse: ApiResponse<StartExamResponse> = {
            responseCode: repositoryResponse.responseCode,
        };
        if (repositoryResponse.responseCode === 0 && repositoryResponse.data) {
            if (repositoryResponse.data.nextQuestion) {
                apiResponse.responseCode = 0;
                const nextQuestion: ResponseQuestionBody = {
                    displayFormat: repositoryResponse.data.nextQuestion.format,
                    questionLines: repositoryResponse.data.nextQuestion.questionLines,
                    options: repositoryResponse.data.nextQuestion.options,
                };
                const startExamResponse: StartExamResponse = {
                    nextQuestion: nextQuestion,
                    totalQuestions: repositoryResponse.data.totalQuestions,
                    secondsRemaining: repositoryResponse.data.getRemainingSeconds(),
                    questionId: repositoryResponse.data.nextQuestion.id,
                };
                apiResponse.data = startExamResponse;
            }
        }
        res.status(200).json(apiResponse);
    };
