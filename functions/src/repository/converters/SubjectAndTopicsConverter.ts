/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {SubjectAndTopic, SubjectAndTopicBuilder} from "../../model/SubjectAndTopic";

export const SubjectAndTopicConverter : FirestoreDataConverter<SubjectAndTopic> = {
    toFirestore: function(modelObject: SubjectAndTopic): FirebaseFirestore.DocumentData {
        return {
            grade: modelObject.grade,
            subject: modelObject.subject,
            topic: modelObject.topic,
            questionIds: modelObject.questionIds,
            organiserId: modelObject.organiserId,
            title: modelObject.title,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
        const subjectAndTopicBuilder: SubjectAndTopicBuilder = new SubjectAndTopicBuilder();
        subjectAndTopicBuilder.withSubject(snapshot.get("subject"));
        subjectAndTopicBuilder.withId(snapshot.id);
        subjectAndTopicBuilder.withTopic(snapshot.get("topic"));
        subjectAndTopicBuilder.withGrade(snapshot.get("grade"));
        subjectAndTopicBuilder.withOrganiserId(snapshot.get("organiserId"));
        subjectAndTopicBuilder.withTitle(snapshot.get("title"));
        const assignedQuestions : [] = snapshot.get("questionIds");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignedQuestions.forEach((q: any)=>{
            subjectAndTopicBuilder.withQuestionId( q["id"], q["active"]);
        });
        return subjectAndTopicBuilder.build();
    },
};
