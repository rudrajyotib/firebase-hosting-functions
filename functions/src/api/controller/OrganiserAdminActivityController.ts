/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Request, Response} from "express";
import {ExamAdminService} from "../../service/ExamAdminService";
import {OrganiserBuilder} from "../../model/Organiser";
import {ServiceResponse} from "../../service/data/ServiceResponse";
import {AddExamIdsToOrganiserRequest, AddSyllabusIdsToOrganiserRequest, AddTopicAndQuestionCountRequest, CreateOrganiserRequest, CreateSyllabusRequest, ExamTemplateRequest, SubjectAndTopicRequest, SubjectsAndTopicsSummaryResponse} from "../interfaces/OrganiserInteractionDto";
import {Syllabus, SyllabusBuilder, TopicAndQuestionCount, TopicAndQuestionCountBuilder} from "../../model/Syllabus";
import {ExamTemplate, ExamTemplateBuilder} from "../../model/ExamTemplate";
import {SubjectAndTopic, SubjectAndTopicBuilder} from "../../model/SubjectAndTopic";
import {AddExamineeRequest, CorrelateQuestionAndTopicRequest, CreateExamInstanceRequest, CreateQuestionRequest} from "../interfaces/ExamInteractionDto";
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
        const syllabus: Syllabus = new SyllabusBuilder()
            .withDuration(createSyllabusRequest.duration)
            .withStatus("Active")
            .withSubject(createSyllabusRequest.subject)
            .withTitle(createSyllabusRequest.title)
            .withOrganiserId(createSyllabusRequest.organiserId)
            .build();
        if (!syllabus.isValid()) {
            res.status(400).send();
            return;
        }
        ExamAdminService.addSyllabus(syllabus)
            .then((serviceRes: ServiceResponse<string>)=>{
                console.log("Received response", serviceRes);
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

        const question: Question = questionBuilder.build();
        if (question.isValid() === false) {
            console.log("Question is not valid");
            res.status(400).send();
            return;
        }
        console.log("Question is valid");
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
