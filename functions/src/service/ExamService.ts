/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {EvaluateRequest, SubmitAnswerRequest} from "../api/interfaces/ExamInteractionDto";
import {ExamInstanceDetail} from "../model/ExamInstanceDetail";
import {ExamInstanceState, ExamInstanceStateBuilder} from "../model/ExamInstanceState";
import {Question} from "../model/Question";
import {ExamRepository} from "../repository/ExamRepository";
import {QuestionRepository} from "../repository/QuestionRepository";
import {RepositoryResponse} from "../repository/data/RepositoryResponse";
import {ServiceResponse} from "./data/ServiceResponse";

/* eslint-disable @typescript-eslint/no-empty-function */
export const ExamService = {
    evaluate: async (evaluationRequest: EvaluateRequest) => {
        ExamRepository
            .evaluate(evaluationRequest)
            .then((result)=>{
                console.log("Service has a result for evaluation", result);
                return 0;
            })
            .catch((err)=>{
                console.error("Service received an error on evaluation", err);
                return -1;
            });
    },
    startExam: async (examineeId: string, examInstanceId: string): Promise<ServiceResponse<ExamInstanceState>> => {
        const serviceResponse: ServiceResponse<ExamInstanceState> = {responseCode: -1};
        const examStartRepositoryResponse: RepositoryResponse<ExamInstanceState> =
            await ExamRepository.startExam(examineeId, examInstanceId);
        if (examStartRepositoryResponse.responseCode != 0) {
            serviceResponse.responseCode = examStartRepositoryResponse.responseCode;
            return serviceResponse;
        }
        if (examStartRepositoryResponse.data) {
            ExamRepository.updateExamStatusForExaminee(examineeId, examInstanceId, examStartRepositoryResponse.data?.status);
        }
        return {
            responseCode: examStartRepositoryResponse.responseCode,
            data: examStartRepositoryResponse.data,
        };
    },
    submitAnswerAndMoveNext: async (submitAnswerRequest: SubmitAnswerRequest): Promise<ServiceResponse<ExamInstanceState>> => {
        const serviceResponse: ServiceResponse<ExamInstanceState> = {responseCode: -1};
        const repositoryResponse: RepositoryResponse<ExamInstanceDetail> =
            await ExamRepository.recordAnswerAndMoveNext(submitAnswerRequest);
        if (repositoryResponse.responseCode != 0) {
            console.log("submitAnswerAndMoveNext::Did get update resp::"+ repositoryResponse.responseCode);
            serviceResponse.responseCode = repositoryResponse.responseCode;
            return serviceResponse;
        }
        if (!repositoryResponse.data) {
            console.error("ExamService.submitAnswerAndMoveNext::After marking answer and moving next, could not "+
                "received instance data for ExamInstanceId::"+submitAnswerRequest.examInstanceId
            );
            serviceResponse.responseCode = -1;
            return serviceResponse;
        }
        const examInstanceStateBuilder: ExamInstanceStateBuilder =
            new ExamInstanceStateBuilder();
        const examInstanceDetail: ExamInstanceDetail = repositoryResponse.data;
        if (submitAnswerRequest.questionIndex < (examInstanceDetail.questions.length-1)) {
            const questionResponse: RepositoryResponse<Question> =
                await QuestionRepository.getQuestion(examInstanceDetail.questions[examInstanceDetail.currentQuestionIndex]);
            if (questionResponse.responseCode != 0 ) {
                console.error("ExamService.submitAnswerAndMoveNext::after submitting answer, could not retrieve"+
                    " Question for Id::"+examInstanceDetail.questions[examInstanceDetail.currentQuestionIndex]
                );
                serviceResponse.responseCode = -2;
                return serviceResponse;
            }
            if (!questionResponse.data) {
                console.error("ExamService.submitAnswerAndMoveNext::after submitting answer, could not load data for "+
                    " Question for Id::"+examInstanceDetail.questions[examInstanceDetail.currentQuestionIndex]
                );
                serviceResponse.responseCode = -3;
                return serviceResponse;
            }
            const question = questionResponse.data;
            question.correctOptionIndex = -1;
            examInstanceStateBuilder.withNextQuestion(question);
        }
        const resultUpdateRes: RepositoryResponse<string> = await ExamRepository.updateAnswerRecord(repositoryResponse.data.examResultId,
            submitAnswerRequest.questionId, submitAnswerRequest.answer);
        if (resultUpdateRes.responseCode != 0) {
            serviceResponse.responseCode = resultUpdateRes.responseCode;
            return serviceResponse;
        }
        serviceResponse.responseCode = 0;

        examInstanceStateBuilder
            .withCurrentQuestionIndex(examInstanceDetail.currentQuestionIndex)
            .withDuration(examInstanceDetail.duration)
            .withExamInstanceId(examInstanceDetail.id)
            .withStatus(examInstanceDetail.status)
            .withTotalQuestions(examInstanceDetail.questions.length);
        if (examInstanceDetail.startTime) {
            examInstanceStateBuilder.withStartTime(examInstanceDetail.startTime);
        }
        serviceResponse.data = examInstanceStateBuilder.build();
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
};
