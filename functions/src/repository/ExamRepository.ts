/* eslint-disable max-len */
import functions = require("firebase-functions")
import {source} from "../infra/DataSource";
import {ExamInstanceSummary} from "../model/ExamInstanceSummary";
import {ExamInstanceDetail} from "../model/ExamInstanceDetail";
import {ExamInstanceDetailsConverter, ExamInstanceSummaryConverter} from "./converters/ExamDataConverter";
import {RepositoryResponse} from "./data/RepositoryResponse";
import {Question} from "../model/Question";
import {QuestionRepository} from "./QuestionRepository";
import {ExamInstanceState, ExamInstanceStateBuilder} from "../model/ExamInstanceState";
import {Examinee} from "../model/Examinee";
import {ExamineeConverter} from "./converters/ExamineeConverter";

const repository = source.repository;


export const ExamRepository = {
    listActiveExams: async (examineeId: string): Promise<RepositoryResponse<ExamInstanceSummary[]>> => {
        const examInstances: ExamInstanceSummary[] = [];
        const response: RepositoryResponse<ExamInstanceSummary[]> = {
            responseCode: -1,
            data: examInstances,
        };
        functions.logger.log("Repository querying active exams for::", examineeId);
        await repository
            .collection("ExamInstance")
            .withConverter(ExamInstanceSummaryConverter)
            .where("examineeId", "==", examineeId)
            .where("status", "==", "ready")
            .get()
            .then((snapshot: FirebaseFirestore.QuerySnapshot<ExamInstanceSummary>) => {
                functions.logger.log("Found results::", snapshot.docs.length);
                snapshot.forEach((element) => {
                    examInstances.push(element.data());
                });
                response.responseCode = 0;
            });
        return response;
    },

    startExam: async (examineeId: string, examInstanceId: string): Promise<RepositoryResponse<ExamInstanceState>> => {
        const repositoryResponse: RepositoryResponse<ExamInstanceState> = {
            responseCode: -1,
            data: undefined,
        };
        if ((examineeId === undefined || examineeId === "") ||
            (examInstanceId === undefined || examInstanceId === "")) {
            repositoryResponse.responseCode = 1;
            return repositoryResponse;
        }
        const examInstanceStateBuilder: ExamInstanceStateBuilder = new ExamInstanceStateBuilder();
        examInstanceStateBuilder.withExamInstanceId(examInstanceId);
        examInstanceStateBuilder.withExamineeId(examineeId);
        const examInstanceRef: FirebaseFirestore.DocumentReference<ExamInstanceDetail> =
            repository.collection("ExamInstance").withConverter(ExamInstanceDetailsConverter).doc(examInstanceId);
        const examInstanceDoc: FirebaseFirestore.DocumentSnapshot<ExamInstanceDetail> = await examInstanceRef.get();
        if (!examInstanceDoc.exists) {
            repositoryResponse.responseCode = 2;
            return repositoryResponse;
        }
        const examInstanceDetail = examInstanceDoc.data();
        if (examInstanceDetail === undefined) {
            repositoryResponse.responseCode = 2;
            return repositoryResponse;
        }
        if (examineeId !== examInstanceDetail.examineeId) {
            repositoryResponse.responseCode = 3;
            return repositoryResponse;
        }
        if ("ready" !== examInstanceDetail.status) {
            repositoryResponse.responseCode = 4;
            return repositoryResponse;
        }
        examInstanceDetail.setInProgress();
        const update = await examInstanceRef.set(examInstanceDetail, {
            merge: true,
        }).then(() => {
            return 0;
        }).catch((e) => {
            functions.logger.error("Repository failed to update exam Instace", e);
            return 5;
        });
        if (update === 0) {
            const nextQuestionId: string = examInstanceDetail.questions[0];
            functions.logger.log("Starting exam::"+examInstanceDetail.id+"::Question::"+nextQuestionId);
            const questionFromRepo: RepositoryResponse<Question> = await QuestionRepository.getQuestion(nextQuestionId);
            if (questionFromRepo.responseCode === 0) {
                examInstanceStateBuilder.withStatus("InProgress");
                examInstanceStateBuilder.withDuration(examInstanceDetail.duration);
                if (examInstanceDetail.startTime) {
                    examInstanceStateBuilder.withStartTime(examInstanceDetail.startTime);
                }
                examInstanceStateBuilder.withTotalQuestions(examInstanceDetail.totalQuestions);
                examInstanceStateBuilder.withCurrentQuestionIndex(0);
                if (questionFromRepo.data) {
                    examInstanceStateBuilder.withNextQuestion(questionFromRepo.data);
                }
                repositoryResponse.responseCode = 0;
                repositoryResponse.data = examInstanceStateBuilder.build();
            }
        } else {
            repositoryResponse.responseCode = 6;
        }
        return repositoryResponse;
    },

    createNewExamInstance: async (examInstanceDetail: ExamInstanceDetail): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        await repository.collection("ExamInstance")
            .withConverter(ExamInstanceDetailsConverter)
            .add(examInstanceDetail)
            .then((data: FirebaseFirestore.DocumentReference<ExamInstanceDetail>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },

    createNewExaminee: async (examinee: Examinee): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        await repository.collection("Examinee")
            .withConverter(ExamineeConverter)
            .add(examinee)
            .then((data: FirebaseFirestore.DocumentReference<Examinee>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },
};
