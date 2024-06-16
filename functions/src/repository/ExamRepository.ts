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
import {ExamResult} from "../model/ExamResult";
import {SubjectAndTopic} from "../model/SubjectAndTopic";
import {SubjectAndTopicConverter, SubjectAndTopicSummaryConverter} from "./converters/SubjectAndTopicsConverter";
import {Syllabus, TopicAndQuestionCount} from "../model/Syllabus";
import {SyllabusConverter} from "./converters/SyllabusConverter";
import {Organiser} from "../model/Organiser";
import {OrganiserConverter} from "./converters/OrganiserConverter";
import {ExamTemplate} from "../model/ExamTemplate";
import {ExamTemplateConverter} from "./converters/ExamTemplateConverter";
import { SubjectAndTopicSummary } from "../model/SubjectAndTopicSummary";
// import {collection, query, where} from "firebase/firestore";

const repository = source.repository;


export const ExamRepository = {
    listActiveExams: async (examineeId: string): Promise<RepositoryResponse<ExamInstanceSummary[]>> => {
        const examInstances: ExamInstanceSummary[] = [];
        const response: RepositoryResponse<ExamInstanceSummary[]> = {
            responseCode: -1,
            data: examInstances,
        };
        await repository
            .collection("ExamInstance")
            .withConverter(ExamInstanceSummaryConverter)
            .where("examineeId", "==", examineeId)
            .where("status", "==", "Ready")
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
            .catch((e) => {
                console.error("Error creating new examinee", e);
                response.responseCode = -1;
                response.data = "";
            });
        return response;
    },

    addExamInstanceToExaminee: async (examineeId: string, examInstanceId: string): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1, data: ""};
        const examineeRef: FirebaseFirestore.DocumentReference<Examinee> = repository.collection("Examinee")
            .withConverter(ExamineeConverter)
            .doc(examineeId);
        const examineeDoc: FirebaseFirestore.DocumentSnapshot<Examinee> = await examineeRef.get();
        if (!examineeDoc.exists) {
            response.responseCode = 1;
            return response;
        }
        const examinee = examineeDoc.data();
        if (examinee === undefined) {
            console.error("ExamRepository.addExamInstanceToExaminee::Could not get any data for Examinee from "+
                "Data store for ExamineeId:"+examineeId
            );
            response.responseCode = -1;
            return response;
        }
        examinee.assignExamInstance(examInstanceId);
        const updateResult =await examineeRef.set(examinee, {mergeFields: ["examInstances"]})
            .then(()=>{
                return 0;
            })
            .catch((e)=>{
                console.error("ExamRepository.addExamInstanceToExaminee::Error updating exam instance to examineeId:"+
                +examineeId+":", e);
                return -1;
            });
        if (updateResult === 0) {
            response.responseCode = 0;
            return response;
        }
        response.responseCode = -1;
        return response;
    },

    updateExamStatusForExaminee: async (examineeId: string, examInstanceId: string, status: string): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1, data: ""};
        const examineeRef: FirebaseFirestore.DocumentReference<Examinee> = repository.collection("Examinee")
            .withConverter(ExamineeConverter)
            .doc(examineeId);
        const examineeDoc: FirebaseFirestore.DocumentSnapshot<Examinee> = await examineeRef.get();
        if (!examineeDoc.exists) {
            response.responseCode = 1;
            return response;
        }
        const examinee = examineeDoc.data();
        if (examinee === undefined) {
            console.error("ExamRepository.updateExamStatusForExaminee::Could not get any data for Examinee from "+
                "Data store for ExamineeId:"+examineeId
            );
            response.responseCode = -1;
            return response;
        }
        examinee.updateAssignedExamStatus(examInstanceId, status);
        const updateResult =await examineeRef.set(examinee, {mergeFields: ["examInstances"]})
            .then(()=>{
                return 0;
            })
            .catch((e)=>{
                console.error("ExamRepository.updateExamStatusForExaminee::Error updating exam instance to examineeId:"+
                +examineeId+":", e);
                return -1;
            });
        if (updateResult === 0) {
            response.responseCode = 0;
            return response;
        }
        response.responseCode = -1;
        return response;
    },

    recordAnswerAndMoveNext: async (submitAnswerRequest: SubmitAnswerRequest): Promise<RepositoryResponse<ExamInstanceDetail>> => {
        const repositoryResponse: RepositoryResponse<ExamInstanceDetail> = {
            responseCode: -1,
        };
        if ((submitAnswerRequest.examineeId === undefined || submitAnswerRequest.examineeId === "") ||
            (submitAnswerRequest.examInstanceId === undefined || submitAnswerRequest.examInstanceId === "") ||
            (submitAnswerRequest.questionId === undefined || submitAnswerRequest.questionId === "") ||
            (submitAnswerRequest.answer === undefined || (submitAnswerRequest.answer < 0))) {
            repositoryResponse.responseCode = 1;
            return repositoryResponse;
        }
        const examInstanceRef: FirebaseFirestore.DocumentReference<ExamInstanceDetail> =
            repository.collection("ExamInstance")
                .withConverter(ExamInstanceDetailsConverter)
                .doc(submitAnswerRequest.examInstanceId);
        const examInstanceDoc: FirebaseFirestore.DocumentSnapshot<ExamInstanceDetail> = await examInstanceRef.get();
        if (!examInstanceDoc.exists) {
            repositoryResponse.responseCode = 2;
            return repositoryResponse;
        }
        const examInstanceDetail = examInstanceDoc.data();
        if (examInstanceDetail === undefined) {
            repositoryResponse.responseCode = -1;
            return repositoryResponse;
        }
        if (!examInstanceDetail.examResultId || examInstanceDetail.examResultId === "") {
            repositoryResponse.responseCode = -2;
            console.error("Exam repository cannot record answer for ExamInstance:"+submitAnswerRequest.examInstanceId+
                ": as ResultId is missing"
            );
            return repositoryResponse;
        }
        if (submitAnswerRequest.examineeId !== examInstanceDetail.examineeId) {
            repositoryResponse.responseCode = 3;
            return repositoryResponse;
        }
        if (!examInstanceDetail.isInProgress()) {
            repositoryResponse.responseCode = 4;
            return repositoryResponse;
        }
        const answerUpdate: boolean = examInstanceDetail.recordAnswerAndmoveToNextQuestion(submitAnswerRequest.questionId,
            submitAnswerRequest.answer, submitAnswerRequest.questionIndex);
        if (answerUpdate !== true) {
            repositoryResponse.responseCode = 5;
            return repositoryResponse;
        }
        if (!examInstanceDetail.startTime) {
            repositoryResponse.responseCode = 6;
            return repositoryResponse;
        }
        const examInstanceUpdate = await examInstanceRef.set(examInstanceDetail, {
            merge: true,
        }).then(() => {
            return 0;
        }).catch((e) => {
            console.error("Repository failed to update exam Instace", e);
            return 1;
        });
        if (examInstanceUpdate != 0) {
            repositoryResponse.responseCode = -1;
            return repositoryResponse;
        }
        repositoryResponse.responseCode = 0;
        repositoryResponse.data = examInstanceDetail;
        return repositoryResponse;
    },

    evaluate: async (evaluationRequest: EvaluateRequest) : Promise<RepositoryResponse<ExamResult>> => {
        const repositoryResponse: RepositoryResponse<ExamResult> = {
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
            repositoryResponse.responseCode = 1;
            return repositoryResponse;
        }
        const examInstanceDetail = examInstanceDoc.data();
        if ( (examInstanceDetail?.examineeId !== evaluationRequest.examineeId) ) {
            console.log("ExamineeId does not match");
            repositoryResponse.responseCode = 2;
            return repositoryResponse;
        }
        if (!examInstanceDetail) {
            repositoryResponse.responseCode = -1;
            return repositoryResponse;
        }
        const examResultId = examInstanceDetail.examResultId;
        const examResultRef: FirebaseFirestore.DocumentReference<ExamResult> =
            repository.collection("ExamResult")
                .withConverter(ExamResultConverter)
                .doc(examResultId);
        const examResultDoc: FirebaseFirestore.DocumentSnapshot<ExamResult> =
            await examResultRef.get();
        if (!examResultDoc.exists) {
            repositoryResponse.responseCode = -2;
            return repositoryResponse;
        }
        const examResult = examResultDoc.data();
        if (!examResult) {
            repositoryResponse.responseCode = -3;
            return repositoryResponse;
        }
        examResult.evaluate();
        await examResultRef
            .set(examResult, {mergeFields: ["score", "status"]})
            .then(() => {
                repositoryResponse.responseCode = 0;
                repositoryResponse.data = examResult;
            })
            .catch((e)=>{
                console.error("Error saving exam result:", e);
                repositoryResponse.responseCode = -4;
            });
        if (repositoryResponse.responseCode === 0 ) {
            examInstanceDetail.markEvaluated();
            examInstanceRef
                .set(examInstanceDetail, {mergeFields: ["status"]})
                .catch((e)=>{
                    console.error("After evaluation, exam status marking failed for examInstanceId::"+evaluationRequest.examInstanceId, e);
                });
        }
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
    listSubjectAndTopics: async (organiserId: string) : Promise<RepositoryResponse<SubjectAndTopicSummary[]>> => {
        const repositoryResponse: RepositoryResponse<SubjectAndTopicSummary[]> = {
            responseCode: -1,
        };
        const subjectAndTopicSummaries: SubjectAndTopicSummary[] = [];
        await repository.collection("SubjectAndTopic")
            .withConverter(SubjectAndTopicSummaryConverter)
            .where("organiserId", "==", organiserId)
            .get()
            .then((snapshot: FirebaseFirestore.QuerySnapshot<SubjectAndTopicSummary>)=>{
                snapshot.forEach((snap)=>{
                    subjectAndTopicSummaries.push(snap.data());
                });
                repositoryResponse.responseCode = 0;
                repositoryResponse.data = subjectAndTopicSummaries;
            })
            .catch((e)=>{
                console.error("Error querying subjects and topics by organiserId", e);
            });
        return repositoryResponse;
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
        syllabus.addTopics(topicsAndQuestionsCounts);
        await syllabusRef.set(syllabus, {mergeFields: ["topicsAndQuestionCounts", "totalMarks"]})
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
    getExamTemplate: async (examTemplateId: string): Promise<RepositoryResponse<ExamTemplate>> =>{
        const response: RepositoryResponse<ExamTemplate> = {responseCode: -1};
        await repository.collection("Exam")
            .withConverter(ExamTemplateConverter)
            .doc(examTemplateId)
            .get()
            .then((data: FirebaseFirestore.DocumentSnapshot<ExamTemplate>) => {
                if (data.exists) {
                    response.data = data.data();
                    response.responseCode = 0;
                } else {
                    response.responseCode = 1;
                }
            })
            .catch(() => {
                response.responseCode = -1;
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
    existsSubjectAndTopic: async (subjectAndTopicId: string): Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        await repository.collection("SubjectAndTopic")
            .doc(subjectAndTopicId)
            .get()
            .then((data)=>{
                if (data.exists) {
                    response.data = true;
                    response.responseCode = 0;
                }
            })
            .catch((err)=>{
                console.error("Error in repository querying for Subject and topic", err);
                response.responseCode=1;
            });
        return response;
    },
    existsExaminee: async (examineeId: string): Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        await repository.collection("Examinee")
            .doc(examineeId)
            .get()
            .then((data)=>{
                if (data.exists) {
                    response.data = true;
                    response.responseCode = 0;
                }
            })
            .catch((err)=>{
                console.error("Error in repository querying for Examinee", err);
                response.responseCode=1;
            });
        return response;
    },
    existsExamtemplate: async (examId: string): Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        await repository.collection("Exam")
            .doc(examId)
            .get()
            .then((data)=>{
                if (data.exists) {
                    response.data = true;
                    response.responseCode = 0;
                }
            })
            .catch((err)=>{
                console.error("Error in repository querying for Exam", err);
                response.responseCode=1;
            });
        return response;
    },
    addQuestionIdToSubjectAndTopic: async (questionId: string, subjectAndTopicId: string): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const subjectAndTopicRef: FirebaseFirestore.DocumentReference<SubjectAndTopic> =
            repository.collection("SubjectAndTopic").withConverter(SubjectAndTopicConverter).doc(subjectAndTopicId);
        const subjectAndTopicDoc: FirebaseFirestore.DocumentSnapshot<SubjectAndTopic> = await subjectAndTopicRef.get();
        if (!subjectAndTopicDoc.exists) {
            response.responseCode = 1;
            response.data = "SubjectAndTopicId is not valid";
            return response;
        }
        const subjectAndTopic: SubjectAndTopic | undefined = subjectAndTopicDoc.data();
        if (subjectAndTopic === undefined) {
            response.responseCode = 2;
            response.data = "Subject and topic could not be retrieved";
            return response;
        }
        const questionInTopic = subjectAndTopic.questionIds.find((val)=>{
            return (val.id === questionId);
        });
        if (questionInTopic && questionInTopic !== undefined) {
            response.responseCode = 0;
            response.data= "QuestionId already included in topic";
            return response;
        }
        subjectAndTopic.questionIds.push({id: questionId, active: true});
        await subjectAndTopicRef.set(subjectAndTopic, {mergeFields: ["questionIds"]})
            .then(()=>{
                response.responseCode= 0;
            })
            .catch(()=>{
                response.responseCode= -1;
                response.data = "Error updating subjectAndTopicId to organiser";
            });
        return response;
    },
    createExamResult: async (examResult: ExamResult): Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        await repository.collection("ExamResult")
            .withConverter(ExamResultConverter)
            .add(examResult)
            .then((data: FirebaseFirestore.DocumentReference<ExamResult>) => {
                response.data = data.id;
                response.responseCode = 0;
            })
            .catch((e) => {
                console.error("Error creating exam result:", e);
                response.responseCode = -1;
            });
        return response;
    },
    updateAnswerRecord: async (examResultId: string, questionId: string, answer: number)
        : Promise<RepositoryResponse<string>> => {
        const response: RepositoryResponse<string> = {responseCode: -1};
        const resultRef: FirebaseFirestore.DocumentReference<ExamResult> = repository.collection("ExamResult")
            .withConverter(ExamResultConverter)
            .doc(examResultId);
        const resultDoc: FirebaseFirestore.DocumentSnapshot<ExamResult> = await resultRef.get();
        if (!resultDoc.exists) {
            response.responseCode = 1;
            return response;
        }
        const result = resultDoc.data();
        if (result === undefined) {
            console.error("ExamRepository.updateAnswerRecord::Could not load result data for id::"+examResultId);
            response.responseCode = -1;
            return response;
        }
        result.markAnswer(questionId, answer);
        const resultUpdate = resultRef
            .set(result, {mergeFields: ["questionAndAnswer"]})
            .then(()=>{
                return true;
            })
            .catch((e)=>{
                console.error("Error updating ExamResult response::", e);
                return false;
            });
        if (!resultUpdate) {
            response.responseCode = -2;
            return response;
        }
        response.responseCode = 0;
        return response;
    },

};
