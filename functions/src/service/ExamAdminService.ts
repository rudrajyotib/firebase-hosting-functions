/* eslint-disable max-len */
/* eslint-disable-next-line max-len */
import {ExamInstanceDetailBuilder} from "../model/ExamInstanceDetail";
import {AnswerRecordBuilder, ExamResultBuilder} from "../model/ExamResult";
import {ExamTemplate} from "../model/ExamTemplate";
import {Examinee} from "../model/Examinee";
import {Organiser} from "../model/Organiser";
import {Question} from "../model/Question";
import {SubjectAndTopic} from "../model/SubjectAndTopic";
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
        const createExamTemplateRepositoryResponse : RepositoryResponse<string> = await ExamRepository.addSubjectAndTopic(subjectAndTopic);
        if (createExamTemplateRepositoryResponse.responseCode !== 0) {
            serviceResponse.responseCode = -1;
            serviceResponse.data = "Error creating exam subject and topic";
            return serviceResponse;
        }
        if (!createExamTemplateRepositoryResponse.data) {
            serviceResponse.responseCode = -2;
            serviceResponse.data = "Repository could not create subject and topic";
            return serviceResponse;
        }
        const addExamTemplateToOrganiserRepositoryResponse: RepositoryResponse<string> =
            await ExamRepository.addSubjectAndTopicToOrganiser(subjectAndTopic.organiserId,
                createExamTemplateRepositoryResponse.data);
        if (addExamTemplateToOrganiserRepositoryResponse.responseCode != 0) {
            serviceResponse.responseCode = -3;
            serviceResponse.data = "Repository is not connected to organiser";
            console.error("ExamId "+createExamTemplateRepositoryResponse.data+" could not be connected to organiser");
            return serviceResponse;
        }
        serviceResponse.responseCode = 0;
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
        const createExamTemplateRepositoryResponse : RepositoryResponse<string> = await QuestionRepository.addQuestion(question);
        if (createExamTemplateRepositoryResponse.responseCode !== 0) {
            serviceResponse.responseCode = -1;
            serviceResponse.data = "Error creating exam subject and topic";
            return serviceResponse;
        }
        if (!createExamTemplateRepositoryResponse.data) {
            serviceResponse.responseCode = -2;
            serviceResponse.data = "Repository could not create subject and topic";
            return serviceResponse;
        }
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
        const createExamInstanceResponse: ServiceResponse<string> = {
            responseCode: -1,
        };
        const examineeCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsExaminee(examineeId);
        if (examineeCheckResponse.responseCode >0 ) {
            createExamInstanceResponse.responseCode = 1;
            createExamInstanceResponse.data = "ExamineeId not found while creating exam instance";
            return createExamInstanceResponse;
        }
        if (examineeCheckResponse.responseCode <0) {
            createExamInstanceResponse.responseCode = -1;
            createExamInstanceResponse.data = "ExamineeId not found while creating exam instance";
            return createExamInstanceResponse;
        }
        const organiserCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsOrganiser(organiserId);
        if (organiserCheckResponse.responseCode >0 ) {
            createExamInstanceResponse.responseCode = 1;
            createExamInstanceResponse.data = "Organiser not found while creating exam instance";
            return createExamInstanceResponse;
        }
        if (organiserCheckResponse.responseCode <0) {
            createExamInstanceResponse.responseCode = -1;
            createExamInstanceResponse.data = "Organiser not found while creating exam instance";
            return createExamInstanceResponse;
        }
        const examCheckResponse: RepositoryResponse<boolean> =
                await ExamRepository.existsExamtemplate(examTemplateId);
        if (examCheckResponse.responseCode >0 ) {
            createExamInstanceResponse.responseCode = 1;
            createExamInstanceResponse.data = "ExamTemplate not found while creating exam instance";
            return createExamInstanceResponse;
        }
        if (examCheckResponse.responseCode <0) {
            createExamInstanceResponse.responseCode = -1;
            createExamInstanceResponse.data = "ExamTemplate not found while creating exam instance";
            return createExamInstanceResponse;
        }
        const examTemplateResponse: RepositoryResponse<ExamTemplate> =
                await ExamRepository.getExamTemplate(examTemplateId);
        if (examTemplateResponse.responseCode != 0 || !examTemplateResponse.data) {
            createExamInstanceResponse.responseCode = -1;
            createExamInstanceResponse.data = "ExamTemplate data not retrieved while creating exam instance";
            return createExamInstanceResponse;
        }
        const examTemplate: ExamTemplate = examTemplateResponse.data;
        const syllbusResponse: RepositoryResponse<Syllabus> = await ExamRepository.getSyllabus(examTemplate.syllabusId);
        if (syllbusResponse.responseCode != 0 || !syllbusResponse.data) {
            createExamInstanceResponse.responseCode = -1;
            createExamInstanceResponse.data = "Syllabus data not retrieved while creating exam instance";
            return createExamInstanceResponse;
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
        // const includedQuestionIds: Set<string> = new Set();
        const examResultBuilder: ExamResultBuilder =
                new ExamResultBuilder();
        for (const topicAndQuestionCount of syllabus.topicsAndQuestionCounts) {
            const subjectAndTopicResponse: RepositoryResponse<SubjectAndTopic> =
                    await ExamRepository.getSubjectAndTopic(topicAndQuestionCount.subjectAndTopicId);
            if (subjectAndTopicResponse.responseCode != 0 || !subjectAndTopicResponse.data) {
                createExamInstanceResponse.responseCode=2;
                createExamInstanceResponse.data = "Service could not find topic with ID "+topicAndQuestionCount.subjectAndTopicId;
                return createExamInstanceResponse;
            }
            const subjectAndTopic: SubjectAndTopic = subjectAndTopicResponse.data;
            const activeQuestionIds: string[] = subjectAndTopic.questionIds.filter((qId)=>{
                return qId.active === true;
            }).map((qId)=>{
                return qId.id;
            });
            if (activeQuestionIds.length < topicAndQuestionCount.count) {
                createExamInstanceResponse.responseCode=3;
                createExamInstanceResponse.data = "Creating exam instance for exam template:"+
                        examTemplateId+": could not be completed as not sufficient active question present in subject:"+
                        topicAndQuestionCount.subjectAndTopicId;
                return createExamInstanceResponse;
            }
            shuffle(activeQuestionIds);
            for (let i=0; i<topicAndQuestionCount.count; i++) {
                examInstanceBuilder.withQuestion(activeQuestionIds[i]);
                const questionRepositoryResponse: RepositoryResponse<Question> =
                        await QuestionRepository.getQuestion(activeQuestionIds[i]);
                if (questionRepositoryResponse.responseCode != 0 || !questionRepositoryResponse.data) {
                    createExamInstanceResponse.responseCode=4;
                    createExamInstanceResponse.data = "Creating exam instance for exam template:"+
                            examTemplateId+": could not be completed as Question not found for ID:"+activeQuestionIds[i]+
                            "Referred in Subject:"+topicAndQuestionCount.subjectAndTopicId;
                    return createExamInstanceResponse;
                }
                examResultBuilder.withQuestionAnswer(new AnswerRecordBuilder()
                    .withQuestionId(activeQuestionIds[i])
                    .withWeightage(topicAndQuestionCount.weightage)
                    .withCorrectAnswerIndex(questionRepositoryResponse.data.correctOptionIndex)
                    .build());
            }
        }
        const examResultCreateResponse: RepositoryResponse<string> =
                await ExamRepository.createExamResult(examResultBuilder.build());
        if (examResultCreateResponse.responseCode != 0 || !examResultCreateResponse.data) {
            createExamInstanceResponse.responseCode=-2;
            createExamInstanceResponse.data = "Creating exam result for exam template:"+
                            examTemplateId+": could not be completed";
            return createExamInstanceResponse;
        }
        examInstanceBuilder.withExamResultId(examResultCreateResponse.data);
        const examInstancResponse: RepositoryResponse<string> =
                await ExamRepository.createNewExamInstance(examInstanceBuilder.build());
        if (examInstancResponse.responseCode != 0 || !examInstancResponse.data) {
            createExamInstanceResponse.responseCode=-2;
            createExamInstanceResponse.data = "Creating exam instance for exam template:"+
                            examTemplateId+": could not be completed";
            return createExamInstanceResponse;
        }
        const updateExamineeResponse: RepositoryResponse<string> =
            await ExamRepository.addExamInstanceToExaminee(examineeId, examInstancResponse.data);
        if (updateExamineeResponse.responseCode != 0 ) {
            console.error("Orphan exam instance:"+examInstancResponse.data+":created for Examinee:"+examineeId);
            createExamInstanceResponse.responseCode = -3;
            return createExamInstanceResponse;
        }
        createExamInstanceResponse.responseCode = 0;
        return createExamInstanceResponse;
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
};
