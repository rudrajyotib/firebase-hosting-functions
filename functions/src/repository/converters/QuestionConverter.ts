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
            status: question.status,
            orgainserId: question.organiserId,
            tags: question.tags,
        });
    },
    fromFirestore: function(questionSnapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): Question {
        const questionBuilder = new QuestionBuilder();
        questionBuilder
            .withId(questionSnapshot.id)
            .withOrganiserId(questionSnapshot.get("orgainserId"))
            .withFormat(questionSnapshot.get("format"))
            .withCorrectOptionIndex(questionSnapshot.get("correctAnswerIndex"));
        const questionLines: string[] = questionSnapshot.get("questionLines");
        const options: string[] = questionSnapshot.get("options");
        const tags: string[] = questionSnapshot.get("tags");
        questionLines.forEach((line)=>{
            questionBuilder.withQuestionLine(line);
        } );
        options.forEach((option)=>{
            questionBuilder.withOption(option);
        } );
        tags.forEach((tag)=>{
            questionBuilder.withTag(tag);
        } );
        if ("Inactive" === questionSnapshot.get("status")) {
            questionBuilder.markInactive();
        }
        return questionBuilder.build();
    },
};
