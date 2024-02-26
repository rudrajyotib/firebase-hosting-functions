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

    startExam: async (examineeId: string, examInstanceId: string) : Promise<number> =>{
        if ( (examineeId === undefined || examineeId === "") ||
            (examInstanceId === undefined || examInstanceId === "") ) {
            return 1;
        }
        const examInstanceRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> =
         repository.collection("ExamInstance").doc(examInstanceId);
        const examInstanceDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>=await examInstanceRef.get();
        if (!examInstanceDoc.exists) {
            return 2;
        }
        if (examineeId !== examInstanceDoc.get("examineeId")) {
            return 3;
        }
        if ("ready" !== examInstanceDoc.get("status")) {
            return 4;
        }
        return examInstanceRef
            .update({status: "inProgress"})
            .then(()=>{
                return 0;
            })
            .catch((e)=>{
                functions.logger.error("Repository failed to update exam Instace", e);
                return 5;
            });
    },
};
