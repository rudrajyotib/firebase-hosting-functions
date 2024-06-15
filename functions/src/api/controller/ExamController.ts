/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Request, Response} from "express";
import functions = require("firebase-functions")
import {ExamRepository} from "../../repository/ExamRepository";
import {ExamInstanceSummary} from "../../model/ExamInstanceSummary";
import {ActiveExamQueryResponseDefinition, ApiSubmitAnswerResponse, EvaluateRequest, ExamResultResponse, ResponseQuestionBody, StartExamResponse, SubmitAnswerRequest} from "../interfaces/ExamInteractionDto";
import {ExamInstanceState} from "../../model/ExamInstanceState";
import {ApiResponse} from "../interfaces/ApiResponse";
import {ServiceResponse} from "../../service/data/ServiceResponse";
import {ExamService} from "../../service/ExamService";
import {ExamResult} from "../../model/ExamResult";


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
                console.log("Receieved service response on start Exam::"+JSON.stringify(serviceResponse.data));
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
                    // eslint-disable-next-line no-prototype-builtins
                    questionIndex: serviceResponse.data.getCurrentQuestionIndex(),
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
                const answerQuestionResponse: ApiSubmitAnswerResponse = {
                    allAnswered: serviceResponse.data.isAllAnswered(),
                    secondsRemaining: serviceResponse.data.getRemainingSeconds(),
                    questionIndex: serviceResponse.data.currentQuestionIndex ?
                        serviceResponse.data.currentQuestionIndex : -1,
                    indexAtLastQuestion: serviceResponse.data.isLastQuestion(),
                };
                if (serviceResponse.data.nextQuestion) {
                    const nextQuestion: ResponseQuestionBody = {
                        displayFormat: serviceResponse.data.nextQuestion.format,
                        questionLines: serviceResponse.data.nextQuestion.questionLines,
                        options: serviceResponse.data.nextQuestion.options,
                        questionId: serviceResponse.data.nextQuestion.id,
                    };
                    answerQuestionResponse.nextQuestion = {
                        question: nextQuestion,
                        id: serviceResponse.data.nextQuestion.id,
                    };
                }
                apiResponse.responseCode = 0;
                apiResponse.data = answerQuestionResponse;
            } else {
                responseStatus = 500;
            }
        } else if (serviceResponse.responseCode > 0) {
            apiResponse.responseCode = serviceResponse.responseCode;
            responseStatus = 400;
        } else {
            apiResponse.responseCode = serviceResponse.responseCode;
            responseStatus = 500;
        }

        res.status(responseStatus).json(apiResponse);
    };

export const Evaluate = async (req: Request, res: Response) => {
    const evaluateRequest : EvaluateRequest = req.body;
    ExamService
        .evaluate(evaluateRequest)
        .then((success: ServiceResponse<ExamResult>)=>{
            if (success.responseCode === 0 ) {
                const examResult: ExamResultResponse = {
                    examineeId: evaluateRequest.examineeId,
                    examInstanceId: evaluateRequest.examInstanceId,
                    totalMarks: 0,
                    totalScore: 0,
                };
                if (success.data) {
                    examResult.totalMarks = success.data.totalMarks;
                    examResult.totalScore = success.data.score;
                }
                res.status(200).send(examResult);
            } else if (success.responseCode > 0) {
                res.status(400).send();
            } else {
                res.status(500).send();
            }
        })
        .catch((err) => {
            console.error("Exam controller received error response on evaluation", err);
            res.status(500).json({
                accepted: false,
            });
        });
};
