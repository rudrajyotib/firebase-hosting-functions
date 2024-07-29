/* eslint-disable max-len */
/* eslint-disable-next-line max-len */
import {ExamInstanceDetailBuilder} from "../model/ExamInstanceDetail";
import {AnswerRecordBuilder, ExamResultBuilder} from "../model/ExamResult";
import {ExamTemplate} from "../model/ExamTemplate";
import {Examinee} from "../model/Examinee";
import {Organiser} from "../model/Organiser";
import {Question} from "../model/Question";
import {SubjectAndTopic} from "../model/SubjectAndTopic";
import {SubjectAndTopicSummary} from "../model/SubjectAndTopicSummary";
import {Syllabus, TopicAndQuestionCount} from "../model/Syllabus";
import {ExamRepository} from "../repository/ExamRepository";
import {QuestionRepository} from "../repository/QuestionRepository";
import {RepositoryResponse} from "../repository/data/RepositoryResponse";
import {shuffle} from "../util/ListUtil";
import {ServiceResponse} from "./data/ServiceResponse";

export const ExamAdminService = {
    addOrganiser: async (organiser: Organiser) => {
        // eslint-disable-next-line max-len
        const repositoryResponse : RepositoryResponse<string> = await ExamRepository.addOrganiser(organiser);
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        if (repositoryResponse.responseCode === 0) {
            serviceResponse.responseCode = 0;
            serviceResponse.data = repositoryResponse.data;
        }
        return serviceResponse;
    },
    addSyllabus: async (syllabus: Syllabus) => {
        // eslint-disable-next-line max-len
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        const organiserResponse: RepositoryResponse<Organiser> =await ExamRepository.getOrganiser(syllabus.organiserId);
        if (organiserResponse.responseCode > 0 ) {
            serviceResponse.data = "Invalid organiser Id";
            serviceResponse.responseCode = 1;
            return serviceResponse;
        }
        if (!organiserResponse.data) {
            throw new Error("addExamIdToOrganiser: Repository did not send Organiser data upstream");
        }
        const organiser: Organiser = organiserResponse.data;
        const repositoryResponse : RepositoryResponse<string> = await ExamRepository.addSyllabus(syllabus);
        if (repositoryResponse.responseCode != 0) {
            serviceResponse.data = "Could not create syllabus";
            return serviceResponse;
        }
        if (!repositoryResponse.data) {
            throw new Error("ExamAdminService.addSyllabus-repository could not send syllabusId upstream");
        }
        organiser.syllabus.push(repositoryResponse.data);
        const syllabusUpdateResponse: RepositoryResponse<string> =
            await ExamRepository.setSyllabusIdsToOrganiser(syllabus.organiserId, organiser.syllabus);
        if (syllabusUpdateResponse.responseCode != 0 ) {
            serviceResponse.data = "Error adding SyllabusIds to organiser";
            return serviceResponse;
        }
        serviceResponse.data = repositoryResponse.data;
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    addTopicsAndQuestionsToSyllabus: async (topics: TopicAndQuestionCount[], syllabusId: string)=> {
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
            data: "",
        };
        // eslint-disable-next-line max-len
        const syllabusResponse: RepositoryResponse<Syllabus> =await ExamRepository.getSyllabus(syllabusId);
        if (syllabusResponse.responseCode != 0 ) {
            serviceResponse.data = "Invalid syllabus Id";
            return serviceResponse;
        }
        const syllabusUpdateResponse: RepositoryResponse<string> =
            await ExamRepository.addTopicsToSyllabus(topics, syllabusId);
        if (syllabusUpdateResponse.responseCode != 0 ) {
            serviceResponse.data = "Error adding topic";
            return serviceResponse;
        }
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    addSyllabusIdToOrganiser: async (organiserId:string, syllabusIds: string[]) => {
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
            data: "",
        };
        // eslint-disable-next-line max-len
        const organiserResponse: RepositoryResponse<Organiser> =await ExamRepository.getOrganiser(organiserId);
        if (organiserResponse.responseCode != 0 ) {
            serviceResponse.data = "Invalid organiser Id";
            return serviceResponse;
        }
        if (!organiserResponse.data) {
            throw new Error("addSyllabusIdToOrganiser: Repository did not send Organiser data upstream");
        }
        const organiser: Organiser = organiserResponse.data;
        const syllabusSet = new Set(organiser.syllabus);
        syllabusIds.forEach((syllabusId)=>{
            if (!syllabusSet.has(syllabusId)) {
                syllabusSet.add(syllabusId);
            }
        });
        const syllabusUpdateResponse: RepositoryResponse<string> =
            await ExamRepository.setSyllabusIdsToOrganiser(organiserId, [...syllabusSet]);
        if (syllabusUpdateResponse.responseCode != 0 ) {
            serviceResponse.data = "Error adding SyllabusIds";
            return serviceResponse;
        }
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    addExamIdToOrganiser: async (organiserId:string, examIds: string[]) => {
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
            data: "",
        };
        // eslint-disable-next-line max-len
        const organiserResponse: RepositoryResponse<Organiser> =await ExamRepository.getOrganiser(organiserId);
        if (organiserResponse.responseCode > 0 ) {
            serviceResponse.data = "Invalid organiser Id";
            return serviceResponse;
        }
        if (!organiserResponse.data) {
            throw new Error("addExamIdToOrganiser: Repository did not send Organiser data upstream");
        }
        const organiser: Organiser = organiserResponse.data;
        const examIdSet = new Set(organiser.exams);
        examIds.forEach((examId)=>{
            if (!examIdSet.has(examId)) {
                examIdSet.add(examId);
            }
        });
        const syllabusUpdateResponse: RepositoryResponse<string> =
            await ExamRepository.setExamsToOrganiser(organiserId, [...examIdSet]);
        if (syllabusUpdateResponse.responseCode != 0 ) {
            serviceResponse.data = "Error adding ExamIds";
            return serviceResponse;
        }
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    addExamTemplate: async (examTemplate: ExamTemplate) => {
        // eslint-disable-next-line max-len
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        if (!examTemplate.organiserId || examTemplate.organiserId === "") {
            serviceResponse.data = "OrganiserId is empty or not present while adding exam template";
            serviceResponse.responseCode = 1;
            return serviceResponse;
        }
        const organiserIdQueryResponse: RepositoryResponse<boolean> =
            await ExamRepository.existsOrganiser(examTemplate.organiserId);
        if (organiserIdQueryResponse.responseCode !=0 || organiserIdQueryResponse.data === false) {
            serviceResponse.data = "Organiser does not exist";
            serviceResponse.responseCode = 2;
            return serviceResponse;
        }
        const createExamTemplateRepositoryResponse : RepositoryResponse<string> = await ExamRepository.createExamTemplate(examTemplate);
        if (createExamTemplateRepositoryResponse.responseCode !== 0) {
            serviceResponse.responseCode = -1;
            serviceResponse.data = "Error creating exam template";
            return serviceResponse;
        }
        if (!createExamTemplateRepositoryResponse.data) {
            serviceResponse.responseCode = -2;
            serviceResponse.data = "Repository could not create exam template";
            return serviceResponse;
        }
        const addExamTemplateToOrganiserRepositoryResponse: RepositoryResponse<string> =
            await ExamRepository.addExamToOrganiser(examTemplate.organiserId,
                createExamTemplateRepositoryResponse.data);
        if (addExamTemplateToOrganiserRepositoryResponse.responseCode != 0) {
            serviceResponse.responseCode = -3;
            serviceResponse.data = "Repository is not connected to organiser";
            console.error("ExamId "+createExamTemplateRepositoryResponse.data+" could not be connected to organiser");
            return serviceResponse;
        }
        serviceResponse.data = createExamTemplateRepositoryResponse.data;
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    addSubjectAndTopic: async (subjectAndTopic: SubjectAndTopic) => {
        // eslint-disable-next-line max-len
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        if (!subjectAndTopic.organiserId || subjectAndTopic.organiserId === "") {
            serviceResponse.data = "OrganiserId is empty or not present while adding exam template";
            serviceResponse.responseCode = 1;
            return serviceResponse;
        }
        const organiserIdQueryResponse: RepositoryResponse<boolean> =
            await ExamRepository.existsOrganiser(subjectAndTopic.organiserId);
        if (organiserIdQueryResponse.responseCode !=0 || organiserIdQueryResponse.data === false) {
            serviceResponse.data = "Organiser does not exist";
            serviceResponse.responseCode = 2;
            return serviceResponse;
        }
        const createSubjectAndTopicRepositoryResponse : RepositoryResponse<string> = await ExamRepository.addSubjectAndTopic(subjectAndTopic);
        if (createSubjectAndTopicRepositoryResponse.responseCode !== 0) {
            serviceResponse.responseCode = -1;
            serviceResponse.data = "Error creating exam subject and topic";
            return serviceResponse;
        }
        if (!createSubjectAndTopicRepositoryResponse.data) {
            serviceResponse.responseCode = -2;
            serviceResponse.data = "Repository could not create subject and topic";
            return serviceResponse;
        }
        const addSubjectAndTopicToOrganiserRepositoryResponse: RepositoryResponse<string> =
            await ExamRepository.addSubjectAndTopicToOrganiser(subjectAndTopic.organiserId,
                createSubjectAndTopicRepositoryResponse.data);
        if (addSubjectAndTopicToOrganiserRepositoryResponse.responseCode != 0) {
            serviceResponse.responseCode = -3;
            serviceResponse.data = "Repository is not connected to organiser";
            console.error("ExamId "+createSubjectAndTopicRepositoryResponse.data+" could not be connected to organiser");
            return serviceResponse;
        }
        serviceResponse.data = createSubjectAndTopicRepositoryResponse.data;
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    retrieveSubjectAndTopicForOrganisation: async (organisationId: string):
        Promise<ServiceResponse<SubjectAndTopicSummary[]>> => {
        // eslint-disable-next-line max-len
        const serviceResponse: ServiceResponse<SubjectAndTopicSummary[]> = {
            responseCode: -1,
        };
        await ExamRepository.listSubjectAndTopics(organisationId)
            .then((repositoryResponse: RepositoryResponse<SubjectAndTopicSummary[]>)=>{
                if (repositoryResponse.responseCode === 0) {
                    serviceResponse.responseCode = 0;
                    serviceResponse.data = repositoryResponse.data;
                }
            })
            .catch((e)=>{
                console.error("Error calling repository to get subjects and topic simulations", e);
            });
        return serviceResponse;
    },
    addQuestion: async (question: Question) => {
        const serviceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        if (!question.organiserId || question.organiserId === "") {
            serviceResponse.data = "OrganiserId is empty or not present while adding question";
            serviceResponse.responseCode = 1;
            return serviceResponse;
        }
        const organiserIdQueryResponse: RepositoryResponse<boolean> =
            await ExamRepository.existsOrganiser(question.organiserId);
        if (organiserIdQueryResponse.responseCode !=0 || organiserIdQueryResponse.data === false) {
            serviceResponse.data = "Organiser does not exist";
            serviceResponse.responseCode = 2;
            return serviceResponse;
        }
        const createQuestionRepositoryResponse : RepositoryResponse<string> = await QuestionRepository.addQuestion(question);
        if (createQuestionRepositoryResponse.responseCode !== 0) {
            serviceResponse.responseCode = -1;
            serviceResponse.data = "Error creating exam subject and topic";
            return serviceResponse;
        }
        if (!createQuestionRepositoryResponse.data) {
            serviceResponse.responseCode = -2;
            serviceResponse.data = "Repository could not create subject and topic";
            return serviceResponse;
        }
        serviceResponse.data = createQuestionRepositoryResponse.data;
        serviceResponse.responseCode = 0;
        return serviceResponse;
    },
    relateQuestionAndTopic:
        async (questionId: string, subjectAndTopicId: string) : Promise<ServiceResponse<string>>=>{
            const serviceResponse: ServiceResponse<string> = {
                responseCode: -1,
            };
            const questionExists: RepositoryResponse<boolean> = await QuestionRepository.existQuestion(questionId);
            if (questionExists.responseCode !== 0 ||
                !questionExists.data ||
                questionExists.data !== true
            ) {
                serviceResponse.responseCode = 1;
                serviceResponse.data = "QuestionId is not valid";
                return serviceResponse;
            }
            const subjectAndTopicExists: RepositoryResponse<boolean> = await ExamRepository.existsSubjectAndTopic(subjectAndTopicId);
            if (subjectAndTopicExists.responseCode !== 0 ||
                !subjectAndTopicExists.data ||
                subjectAndTopicExists.data !== true
            ) {
                serviceResponse.responseCode = 1;
                serviceResponse.data = "SubjectAndTopicId is not valid";
                return serviceResponse;
            }
            const updateQuestionResponse: RepositoryResponse<string> =
                await QuestionRepository.addTopicIdToQuestion(questionId, subjectAndTopicId);
            if (updateQuestionResponse.responseCode > 0 ) {
                serviceResponse.responseCode = 1;
                return serviceResponse;
            }
            if (updateQuestionResponse.responseCode < 0 ) {
                serviceResponse.responseCode = -1;
                return serviceResponse;
            }
            const updateSubjectAndTopicResponse: RepositoryResponse<string> =
                await ExamRepository.addQuestionIdToSubjectAndTopic(questionId, subjectAndTopicId);
            if (updateSubjectAndTopicResponse.responseCode > 0 ) {
                serviceResponse.responseCode = 1;
                return serviceResponse;
            }
            if (updateSubjectAndTopicResponse.responseCode < 0 ) {
                serviceResponse.responseCode = -1;
                return serviceResponse;
            }
            serviceResponse.responseCode = 0;
            return serviceResponse;
        },
    createExamInstance: async (examineeId: string, organiserId: string, examTemplateId: string): Promise<ServiceResponse<string>> => {
        const createExamInstanceServiceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        const examineeCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsExaminee(examineeId);
        if (examineeCheckResponse.responseCode >0 ) {
            createExamInstanceServiceResponse.responseCode = 1;
            createExamInstanceServiceResponse.data = "ExamineeId not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        if (examineeCheckResponse.responseCode <0) {
            createExamInstanceServiceResponse.responseCode = -1;
            createExamInstanceServiceResponse.data = "ExamineeId not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        const organiserCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsOrganiser(organiserId);
        if (organiserCheckResponse.responseCode >0 ) {
            createExamInstanceServiceResponse.responseCode = 1;
            createExamInstanceServiceResponse.data = "Organiser not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        if (organiserCheckResponse.responseCode <0) {
            createExamInstanceServiceResponse.responseCode = -1;
            createExamInstanceServiceResponse.data = "Organiser not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        const examCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsExamtemplate(examTemplateId);
        if (examCheckResponse.responseCode >0 ) {
            createExamInstanceServiceResponse.responseCode = 1;
            createExamInstanceServiceResponse.data = "ExamTemplate not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        if (examCheckResponse.responseCode <0) {
            createExamInstanceServiceResponse.responseCode = -1;
            createExamInstanceServiceResponse.data = "ExamTemplate not found while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        const examTemplateResponse: RepositoryResponse<ExamTemplate> =
                await ExamRepository.getExamTemplate(examTemplateId);
        if (examTemplateResponse.responseCode != 0 || !examTemplateResponse.data) {
            createExamInstanceServiceResponse.responseCode = -1;
            createExamInstanceServiceResponse.data = "ExamTemplate data not retrieved while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        const examTemplate: ExamTemplate = examTemplateResponse.data;
        const syllbusResponse: RepositoryResponse<Syllabus> = await ExamRepository.getSyllabus(examTemplate.syllabusId);
        if (syllbusResponse.responseCode != 0 || !syllbusResponse.data) {
            createExamInstanceServiceResponse.responseCode = -1;
            createExamInstanceServiceResponse.data = "Syllabus data not retrieved while creating exam instance";
            return createExamInstanceServiceResponse;
        }
        const syllabus: Syllabus = syllbusResponse.data;
        const examInstanceBuilder: ExamInstanceDetailBuilder = new ExamInstanceDetailBuilder();
        examInstanceBuilder.withExamineeId(examineeId);
        examInstanceBuilder.withSubject(examTemplate.subject);
        examInstanceBuilder.withGrade(""+examTemplate.grade);
        examInstanceBuilder.withExamTitle(examTemplate.title);
        examInstanceBuilder.withDuration(syllabus.duration*60);
        examInstanceBuilder.withStatus("Ready");
        examInstanceBuilder.withOrganiser(examTemplate.organiserId);
        examInstanceBuilder.withTemplate(examTemplateId);
        let questionCount = 0;
        // const includedQuestionIds: Set<string> = new Set();
        const examResultBuilder: ExamResultBuilder =
                new ExamResultBuilder();
        for (const topicAndQuestionCount of syllabus.topicsAndQuestionCounts) {
            const subjectAndTopicResponse: RepositoryResponse<SubjectAndTopic> =
                    await ExamRepository.getSubjectAndTopic(topicAndQuestionCount.subjectAndTopicId);
            if (subjectAndTopicResponse.responseCode != 0 || !subjectAndTopicResponse.data) {
                createExamInstanceServiceResponse.responseCode=2;
                createExamInstanceServiceResponse.data = "Service could not find topic with ID "+topicAndQuestionCount.subjectAndTopicId;
                return createExamInstanceServiceResponse;
            }
            const subjectAndTopic: SubjectAndTopic = subjectAndTopicResponse.data;
            const activeQuestionIds: string[] = subjectAndTopic.questionIds.filter((qId)=>{
                return qId.active === true;
            }).map((qId)=>{
                return qId.id;
            });
            questionCount += activeQuestionIds.length;
            if (activeQuestionIds.length < topicAndQuestionCount.count) {
                createExamInstanceServiceResponse.responseCode=3;
                createExamInstanceServiceResponse.data = "Creating exam instance for exam template:"+
                        examTemplateId+": could not be completed as not sufficient active question present in subject:"+
                        topicAndQuestionCount.subjectAndTopicId;
                return createExamInstanceServiceResponse;
            }
            shuffle(activeQuestionIds);
            for (let i=0; i<topicAndQuestionCount.count; i++) {
                examInstanceBuilder.withQuestion(activeQuestionIds[i]);
                const questionRepositoryResponse: RepositoryResponse<Question> =
                        await QuestionRepository.getQuestion(activeQuestionIds[i]);
                if (questionRepositoryResponse.responseCode != 0 || !questionRepositoryResponse.data) {
                    createExamInstanceServiceResponse.responseCode=4;
                    createExamInstanceServiceResponse.data = "Creating exam instance for exam template:"+
                            examTemplateId+": could not be completed as Question not found for ID:"+activeQuestionIds[i]+
                            "Referred in Subject:"+topicAndQuestionCount.subjectAndTopicId;
                    return createExamInstanceServiceResponse;
                }
                examResultBuilder.withQuestionAnswer(new AnswerRecordBuilder()
                    .withQuestionId(activeQuestionIds[i])
                    .withWeightage(topicAndQuestionCount.weightage)
                    .withCorrectAnswerIndex(questionRepositoryResponse.data.correctOptionIndex)
                    .build());
            }
        }
        examInstanceBuilder.withTotalQuestions(questionCount);
        const examResultCreateResponse: RepositoryResponse<string> =
                await ExamRepository.createExamResult(examResultBuilder.build());
        if (examResultCreateResponse.responseCode != 0 || !examResultCreateResponse.data) {
            createExamInstanceServiceResponse.responseCode=-2;
            createExamInstanceServiceResponse.data = "Creating exam result for exam template:"+
                            examTemplateId+": could not be completed";
            return createExamInstanceServiceResponse;
        }
        examInstanceBuilder.withExamResultId(examResultCreateResponse.data);
        const examInstancRepositoryResponse: RepositoryResponse<string> =
                await ExamRepository.createNewExamInstance(examInstanceBuilder.build());
        if (examInstancRepositoryResponse.responseCode != 0 || !examInstancRepositoryResponse.data) {
            createExamInstanceServiceResponse.responseCode=-2;
            createExamInstanceServiceResponse.data = "Creating exam instance for exam template:"+
                            examTemplateId+": could not be completed";
            return createExamInstanceServiceResponse;
        }
        const updateExamineeResponse: RepositoryResponse<string> =
            await ExamRepository.addExamInstanceToExaminee(examineeId, examInstancRepositoryResponse.data);
        if (updateExamineeResponse.responseCode != 0 ) {
            console.error("Orphan exam instance:"+examInstancRepositoryResponse.data+":created for Examinee:"+examineeId);
            createExamInstanceServiceResponse.responseCode = -3;
            return createExamInstanceServiceResponse;
        }
        createExamInstanceServiceResponse.data = examInstancRepositoryResponse.data;
        createExamInstanceServiceResponse.responseCode = 0;
        return createExamInstanceServiceResponse;
    },
    addExaminee: async (examinee: Examinee) : Promise<ServiceResponse<string>> => {
        const serviceResponse: ServiceResponse<string>= {responseCode: -1};
        const repositoryResponse: RepositoryResponse<string> =
            await ExamRepository.createNewExaminee(examinee);
        if (repositoryResponse.responseCode === 0 ) {
            serviceResponse.responseCode = 0;
            serviceResponse.data = repositoryResponse.data;
            return serviceResponse;
        }
        serviceResponse.responseCode = repositoryResponse.responseCode;
        return serviceResponse;
    },
    retrieveQuestionByOrganiserAndTopic:
        async (organiserId: string, topicId: string): Promise<ServiceResponse<Question[]>> => {
            const serviceResponse: ServiceResponse<Question[]> = {
                responseCode: -1,
            };
            const repositoryResponse: RepositoryResponse<Question[]> =
                await QuestionRepository.getQuestionByOrganiserAndTopic(organiserId, topicId);
            if (repositoryResponse.responseCode === 0) {
                serviceResponse.responseCode = 0;
                serviceResponse.data = repositoryResponse.data;
            }
            return serviceResponse;
        },
    listSyllabusByOrganiser:
        async (organiserId: string): Promise<ServiceResponse<Syllabus[]>> => {
            const serviceResponse: ServiceResponse<Syllabus[]> = {
                responseCode: -1,
            };
            const repositoryResponse: RepositoryResponse<Syllabus[]> =
                await ExamRepository.listSyllabusByOrganiser(organiserId);
            if (repositoryResponse.responseCode === 0) {
                serviceResponse.responseCode = 0;
                serviceResponse.data = repositoryResponse.data;
            }
            return serviceResponse;
        },
    listExamTemplateByOrganiser:
        async (organiserId: string): Promise<ServiceResponse<ExamTemplate[]>> => {
            const serviceResponse: ServiceResponse<ExamTemplate[]> = {
                responseCode: -1,
            };
            const repositoryResponse: RepositoryResponse<ExamTemplate[]> =
                await ExamRepository.listExamsByOrganiser(organiserId);
            if (repositoryResponse.responseCode === 0) {
                serviceResponse.responseCode = 0;
                serviceResponse.data = repositoryResponse.data;
            }
            return serviceResponse;
        },
    listAssignedExamineesByOrganiser:
        async (organiserId: string): Promise<ServiceResponse<{id: string, name: string}[]>> => {
            const serviceResponse: ServiceResponse<{id: string, name: string}[]> = {
                responseCode: -1,
            };
            const repositoryResponse: RepositoryResponse<{id: string, name: string}[]> =
                await ExamRepository.listAssignedExamineesByOrganiser(organiserId);
            if (repositoryResponse.responseCode !== 0) {
                serviceResponse.responseCode = 1;
                return serviceResponse;
            }
            const response: {id: string, name: string}[] = [];
            if (repositoryResponse.data) {
                repositoryResponse.data.forEach((examinee: {id: string, name: string})=> {
                    response.push(examinee);
                });
                serviceResponse.responseCode = 0;
                serviceResponse.data = response;
            }
            return serviceResponse;
        },
    assignExamineeToOrganiser: async (orgainserId: string, examineeId: string, examineeName: string) : Promise<ServiceResponse<boolean>> => {
        const serviceResponse: ServiceResponse<boolean>= {responseCode: -1};
        const repositoryResponse: RepositoryResponse<boolean> =
            await ExamRepository.assignExamineeToOrganiser(orgainserId, examineeId, examineeName);
        if (repositoryResponse.responseCode === 0 ) {
            serviceResponse.responseCode = 0;
            serviceResponse.data = repositoryResponse.data;
            return serviceResponse;
        }
        serviceResponse.responseCode = repositoryResponse.responseCode;
        serviceResponse.data = false;
        return serviceResponse;
    },

};
