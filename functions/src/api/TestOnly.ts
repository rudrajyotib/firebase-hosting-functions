/* eslint-disable max-len */
import {Request, Response} from "express";
import {source} from "../infra/DataSource";

const repository = source.repository;

export const AddExamAndExaminee =
    async (req: Request, res: Response) => {
        repository.collection("Examinee")
            .add({
                Email: "riju1@gmail.com",
                Name: "Shaktiman",
                Exams: ["1", "2"],
            })
            .then((data:
                FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>)=>{
                const id = data.id;
                repository.collection("ExamInstance")
                    .add({
                        examineeId: id,
                        subject: "English",
                        grade: "2",
                        questions: ["1", "2"],
                        startTime: new Date(),
                        status: "ready",
                        organiser: "Harvest International School",
                        examTitle: "Level 2 English",
                        duration: 900,
                    })
                    .then((data:
                        FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>)=>{
                        res.status(200).send("Done"+data.id);
                    });
            })
            .catch((e)=>{
                res.status(400).send("Not Done"+e);
            });
    };
