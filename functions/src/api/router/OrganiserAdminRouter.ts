/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AddExamIdsToOrganiser, AddExaminee, AddOrganiser, AddSyllabus, AddSyllabusIdsToOrganiser, AddTopicsToSyllabus, AssignExamineeToOrganiser, CorrelateQuestionAndSubjectTopic, CreateExamInstance, CreateExamTemplate, CreateQuestion, CreateQuestionWithTopic, CreateSubjectAndTopic, ListAssignedExamineesByOrganiser, ListExamTemplateByOrganiser, ListOfSubjectAndTopicsByOrg, ListQuestionsByOrganiserAndTopic, ListSyllabusByOrganiser} from "../controller/OrganiserAdminActivityController";
const organiserAdminRouter = express.Router();

organiserAdminRouter.post("/add", AddOrganiser);
organiserAdminRouter.post("/addsyllabus", AddSyllabus);
organiserAdminRouter.post("/addtopicstosyllabus", AddTopicsToSyllabus);
organiserAdminRouter.post("/addsyllabustoorganiser", AddSyllabusIdsToOrganiser);
organiserAdminRouter.post("/addexamtoorganiser", AddExamIdsToOrganiser);
organiserAdminRouter.post("/addexamtemplate", CreateExamTemplate);
organiserAdminRouter.post("/addsubjectandtopic", CreateSubjectAndTopic);
organiserAdminRouter.post("/addquestion", CreateQuestion);
organiserAdminRouter.post("/addquestionwithtopic", CreateQuestionWithTopic);
organiserAdminRouter.post("/correlatequestionandtopic", CorrelateQuestionAndSubjectTopic);
organiserAdminRouter.post("/createexaminstance", CreateExamInstance);
organiserAdminRouter.post("/addexaminee", AddExaminee);
organiserAdminRouter.get("/subjects", ListOfSubjectAndTopicsByOrg);
organiserAdminRouter.get("/questionsbyorganiserandtopic", ListQuestionsByOrganiserAndTopic);
organiserAdminRouter.get("/syllabusbyorganiser", ListSyllabusByOrganiser);
organiserAdminRouter.get("/examsbyorganiser", ListExamTemplateByOrganiser);
organiserAdminRouter.get("/listassignedexaminees", ListAssignedExamineesByOrganiser);
organiserAdminRouter.post("/assignexaminee", AssignExamineeToOrganiser);

export {organiserAdminRouter};
