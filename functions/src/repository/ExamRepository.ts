/* eslint-disable max-len */
import functions = require("firebase-functions")
import {source} from "../infra/DataSource";
import {ExamInstanceSummary, ExamInstanceSummaryBuilder} from "../model/ExamInstanceSummary";

const repository = source.repository;

export const ExamRepository = {
    listActiveExams: async (examineeId: string): Promise<ExamInstanceSummary[]> => {
        const examInstances: ExamInstanceSummary[] = [];
        functions.logger.log("Repository querying active exams for::", examineeId);
        await repository
            .collection("ExamInstance")
            .where("examineeId", "==", examineeId)
            .get()
            .then((snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>)=>{
                functions.logger.log("Found results::", snapshot.docs.length);
                snapshot.forEach((element) => {
                    const examInstanceSummary: ExamInstanceSummary =
                    new ExamInstanceSummaryBuilder()
                        .withId(element.id)
                        .withGrade(element.get("grade"))
                        .withExamineeId(element.get("examineeId"))
                        .withTitle(element.get("examTitle"))
                        .withSubject(element.get("subject"))
                        .withStatus(element.get("status"))
                        .withOrganiser(element.get("organiser"))
                        .build();
                    examInstances.push(examInstanceSummary);
                });
            });
        return examInstances;
    },
};
