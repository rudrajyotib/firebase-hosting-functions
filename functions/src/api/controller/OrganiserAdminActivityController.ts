/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Request, Response} from "express";
import {ExamAdminService} from "../../service/ExamAdminService";
import {OrganiserBuilder} from "../../model/Organiser";
import {ServiceResponse} from "../../service/data/ServiceResponse";
import {AddExamIdsToOrganiserRequest, AddSyllabusIdsToOrganiserRequest, AddTopicAndQuestionCountRequest, AssignedExaminee, AssignExamineeToOrganiserRequest, CreateOrganiserRequest, CreateSyllabusRequest, ExamTemplateRequest, ExamTemplateSummary, QuestionSummary, SubjectAndTopicRequest, SubjectsAndTopicsSummaryResponse, SyllabusSummary} from "../interfaces/OrganiserInteractionDto";
import {Syllabus, SyllabusBuilder, TopicAndQuestionCount, TopicAndQuestionCountBuilder} from "../../model/Syllabus";
import {ExamTemplate, ExamTemplateBuilder} from "../../model/ExamTemplate";
import {SubjectAndTopic, SubjectAndTopicBuilder} from "../../model/SubjectAndTopic";
import {AddExamineeRequest, CorrelateQuestionAndTopicRequest, CreateBatchQuestionRequest, CreateExamInstanceRequest, CreateQuestionRequest} from "../interfaces/ExamInteractionDto";
import {Question, QuestionBuilder} from "../../model/Question";
import {ExamineeBuilder} from "../../model/Examinee";
import {SubjectAndTopicSummary} from "../../model/SubjectAndTopicSummary";


export const AddOrganiser =
    async (req: Request, res: Response) => {
        const organiserCreateReq: CreateOrganiserRequest = req.body as CreateOrganiserRequest;
        console.log("Body::", JSON.stringify(organiserCreateReq));
        const organiser = new OrganiserBuilder()
            .withName(organiserCreateReq.name)
            .withStatus("Active")
            .build();
        ExamAdminService.addOrganiser(organiser)
            .then((serviceRes: ServiceResponse<string>)=>{
                if (serviceRes.responseCode === 0 ) {
                    res.status(201).send({organiserId: serviceRes.data});
                } else {
                    res.status(400).send();
                }
            })
            .catch((e)=>{
                console.log("Service reported error creating Organiser", e);
                res.status(500).send();
            });
    };

export const AddSyllabus =
    async (req: Request, res: Response) => {
        const createSyllabusRequest : CreateSyllabusRequest = req.body as CreateSyllabusRequest;
        const syllabusBuilder: SyllabusBuilder = new SyllabusBuilder()
            .withDuration(createSyllabusRequest.duration)
            .withStatus("Active")
            .withSubject(createSyllabusRequest.subject)
            .withTitle(createSyllabusRequest.title)
            .withOrganiserId(createSyllabusRequest.organiserId);
        if (createSyllabusRequest.topics && createSyllabusRequest.topics.length > 0 ) {
            createSyllabusRequest.topics.forEach((t)=>{
                const topicsBuilder: TopicAndQuestionCountBuilder = new TopicAndQuestionCountBuilder();
                topicsBuilder.withCount(t.count);
                topicsBuilder.withSubjectAndTopicId(t.subjectAndTopicId);
                topicsBuilder.withWeightage(t.weightage);
                syllabusBuilder.withTopicAndQuestionCounts(topicsBuilder.build());
            });
        }
        const syllabus = syllabusBuilder.build();
        if (!syllabus.isValid()) {
            res.status(400).send();
            return;
        }
        ExamAdminService.addSyllabus(syllabus)
            .then((serviceRes: ServiceResponse<string>)=>{
                if (serviceRes.responseCode === 0 ) {
                    res.status(201).send({syllabusId: serviceRes.data});
                } else {
                    res.status(400).send();
                }
            })
            .catch((e: Error)=>{
                console.log("Service reported error creating Syllabus", e);
                res.status(500).send();
            });
    };

export const AddTopicsToSyllabus =
    async (req: Request, res: Response) => {
        const addTopicsRequest: AddTopicAndQuestionCountRequest =
            req.body as AddTopicAndQuestionCountRequest;
        const topicsAndQuestionModels: TopicAndQuestionCount[] =
            addTopicsRequest.topics.map((topic)=>{
                return new TopicAndQuestionCountBuilder()
                    .withSubjectAndTopicId(topic.subjectAndTopicId)
                    .withCount(topic.count)
                    .withWeightage(topic.weightage)
                    .build();
            });
        ExamAdminService.addTopicsAndQuestionsToSyllabus(topicsAndQuestionModels, addTopicsRequest.syllabusId)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send();
                } else {
                    res.status(400).send();
                }
            })
            .catch((e)=>{
                console.error("Error updating topics to syllabus in controller", e);
                res.status(500).send();
            });
    };

export const AddSyllabusIdsToOrganiser =
    async (req: Request, res: Response) => {
        const addSyllabusIdsToOrganiserRequest: AddSyllabusIdsToOrganiserRequest =
            req.body as AddSyllabusIdsToOrganiserRequest;
        ExamAdminService.addSyllabusIdToOrganiser(addSyllabusIdsToOrganiserRequest.organiserId,
            addSyllabusIdsToOrganiserRequest.syllabusIds)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send();
                } else {
                    res.status(400).send();
                }
            })
            .catch((e)=>{
                console.error("Error updating syllabus to organiser in controller", e);
                res.status(500).send();
            });
    };

export const AddExamIdsToOrganiser =
    async (req: Request, res: Response) => {
        const addExamIdsToOrganiserRequest: AddExamIdsToOrganiserRequest =
            req.body as AddExamIdsToOrganiserRequest;
        ExamAdminService.addExamIdToOrganiser(addExamIdsToOrganiserRequest.organiserId,
            addExamIdsToOrganiserRequest.examIds)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send();
                } else {
                    res.status(400).send();
                }
            })
            .catch((e)=>{
                console.error("Error updating examIds to organiser in controller", e);
                res.status(500).send();
            });
    };

export const CreateExamTemplate =
    async (req: Request, res: Response) => {
        const examTemplateRequest: ExamTemplateRequest =
            req.body as ExamTemplateRequest;
        const examTemplateBuilder: ExamTemplateBuilder =
            new ExamTemplateBuilder();
        const examTemplate: ExamTemplate = examTemplateBuilder
            .withGrade(examTemplateRequest.grade)
            .withSubject(examTemplateRequest.subject)
            .withSyllabusId(examTemplateRequest.syllabusId)
            .withTitle(examTemplateRequest.title)
            .withOrganiserId(examTemplateRequest.organiserId)
            .build();
        if (examTemplate.isValid() !== true) {
            res.status(400).send();
            return;
        }
        ExamAdminService.addExamTemplate(examTemplate)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({examTemplateId: serviceResponse.data});
                } else if (serviceResponse.responseCode > 0) {
                    console.error("Service response data", serviceResponse.data);
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Error updating examIds to organiser in controller", e);
                res.status(500).send();
            });
    };

export const CreateSubjectAndTopic =
    async (req: Request, res: Response) => {
        const subjectAndTopicRequest: SubjectAndTopicRequest =
            req.body as SubjectAndTopicRequest;
        const subjectAndTopicBuilder: SubjectAndTopicBuilder =
            new SubjectAndTopicBuilder();
        subjectAndTopicBuilder
            .withGrade(subjectAndTopicRequest.grade)
            .withSubject(subjectAndTopicRequest.subject)
            .withTopic(subjectAndTopicRequest.topic)
            .withTitle(subjectAndTopicRequest.title)
            .withOrganiserId(subjectAndTopicRequest.organiserId);
        const subjectAndTopic: SubjectAndTopic = subjectAndTopicBuilder.build();
        if (subjectAndTopic.isValid() === false) {
            res.status(400).send();
            return;
        }
        ExamAdminService.addSubjectAndTopic(subjectAndTopic)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({subjectId: serviceResponse.data});
                } else if (serviceResponse.responseCode > 0) {
                    console.error("Service response data", serviceResponse.data);
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Error creating subjects and topics in controller", e);
                res.status(500).send();
            });
    };

export const CreateQuestion =
    async (req: Request, res: Response) => {
        const createQuestionRequest: CreateQuestionRequest =
            req.body as CreateQuestionRequest;
        const questionBuilder: QuestionBuilder =
            new QuestionBuilder();
        questionBuilder
            .withFormat(createQuestionRequest.format)
            .withOrganiserId(createQuestionRequest.organiserId)
            .withCorrectOptionIndex(createQuestionRequest.correctOptionIndex);
        if (createQuestionRequest.tags && createQuestionRequest.tags.length > 0) {
            createQuestionRequest.tags.forEach((tag)=> {
                questionBuilder.withTag(tag);
            });
        }
        if (createQuestionRequest.questionLines && createQuestionRequest.questionLines.length > 0) {
            createQuestionRequest.questionLines.forEach((questionLine)=>{
                questionBuilder.withQuestionLine(questionLine);
            });
        }
        if (createQuestionRequest.options && createQuestionRequest.options.length > 0) {
            createQuestionRequest.options.forEach((option)=>{
                questionBuilder.withOption(option);
            });
        }
        if (createQuestionRequest.topicId && createQuestionRequest.topicId.trim() != "") {
            questionBuilder.withSubjectAndTopicId(createQuestionRequest.topicId.trim());
        }
        const question: Question = questionBuilder.build();
        if (question.isValid() === false) {
            console.log("Question is not valid");
            res.status(400).send();
            return;
        }
        ExamAdminService.addQuestion(question)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({questionId: serviceResponse.data});
                } else if (serviceResponse.responseCode > 0) {
                    console.error("Service response data", serviceResponse.data);
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Error creating question in controller", e);
                res.status(500).send();
            });
    };
export const CreateQuestionWithTopic =
    async (req: Request, res: Response) => {
        const createQuestionRequest: CreateQuestionRequest =
            req.body as CreateQuestionRequest;
        const questionBuilder: QuestionBuilder =
            new QuestionBuilder();
        if (!createQuestionRequest.topicId || createQuestionRequest.topicId === "") {
            res.status(400).send();
            return;
        }
        questionBuilder
            .withFormat(createQuestionRequest.format)
            .withOrganiserId(createQuestionRequest.organiserId)
            .withCorrectOptionIndex(createQuestionRequest.correctOptionIndex);
        if (createQuestionRequest.tags && createQuestionRequest.tags.length > 0) {
            createQuestionRequest.tags.forEach((tag)=> {
                questionBuilder.withTag(tag);
            });
        }
        if (createQuestionRequest.questionLines && createQuestionRequest.questionLines.length > 0) {
            createQuestionRequest.questionLines.forEach((questionLine)=>{
                questionBuilder.withQuestionLine(questionLine);
            });
        }
        if (createQuestionRequest.options && createQuestionRequest.options.length > 0) {
            createQuestionRequest.options.forEach((option)=>{
                questionBuilder.withOption(option);
            });
        }
        if (createQuestionRequest.topicId && createQuestionRequest.topicId.trim() != "") {
            questionBuilder.withSubjectAndTopicId(createQuestionRequest.topicId.trim());
        }
        const question: Question = questionBuilder.build();
        if (question.isValid() === false) {
            console.log("Question is not valid");
            res.status(400).send();
            return;
        }
        ExamAdminService.addQuestionAndAttachToTopic(question)
            .then((serviceResponse: ServiceResponse<string>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({questionId: serviceResponse.data});
                } else if (serviceResponse.responseCode > 0) {
                    console.error("Service response data", serviceResponse.data);
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Error creating question in controller", e);
                res.status(500).send();
            });
    };
export const CorrelateQuestionAndSubjectTopic =
    async (req: Request, res: Response) => {
        const correlateQuestionAndTopicRequest: CorrelateQuestionAndTopicRequest =
            req.body as CorrelateQuestionAndTopicRequest;
        if (!correlateQuestionAndTopicRequest.questionId ||
            correlateQuestionAndTopicRequest.questionId === "" ||
            !correlateQuestionAndTopicRequest.subjectAndTopicId ||
            correlateQuestionAndTopicRequest.subjectAndTopicId === ""
        ) {
            res.status(400).send();
            return;
        }
        ExamAdminService.relateQuestionAndTopic(correlateQuestionAndTopicRequest.questionId,
            correlateQuestionAndTopicRequest.subjectAndTopicId)
            .then((serviceResponse: ServiceResponse<string>)=>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send();
                } else if (serviceResponse.responseCode > 0) {
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Error in correlating question and topic,", e);
                res.status(500).send();
            });
    };
export const CreateExamInstance =
    async (req: Request, res: Response) => {
        const createExamInstanceRequest: CreateExamInstanceRequest =
            req.body as CreateExamInstanceRequest;
        console.log("Received request to create exam instance:"+JSON.stringify(createExamInstanceRequest));
        if (!createExamInstanceRequest.examTemplateId ||
            createExamInstanceRequest.examTemplateId === "" ||
            !createExamInstanceRequest.examineeId ||
            createExamInstanceRequest.examineeId === "" ||
            !createExamInstanceRequest.organiserId ||
            createExamInstanceRequest.organiserId === ""
        ) {
            res.status(400).send();
        }
        ExamAdminService.createExamInstance(createExamInstanceRequest.examineeId,
            createExamInstanceRequest.organiserId,
            createExamInstanceRequest.examTemplateId)
            .then((serviceResponse: ServiceResponse<string>)=>{
                console.log("Service response::"+JSON.stringify(serviceResponse));
                if (serviceResponse.responseCode > 0 ) {
                    res.status(400).send();
                } else if (serviceResponse.responseCode < 0) {
                    res.status(500).send();
                } else {
                    res.status(201).send({examInstanceId: serviceResponse.data});
                }
            })
            .catch((e)=>{
                console.error("Create exam instance controller failed,", e);
                res.status(500).send();
            });
    };
export const AddExaminee =
    async (req: Request, res: Response) => {
        const addExamineeRequest: AddExamineeRequest =
            req.body as AddExamineeRequest;
        const examineeBuilder: ExamineeBuilder =
            new ExamineeBuilder()
                .withName(addExamineeRequest.name)
                .withEmail(addExamineeRequest.email);

        ExamAdminService.addExaminee(examineeBuilder.build())
            .then((serviceResponse: ServiceResponse<string>)=>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({"examineeId": serviceResponse.data});
                } else if (serviceResponse.responseCode > 0 ) {
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=>{
                console.error("Controller got error creating new examinee", e);
                res.status(500).send();
            });
    };

export const ListOfSubjectAndTopicsByOrg =
    async (req: Request, res: Response) => {
        const organisationId = req.query.orgId;
        if (!organisationId || organisationId === "") {
            res.status(400).send();
            return;
        }
        ExamAdminService.retrieveSubjectAndTopicForOrganisation(""+organisationId)
            .then((response: ServiceResponse<SubjectAndTopicSummary[]>) =>{
                if (response.responseCode === 0 ) {
                    const responses: SubjectsAndTopicsSummaryResponse[] = [];
                    if (response.data && response.data != undefined) {
                        response.data.forEach((summary)=>{
                            responses.push({
                                grade: summary.grade,
                                subject: summary.subject,
                                title: summary.title,
                                id: summary.id,
                                topic: summary.topic,
                            });
                        });
                        res.status(200).send(responses);
                    }
                } else {
                    res.status(400).send();
                }
            })
            .catch((e)=> {
                console.error("Error getting list of subjects and topics from service in controller", e);
                res.status(500).send();
            });
    };

export const ListQuestionsByOrganiserAndTopic =
    async (req: Request, res: Response) => {
        const organiserId: string = ""+req.query.organiserId;
        const subjectAndTopicId: string = req.query.topicId == undefined ? "" :""+req.query.topicId;

        if (organiserId.trim() === "") {
            res.status(400).send();
            return;
        }
        ExamAdminService
            .retrieveQuestionByOrganiserAndTopic(organiserId, subjectAndTopicId)
            .then((serviceResponse: ServiceResponse<Question[]>)=>{
                if (serviceResponse.responseCode === 0 && serviceResponse.data) {
                    const questions: Question[] = serviceResponse.data;
                    const responseBody: QuestionSummary[] = [];
                    questions.forEach((q)=>{
                        const qSummary: QuestionSummary = {
                            format: q.format,
                            questionLines: q.questionLines,
                            options: q.options,
                            correctOptionIndex: q.correctOptionIndex,
                            id: q.id,
                            status: q.status,
                            organiserId: q.organiserId,
                        };
                        responseBody.push(qSummary);
                    });
                    res.status(200).send(responseBody);
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=> {
                res.status(500).send();
            });
    };

export const ListSyllabusByOrganiser =
    async (req: Request, res: Response) => {
        const organiserId: string = ""+req.query.organiserId;

        if (organiserId.trim() === "") {
            res.status(400).send();
            return;
        }
        ExamAdminService
            .listSyllabusByOrganiser(organiserId)
            .then((serviceResponse: ServiceResponse<Syllabus[]>)=>{
                if (serviceResponse.responseCode === 0 && serviceResponse.data) {
                    const questions: Syllabus[] = serviceResponse.data;
                    const responseBody: SyllabusSummary[] = [];
                    questions.forEach((s)=>{
                        const syllabusSummary: SyllabusSummary = {
                            id: s.id,
                            title: s.title,
                            subject: s.subject,
                            duration: s.duration,
                            status: s.status,
                            totalMarks: s.totalMarks,
                        };
                        responseBody.push(syllabusSummary);
                    });
                    res.status(200).send(responseBody);
                } else {
                    res.status(500).send();
                }
            })
            .catch((e)=> {
                res.status(500).send();
            });
    };

export const ListExamTemplateByOrganiser =
        async (req: Request, res: Response) => {
            const organiserId: string = ""+req.query.organiserId;

            if (organiserId.trim() === "") {
                res.status(400).send();
                return;
            }
            ExamAdminService
                .listExamTemplateByOrganiser(organiserId)
                .then((serviceResponse: ServiceResponse<ExamTemplate[]>)=>{
                    if (serviceResponse.responseCode === 0 && serviceResponse.data) {
                        const examTemplates: ExamTemplate[] = serviceResponse.data;
                        const responseBody: ExamTemplateSummary[] = [];
                        examTemplates.forEach((s)=>{
                            const examTemplateSummary: ExamTemplateSummary = {
                                id: s.id,
                                title: s.title,
                                subject: s.subject,
                                grade: s.grade,
                                status: s.status,
                                syllabusId: s.syllabusId,
                            };
                            responseBody.push(examTemplateSummary);
                        });
                        res.status(200).send(responseBody);
                    } else {
                        res.status(500).send();
                    }
                })
                .catch((e)=> {
                    res.status(500).send();
                });
        };

export const AssignExamineeToOrganiser =
        async (req: Request, res: Response) => {
            const assignExamineeReq: AssignExamineeToOrganiserRequest =
                req.body as AssignExamineeToOrganiserRequest;
            if (assignExamineeReq.organiserId.trim() === "" ||
                assignExamineeReq.examineeId.trim() === "" ||
                assignExamineeReq.examineeName.trim() === "") {
                res.status(400).send();
                return;
            }
            ExamAdminService.assignExamineeToOrganiser(assignExamineeReq.organiserId,
                assignExamineeReq.examineeId,
                assignExamineeReq.examineeName)
                .then((serviceResponse: ServiceResponse<boolean>)=>{
                    if (serviceResponse.responseCode === 0) {
                        res.status(201).send();
                        return;
                    } else {
                        res.status(400).send();
                        return;
                    }
                })
                .catch((e)=>{
                    res.status(500).send();
                    console.error("Could not assign examinee to organiser", e);
                });
        };

export const ListAssignedExamineesByOrganiser =
    async (req: Request, res: Response) => {
        const organiserId: string = ""+req.query.organiserId;
        if (!organiserId || organiserId.trim() === "") {
            res.status(400).send();
            return;
        }
        ExamAdminService
            .listAssignedExamineesByOrganiser(organiserId)
            .then((serviceRes: ServiceResponse<{id:string, name:string}[]>) =>{
                const responseBody: AssignedExaminee[] = [];
                if (serviceRes.responseCode === 0 && serviceRes.data) {
                    const examinees = serviceRes.data;
                    examinees.forEach((e)=>{
                        responseBody.push(e);
                    });
                    res.status(200).send(responseBody);
                    return;
                } else {
                    res.status(400).send();
                    return;
                }
            })
            .catch((e)=>{
                res.status(500).send();
                console.error("Failed to get assigned examinees for organiser,", e);
                return;
            });
    };
export const CreateQuestionInBatchWithTopic =
    async (req: Request, res: Response) => {
        const createQuestionRequest: CreateBatchQuestionRequest =
            req.body as CreateBatchQuestionRequest;
        const questionBatch: Question[] = [];
        console.log("Received batch request to add questions");
        if (!createQuestionRequest.topicId || createQuestionRequest.topicId.trim() === "") {
            res.status(400).send();
            return;
        }
        createQuestionRequest.questions.forEach((questionInput)=>{
            if (!questionInput.topicId || questionInput.topicId === "") {
                res.status(400).send();
                return;
            }
            const questionBuilder: QuestionBuilder =
                new QuestionBuilder();
            questionBuilder
                .withFormat(questionInput.format)
                .withOrganiserId(questionInput.organiserId)
                .withCorrectOptionIndex(questionInput.correctOptionIndex);
            if (questionInput.tags && questionInput.tags.length > 0) {
                questionInput.tags.forEach((tag)=> {
                    questionBuilder.withTag(tag);
                });
            }
            if (questionInput.questionLines && questionInput.questionLines.length > 0) {
                questionInput.questionLines.forEach((questionLine)=>{
                    questionBuilder.withQuestionLine(questionLine);
                });
            }
            if (questionInput.options && questionInput.options.length > 0) {
                questionInput.options.forEach((option)=>{
                    questionBuilder.withOption(option);
                });
            }
            questionBuilder.withSubjectAndTopicId(createQuestionRequest.topicId.trim());
            const question: Question = questionBuilder.build();
            if (question.isValid() === false) {
                console.log("Question is not valid");
                res.status(400).send();
                return;
            }
            questionBatch.push(question);
        });
        ExamAdminService.addQuestionsInBatchToTopic(questionBatch, createQuestionRequest.topicId)
            .then((serviceResponse: ServiceResponse<boolean>) =>{
                if (serviceResponse.responseCode === 0) {
                    res.status(201).send({questionId: serviceResponse.data});
                } else if (serviceResponse.responseCode > 0) {
                    console.error("Service response data", serviceResponse.data);
                    res.status(400).send();
                } else {
                    res.status(500).send();
                }
            });
    };
