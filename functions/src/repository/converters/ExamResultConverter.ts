/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {AnswerRecord, AnswerRecordBuilder, ExamResult, ExamResultBuilder} from "../../model/ExamResult";

export const ExamResultConverter : FirestoreDataConverter<ExamResult> = {
    toFirestore: function(modelObject: ExamResult): FirebaseFirestore.DocumentData {
        const qna: unknown = modelObject.questionsAndAnswers.map((questionAndAnswer: AnswerRecord)=>{
            return {
                questionId: questionAndAnswer.questionId,
                status: questionAndAnswer.status,
                correctAnswerIndex: questionAndAnswer.correctAnswerIndex,
                givenAnswerIndex: questionAndAnswer.givenAnswerIndex,
                weightage: questionAndAnswer.weightage,
            };
        });
        return {
            score: modelObject.score,
            totalMarks: modelObject.totalMarks,
            status: modelObject.status,
            questionAndAnswer: qna,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): ExamResult {
        const examResultBuilder = new ExamResultBuilder();
        examResultBuilder.withId(snapshot.id);
        examResultBuilder.withScore(snapshot.get("score"));
        examResultBuilder.withTotalMarks(snapshot.get("totalMarks"));
        examResultBuilder.withStatus(snapshot.get("status"));
        const questionAndAnswers: [] = snapshot.get("questionAndAnswer");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        questionAndAnswers.forEach((qna:any) => {
            const answerRecordBuilder: AnswerRecordBuilder = new AnswerRecordBuilder();
            // console.log("QNA as received::", qna);
            answerRecordBuilder.withQuestionId(qna["questionId"]);
            answerRecordBuilder.withStatus(qna["status"]);
            answerRecordBuilder.withCorrectAnswerIndex(qna["correctAnswerIndex"]);
            answerRecordBuilder.withGivenAnswerIndex(qna["givenAnswerIndex"]);
            answerRecordBuilder.withWeightage(qna["weightage"]);
            examResultBuilder.withQuestionAnswer(answerRecordBuilder.build());
        });
        return examResultBuilder.build();
    },
};
