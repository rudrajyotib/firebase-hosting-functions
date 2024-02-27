/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {Question, QuestionBuilder} from "../../model/Question";

export const QuestionConverter: FirestoreDataConverter<Question> = {
    toFirestore: function(question: FirebaseFirestore.WithFieldValue<Question>): FirebaseFirestore.DocumentData {
        return ({
            format: question.format,
            questionLines: question.questionLines,
            options: question.options,
            correctAnswerIndex: question.correctOptionIndex,
        });
    },
    fromFirestore: function(questionSnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): Question {
        const questionBuilder = new QuestionBuilder();
        questionBuilder
            .withId(questionSnapshot.id)
            .withFormat(questionSnapshot.get("format"))
            .withCorrectOptionIndex(questionSnapshot.get("correctAnswerIndex"));
        const questionLines: string[] = questionSnapshot.get("questionLines");
        const options: string[] = questionSnapshot.get("options");
        questionLines.forEach((line)=>{
            questionBuilder.withQuestionLine(line);
        } );
        options.forEach((option)=>{
            questionBuilder.withOption(option);
        } );
        return questionBuilder.build();
    },
};
