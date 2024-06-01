/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AddExamIdsToOrganiser, AddOrganiser, AddSyllabus, AddSyllabusIdsToOrganiser, AddTopicsToSyllabus, CreateExamTemplate, CreateQuestion, CreateSubjectAndTopic} from "../controller/OrganiserAdminActivityController";
const organiserAdminRouter = express.Router();

organiserAdminRouter.post("/add", AddOrganiser);
organiserAdminRouter.post("/addsyllabus", AddSyllabus);
organiserAdminRouter.post("/addtopicstosyllabus", AddTopicsToSyllabus);
organiserAdminRouter.post("/addsyllabustoorganiser", AddSyllabusIdsToOrganiser);
organiserAdminRouter.post("/addexamtoorganiser", AddExamIdsToOrganiser);
organiserAdminRouter.post("/addexamtemplate", CreateExamTemplate);
organiserAdminRouter.post("/addsubjectandtopic", CreateSubjectAndTopic);
organiserAdminRouter.post("/addquestion", CreateQuestion);

export {organiserAdminRouter};
