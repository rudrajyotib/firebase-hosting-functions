/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Request, Response} from "express";
import functions = require("firebase-functions")
import {ExamRepository} from "../../repository/ExamRepository";
import {ExamInstanceSummary} from "../../model/ExamInstanceSummary";
import {ActiveExamQueryResponseDefinition, ApiSubmitAnswerResponse, EvaluateRequest, ResponseQuestionBody, StartExamResponse, SubmitAnswerRequest} from "../interfaces/ExamInteractionDto";
import {ExamInstanceState} from "../../model/ExamInstanceState";
import {ApiResponse} from "../interfaces/ApiResponse";
import {ServiceResponse} from "../../service/data/ServiceResponse";
import {ExamService} from "../../service/ExamService";


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
        const serviceResponse: ServiceResponse<ExamInstanceState> = await ExamService.startExam(examineeId, examInstanceId);
        const apiResponse: ApiResponse<StartExamResponse> = {
            responseCode: serviceResponse.responseCode,
        };
        if (serviceResponse.responseCode === 0 && serviceResponse.data) {
            if (serviceResponse.data.nextQuestion) {
                apiResponse.responseCode = 0;
                const nextQuestion: ResponseQuestionBody = {
                    displayFormat: serviceResponse.data.nextQuestion.format,
                    questionLines: serviceResponse.data.nextQuestion.questionLines,
                    options: serviceResponse.data.nextQuestion.options,
                    questionId: serviceResponse.data.nextQuestion.id,
                };
                const startExamResponse: StartExamResponse = {
                    nextQuestion: nextQuestion,
                    totalQuestions: serviceResponse.data.totalQuestions,
                    secondsRemaining: serviceResponse.data.getRemainingSeconds(),
                    questionId: serviceResponse.data.nextQuestion.id,
                };
                apiResponse.data = startExamResponse;
            }
        }
        res.status(200).json(apiResponse);
    };

export const AnswerQuestionAndMoveNext =
    async (req: Request, res: Response) => {
        const submitAnswerRequest: SubmitAnswerRequest = req.body;
        const serviceResponse: ServiceResponse<ExamInstanceState> =
            await ExamService.submitAnswerAndMoveNext(submitAnswerRequest);
        const apiResponse: ApiResponse<ApiSubmitAnswerResponse> = {
            responseCode: -1,
        };
        let responseStatus = 200;
        if (serviceResponse.responseCode === 0 ) {
            if (serviceResponse.data) {
                if (serviceResponse.data.nextQuestion) {
                    apiResponse.responseCode = 0;
                    const nextQuestion: ResponseQuestionBody = {
                        displayFormat: serviceResponse.data.nextQuestion.format,
                        questionLines: serviceResponse.data.nextQuestion.questionLines,
                        options: serviceResponse.data.nextQuestion.options,
                        questionId: serviceResponse.data.nextQuestion.id,
                    };
                    const answerQuestionResponse: ApiSubmitAnswerResponse = {
                        nextQuestion: {
                            question: nextQuestion,
                            id: serviceResponse.data.nextQuestion.id,
                        },
                        allAnswered: false,
                        secondsRemaining: serviceResponse.data.getRemainingSeconds(),
                    };
                    apiResponse.data = answerQuestionResponse;
                }
            } else {
                responseStatus = 500;
            }
        } else if (serviceResponse.responseCode === 1) {
            const startExamResponse: ApiSubmitAnswerResponse = {
                allAnswered: true,
                secondsRemaining: 0,
            };
            apiResponse.responseCode = 0;
            apiResponse.data = startExamResponse;
        } else if (serviceResponse.responseCode === 5 || serviceResponse.responseCode === 7 || serviceResponse.responseCode === 9) {
            responseStatus = 500;
            apiResponse.responseCode = serviceResponse.responseCode;
        } else {
            responseStatus = 400;
            apiResponse.responseCode = serviceResponse.responseCode;
        }

        res.status(responseStatus).json(apiResponse);
    };

export const Evaluate = async (req: Request, res: Response) => {
    const evaluateRequest : EvaluateRequest = req.body;
    ExamService
        .evaluate(evaluateRequest)
        .then((success)=>{
            console.log("Exam controller on evaluate success from service", success);
            res.status(200).json({
                accepted: true,
            });
        })
        .catch((err) => {
            console.error("Exam controller received error response on evaluation", err);
            res.status(400).json({
                accepted: false,
            });
        });
};
