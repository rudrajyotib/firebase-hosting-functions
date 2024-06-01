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
import {EvaluateRequest, SubmitAnswerRequest} from "../api/interfaces/ExamInteractionDto";
import {DocumentSnapshot} from "firebase-admin/firestore";
import {ExamResultConverter} from "./converters/ExamResultConverter";
import {AnswerRecordBuilder, ExamResult, ExamResultBuilder} from "../model/ExamResult";
import {SubjectAndTopic} from "../model/SubjectAndTopic";
import {SubjectAndTopicConverter} from "./converters/SubjectAndTopicsConverter";
import {Syllabus, TopicAndQuestionCount} from "../model/Syllabus";
import {SyllabusConverter} from "./converters/SyllabusConverter";
import {Organiser} from "../model/Organiser";
import {OrganiserConverter} from "./converters/OrganiserConverter";
import {ExamTemplate} from "../model/ExamTemplate";
import {ExamTemplateConverter} from "./converters/ExamTemplateConverter";
// import {collection, query, where} from "firebase/firestore";

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
        if ("Ready" !== examInstanceDetail.status) {
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
            functions.logger.log("Starting exam::" + examInstanceDetail.id + "::Question::" + nextQuestionId);
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

    getExamInstance: async (examInstanceId: string): Promise<RepositoryResponse<ExamInstanceDetail>> => {
        const response: RepositoryResponse<ExamInstanceDetail> = {responseCode: -1};
        await repository.collection("ExamInstance")
            .withConverter(ExamInstanceDetailsConverter)
            .doc(examInstanceId)
            .get()
            .then((data: DocumentSnapshot<ExamInstanceDetail>) => {
                if (data.exists) {
                    response.data = data.data();
                    response.responseCode = 0;
                }
            })
            .catch((e) => {
                response.responseCode = 1;
                functions.logger.error("Error getting ExamInstanceDetail for ID::", examInstanceId, e);
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

    answerQuestion: async (submitAnswerRequest: SubmitAnswerRequest): Promise<RepositoryResponse<ExamInstanceState>> => {
        const repositoryResponse: RepositoryResponse<ExamInstanceState> = {
            responseCode: -1,
        };
        if ((submitAnswerRequest.examineeId === undefined || submitAnswerRequest.examineeId === "") ||
            (submitAnswerRequest.examInstanceId === undefined || submitAnswerRequest.examInstanceId === "") ||
            (submitAnswerRequest.questionId === undefined || submitAnswerRequest.questionId === "") ||
            (submitAnswerRequest.answer === undefined || (submitAnswerRequest.answer < 0))) {
            repositoryResponse.responseCode = 1;
            return repositoryResponse;
        }
        const examInstanceStateBuilder: ExamInstanceStateBuilder = new ExamInstanceStateBuilder();
        examInstanceStateBuilder.withExamInstanceId(submitAnswerRequest.examInstanceId);
        examInstanceStateBuilder.withExamineeId(submitAnswerRequest.examineeId);
        const examInstanceRef: FirebaseFirestore.DocumentReference<ExamInstanceDetail> =
            repository.collection("ExamInstance").withConverter(ExamInstanceDetailsConverter).doc(submitAnswerRequest.examInstanceId);
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
        if (submitAnswerRequest.examineeId !== examInstanceDetail.examineeId) {
            repositoryResponse.responseCode = 3;
            return repositoryResponse;
        }
        functions.logger.log("Status::" + examInstanceDetail.status + "SecondsRemaining::" + examInstanceDetail.getSecondsRemaining());
        if (!examInstanceDetail.isInProgress()) {
            repositoryResponse.responseCode = 4;
            return repositoryResponse;
        }
        const answerUpdate = examInstanceDetail.answerQuestionAndMoveToNext(submitAnswerRequest.questionId,
            submitAnswerRequest.answer);
        functions.logger.debug("After answer:", examInstanceDetail);
        if (answerUpdate < 0) {
            repositoryResponse.responseCode = 5;
            return repositoryResponse;
        }
        const update = await examInstanceRef.set(examInstanceDetail, {
            merge: true,
        }).then(() => {
            return 0;
        }).catch((e) => {
            functions.logger.error("Repository failed to update exam Instace", e);
            return 1;
        });
        if (update != 0) {
            repositoryResponse.responseCode = 7;
            return repositoryResponse;
        }
        if (answerUpdate === 1) {
            repositoryResponse.responseCode = 1;
            examInstanceStateBuilder.withStatus("AllAnswered");
            examInstanceStateBuilder.withDuration(0);
            repositoryResponse.data = examInstanceStateBuilder.build();
        }
        if (answerUpdate === 0) {
            const nextQuestionId: string = examInstanceDetail.questions[examInstanceDetail.currentQuestionIndex];
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
            } else {
                repositoryResponse.responseCode = 9;
            }
        }

        return repositoryResponse;
    },
    evaluate: async (evaluationRequest: EvaluateRequest) : Promise<RepositoryResponse<boolean>> => {
        const repositoryResponse: RepositoryResponse<boolean> = {
            responseCode: -1,
        };
        const examInstanceRef: FirebaseFirestore.DocumentReference<ExamInstanceDetail> =
            repository.collection("ExamInstance")
                .withConverter(ExamInstanceDetailsConverter)
                .doc(evaluationRequest.examInstanceId);
        const examInstanceDoc: FirebaseFirestore.DocumentSnapshot<ExamInstanceDetail> = await examInstanceRef.get();
        console.log("Repository:Evaluate received exam instance doc");
        if (!examInstanceDoc.exists) {
            console.log("Repository:Evaluate Doc not found");
        }
        const examInstanceDetail = examInstanceDoc.data();
        if ( (examInstanceDetail?.examineeId !== evaluationRequest.examineeId) ) {
            console.log("ExamineeId does not match");
        }
        await repository.collection("ExamResult")
            .withConverter(ExamResultConverter)
            .add(new ExamResultBuilder()
                .withStatus("NotEvaluated")
                .withScore(30)
                .withTotalMarks(40)
                .withQuestionAnswer(new AnswerRecordBuilder()
                    .withCorrectAnswerIndex(0)
                    .withGivenAnswerIndex(1)
                    .withQuestionId("Q1")
                    .withWeightage(1)
                    .withStatus("Answered")
                    .build())
                .withQuestionAnswer(new AnswerRecordBuilder()
                    .withCorrectAnswerIndex(0)
                    .withGivenAnswerIndex(1)
                    .withQuestionId("Q2")
                    .withWeightage(1)
                    .withStatus("Answered")
                    .build())
                .build()
            )
            .then((data: FirebaseFirestore.DocumentReference<ExamResult>) => {
                console.log("Evaluation created", data.id);
            })
            .catch((e) => {
                console.error("Evaluation repo error", e);
            });
        return repositoryResponse;
    },
    addSubjectAndTopic: async (subjectAndTopic: SubjectAndTopic) : Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        await repository.collection("SubjectAndTopic")
            .withConverter(SubjectAndTopicConverter)
            .add(subjectAndTopic)
            .then((data: FirebaseFirestore.DocumentReference<SubjectAndTopic>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },
    getSubjectAndTopic: async (subjectAndTopicId: string) : Promise<RepositoryResponse<SubjectAndTopic>> => {
        const response: RepositoryResponse<SubjectAndTopic> = {responseCode: -1};
        await repository.collection("SubjectAndTopic")
            .withConverter(SubjectAndTopicConverter)
            .doc(subjectAndTopicId)
            .get()
            .then((data: DocumentSnapshot<SubjectAndTopic>) => {
                if (data.exists) {
                    response.data = data.data();
                    response.responseCode = 0;
                }
            })
            .catch((e) => {
                response.responseCode = 1;
                functions.logger.error("Error getting SubjectAndTopic for ID::", subjectAndTopicId, e);
            });
        return response;
    },
    addSyllabus: async (subjectAndTopic: Syllabus) : Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        await repository.collection("Syllabus")
            .withConverter(SyllabusConverter)
            .add(subjectAndTopic)
            .then((data: FirebaseFirestore.DocumentReference<Syllabus>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },
    getSyllabus: async (syllabusId: string) : Promise<RepositoryResponse<Syllabus>> => {
        const response: RepositoryResponse<Syllabus> = {responseCode: -1};
        await repository.collection("Syllabus")
            .withConverter(SyllabusConverter)
            .doc(syllabusId)
            .get()
            .then((data: DocumentSnapshot<Syllabus>) => {
                if (data.exists) {
                    response.data = data.data();
                    response.responseCode = 0;
                }
            })
            .catch((e) => {
                response.responseCode = 1;
                functions.logger.error("Error getting Syllabus for ID::", syllabusId, e);
            });
        return response;
    },
    addTopicsToSyllabus: async (topicsAndQuestionsCounts: TopicAndQuestionCount[], syllabusId: string) : Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        const syllabusRef: FirebaseFirestore.DocumentReference<Syllabus> =
            repository.collection("Syllabus").withConverter(SyllabusConverter).doc(syllabusId);
        const syllabusDoc: FirebaseFirestore.DocumentSnapshot<Syllabus> = await syllabusRef.get();
        if (!syllabusDoc.exists) {
            response.responseCode = 1;
            response.data = "SyllabusId is not valid";
            return response;
        }
        const syllabus: Syllabus | undefined = syllabusDoc.data();
        if (syllabus === undefined) {
            response.responseCode = 2;
            response.data = "SyllabusId could not be retrieved";
            return response;
        }
        syllabus.topicsAndQuestionCounts = topicsAndQuestionsCounts;
        await syllabusRef.set(syllabus)
            .catch(()=>{
                response.responseCode= 3;
                response.data = "Error updating topics to syllabus";
            });

        return response;
    },
    addOrganiser: async (organiser: Organiser) : Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: 0, data: ""};
        await repository.collection("Organiser")
            .withConverter(OrganiserConverter)
            .add(organiser)
            .then((data: FirebaseFirestore.DocumentReference<Organiser>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },
    getOrganiser: async (organiserId: string) : Promise<RepositoryResponse<Organiser>> => {
        const response: RepositoryResponse<Organiser> = {responseCode: -1};
        await repository.collection("Organiser")
            .withConverter(OrganiserConverter)
            .doc(organiserId)
            .get()
            .then((data: DocumentSnapshot<Organiser>) => {
                if (data.exists) {
                    response.data = data.data();
                    response.responseCode = 0;
                } else {
                    response.responseCode = 1;
                }
            })
            .catch((e) => {
                response.responseCode = 1;
                functions.logger.error("Error getting Organiser for ID::", organiserId, e);
            });
        return response;
    },
    setSyllabusIdsToOrganiser: async (organiserId: string, syllabusIds: string[]): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const organiserRef: FirebaseFirestore.DocumentReference<Organiser> =
            repository.collection("Organiser").withConverter(OrganiserConverter).doc(organiserId);
        const organiserDoc: FirebaseFirestore.DocumentSnapshot<Organiser> = await organiserRef.get();
        if (!organiserDoc.exists) {
            response.responseCode = 1;
            response.data = "OrganiserId is not valid";
            return response;
        }
        const organiser: Organiser | undefined = organiserDoc.data();
        if (organiser === undefined) {
            response.responseCode = 2;
            response.data = "Organiser could not be retrieved";
            return response;
        }
        organiser.syllabus = syllabusIds;
        await organiserRef.set(organiser, {mergeFields: ["syllabusIds"]})
            .then(()=>{
                response.responseCode = 0;
            })
            .catch(()=>{
                response.responseCode= 3;
                response.data = "Error updating examIds to organiser";
            });
        return response;
    },
    setExamsToOrganiser: async (organiserId: string, examIds: string[]): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const organiserRef: FirebaseFirestore.DocumentReference<Organiser> =
            repository.collection("Organiser").withConverter(OrganiserConverter).doc(organiserId);
        const organiserDoc: FirebaseFirestore.DocumentSnapshot<Organiser> = await organiserRef.get();
        if (!organiserDoc.exists) {
            response.responseCode = 1;
            response.data = "OrganiserId is not valid";
            return response;
        }
        const organiser: Organiser | undefined = organiserDoc.data();
        if (organiser === undefined) {
            response.responseCode = 2;
            response.data = "Organiser could not be retrieved";
            return response;
        }
        organiser.exams = examIds;
        await organiserRef.set(organiser, {mergeFields: ["examIds"]})
            .catch(()=>{
                response.responseCode= 3;
                response.data = "Error updating examIds to organiser";
            });
        return response;
    },
    addExamToOrganiser: async (organiserId: string, examId: string): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const organiserRef: FirebaseFirestore.DocumentReference<Organiser> =
            repository.collection("Organiser").withConverter(OrganiserConverter).doc(organiserId);
        const organiserDoc: FirebaseFirestore.DocumentSnapshot<Organiser> = await organiserRef.get();
        if (!organiserDoc.exists) {
            response.responseCode = 1;
            response.data = "OrganiserId is not valid";
            return response;
        }
        const organiser: Organiser | undefined = organiserDoc.data();
        if (organiser === undefined) {
            response.responseCode = 2;
            response.data = "Organiser could not be retrieved";
            return response;
        }
        organiser.exams.push(examId);
        await organiserRef.set(organiser, {mergeFields: ["examIds"]})
            .then(()=>{
                response.responseCode= 0;
            })
            .catch(()=>{
                response.responseCode= 3;
                response.data = "Error updating examIds to organiser";
            });
        return response;
    },
    addSubjectAndTopicToOrganiser: async (organiserId: string, subjectAndTopicId: string): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const organiserRef: FirebaseFirestore.DocumentReference<Organiser> =
            repository.collection("Organiser").withConverter(OrganiserConverter).doc(organiserId);
        const organiserDoc: FirebaseFirestore.DocumentSnapshot<Organiser> = await organiserRef.get();
        if (!organiserDoc.exists) {
            response.responseCode = 1;
            response.data = "OrganiserId is not valid";
            return response;
        }
        const organiser: Organiser | undefined = organiserDoc.data();
        if (organiser === undefined) {
            response.responseCode = 2;
            response.data = "Organiser could not be retrieved";
            return response;
        }
        organiser.subjects.push(subjectAndTopicId);
        await organiserRef.set(organiser, {mergeFields: ["subjects"]})
            .then(()=>{
                response.responseCode= 0;
            })
            .catch(()=>{
                response.responseCode= 3;
                response.data = "Error updating subjectAndTopicId to organiser";
            });
        return response;
    },
    createExamTemplate: async (examTemplate: ExamTemplate): Promise<RepositoryResponse<string>> =>{
        const response: RepositoryResponse<string> = {responseCode: -1};
        await repository.collection("Exam")
            .withConverter(ExamTemplateConverter)
            .add(examTemplate)
            .then((data: FirebaseFirestore.DocumentReference<ExamTemplate>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },
    existsOrganiser: async (organiserId: string): Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        await repository.collection("Organiser")
            .doc(organiserId)
            .get()
            .then((data)=>{
                if (data.exists) {
                    response.data = true;
                    response.responseCode = 0;
                }
            })
            .catch((err)=>{
                console.error("Error in repository querying for Organiser", err);
                response.responseCode=1;
            });
        return response;
    },

};
