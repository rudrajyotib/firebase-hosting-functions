/* eslint-disable max-len */
import {FirestoreDataConverter, QueryDocumentSnapshot, Timestamp} from "firebase-admin/firestore";
import {ExamInstanceDetail, ExamInstanceDetailBuilder} from "../../model/ExamInstanceDetail";
import {ExamInstanceSummary, ExamInstanceSummaryBuilder} from "../../model/ExamInstanceSummary";


export const ExamInstanceDetailsConverter : FirestoreDataConverter<ExamInstanceDetail>= {
    toFirestore: (examInstanceDetail: ExamInstanceDetail) => {
        return {
            examineeId: examInstanceDetail.examineeId,
            subject: examInstanceDetail.subject,
            grade: examInstanceDetail.grade,
            template: examInstanceDetail.template,
            questions: examInstanceDetail.questions,
            answers: examInstanceDetail.answers,
            examTitle: examInstanceDetail.examTitle,
            organiser: examInstanceDetail.organiser,
            status: examInstanceDetail.status,
            totalQuestions: examInstanceDetail.totalQuestions,
            currentQuestionIndex: examInstanceDetail.currentQuestionIndex,
            duration: examInstanceDetail.duration,
            examResultId: examInstanceDetail.examResultId,
            startTime: examInstanceDetail.startTime? Timestamp.fromDate(examInstanceDetail.startTime): null,
        };
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot) =>{
        const examInstanceBuilder = new ExamInstanceDetailBuilder()
            .withId(snapshot.id)
            .withExamineeId(snapshot.get("examineeId"))
            .withSubject(snapshot.get("subject"))
            .withGrade(snapshot.get("grade"))
            .withTemplate(snapshot.get("template"))
            .withExamTitle(snapshot.get("examTitle"))
            .withOrganiser(snapshot.get("organiser"))
            .withStatus(snapshot.get("status"))
            .withTotalQuestions(snapshot.get("totalQuestions"))
            .withCurrentQuestionIndex(snapshot.get("currentQuestionIndex"))
            .withExamResultId(snapshot.get("examResultId"))
            .withDuration(snapshot.get("duration"));
        const questions:string[] = snapshot.get("questions");
        questions.forEach( (q) => {
            examInstanceBuilder.withQuestion(q);
        });
        const answers:number[] = snapshot.get("answers");
        answers.forEach( (a) => {
            examInstanceBuilder.withAnswer(a);
        });
        if (snapshot.get("startTime")) {
            const startTime: Timestamp = snapshot.get("startTime");
            examInstanceBuilder.withStartTime(startTime.toDate());
        }
        return examInstanceBuilder.build();
    },
};

export const ExamInstanceSummaryConverter : FirestoreDataConverter<ExamInstanceSummary> = {
    toFirestore: () => {
        throw Error("exam summary should never be persisted");
    },
    fromFirestore: (snapshot:QueryDocumentSnapshot) => {
        const examSummaryBuilder = new ExamInstanceSummaryBuilder();
        examSummaryBuilder
            .withId(snapshot.id)
            .withGrade(snapshot.get("grade"))
            .withExamineeId(snapshot.get("examineeId"))
            .withTitle(snapshot.get("examTitle"))
            .withSubject(snapshot.get("subject"))
            .withStatus(snapshot.get("status"))
            .withOrganiser(snapshot.get("organiser"))
            .build();
        return examSummaryBuilder.build();
    },
};
