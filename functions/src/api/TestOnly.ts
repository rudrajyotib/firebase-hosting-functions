/* eslint-disable max-len */
import functions = require("firebase-functions")
import {Request, Response} from "express";
import {ExamRepository} from "../repository/ExamRepository";
import {ExamInstanceDetailBuilder} from "../model/ExamInstanceDetail";
import {ExamineeBuilder} from "../model/Examinee";
import {QuestionRepository} from "../repository/QuestionRepository";
import {QuestionBuilder} from "../model/Question";
import {RepositoryResponse} from "../repository/data/RepositoryResponse";


export const AddExamConverter =
    async (req: Request, res: Response) => {
        ExamRepository.createNewExamInstance(new ExamInstanceDetailBuilder()
            .withSubject("ENGG").build())
            .then((data) => {
                res.status(200).send("Done" + data.data);
            });
    };

export const AddExamAndExaminee =
    async (req: Request, res: Response) => {
        const examinee1: RepositoryResponse<string> = await ExamRepository.createNewExaminee(new ExamineeBuilder()
            .withName("E1").withEmail("E1.com").withStatus("active").build());

        await ExamRepository.createNewExaminee(new ExamineeBuilder()
            .withName("E2").withEmail("E2.com").withStatus("active").build());

        const q1: RepositoryResponse<string> = await QuestionRepository.addQuestion(new QuestionBuilder()
            .withQuestionLine("Q1 L1")
            .withQuestionLine("Q1 L2")
            .withOption("Q1 O1")
            .withOption("Q1 O1")
            .withFormat("textOnly")
            .withCorrectOptionIndex(0)
            .build());

        const q2: RepositoryResponse<string> =await QuestionRepository.addQuestion(new QuestionBuilder()
            .withQuestionLine("Q2 L1")
            .withQuestionLine("Q2 L2")
            .withOption("Q2 O1")
            .withOption("Q2 O1")
            .withFormat("textOnly")
            .withCorrectOptionIndex(0)
            .build());


        functions.logger.log("Loading data::Q1 is::"+JSON.stringify(q1) );

        await ExamRepository.createNewExamInstance(new ExamInstanceDetailBuilder()
            .withSubject("English")
            .withStatus("Ready")
            .withQuestion(q1.data ? q1.data : "")
            .withQuestion(q2.data ? q2.data : "")
            .withOrganiser("Harvest")
            .withGrade("2")
            .withExamineeId(examinee1.data ? examinee1.data : "")
            .withExamTitle("Grade 2 English")
            .withDuration(1800)
            .build());

        res.status(200).send("Done");
    };
