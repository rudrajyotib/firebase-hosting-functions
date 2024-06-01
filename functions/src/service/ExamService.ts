/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {EvaluateRequest} from "../api/interfaces/ExamInteractionDto";
import {ExamInstanceState} from "../model/ExamInstanceState";
import {ExamRepository} from "../repository/ExamRepository";
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
        const examStartRepositoryResponse = await ExamRepository.startExam(examineeId, examInstanceId);
        return {
            responseCode: examStartRepositoryResponse.responseCode,
            data: examStartRepositoryResponse.data,
        };
    },
};
