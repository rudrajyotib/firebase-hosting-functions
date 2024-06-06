/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {Syllabus, SyllabusBuilder, TopicAndQuestionCountBuilder} from "../../model/Syllabus";

export const SyllabusConverter : FirestoreDataConverter<Syllabus> = {
    toFirestore: function(modelObject: Syllabus): FirebaseFirestore.DocumentData {
        const topicsAndQuestionCount = modelObject.topicsAndQuestionCounts.map((topic)=>{
            return {
                subjectAndTopicId: topic.subjectAndTopicId,
                count: topic.count,
                weightage: topic.weightage,
            };
        });
        return {
            totalMarks: modelObject.totalMarks,
            subject: modelObject.subject,
            duration: modelObject.duration,
            status: modelObject.status,
            topicsAndQuestionCounts: topicsAndQuestionCount,
            organiserId: modelObject.organiserId,
            title: modelObject.title,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
        const syllabusBuilder: SyllabusBuilder = new SyllabusBuilder();
        syllabusBuilder.withSubject(snapshot.get("subject"));
        syllabusBuilder.withDuration(snapshot.get("duration"));
        syllabusBuilder.withStatus(snapshot.get("status"));
        syllabusBuilder.withTitle(snapshot.get("title"));
        syllabusBuilder.withOrganiserId(snapshot.get("title"));
        const tna: [] = snapshot.get("topicsAndQuestionCounts");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tna.forEach((topic: any)=>{
            const topicAndQuestionCountBuilder = new TopicAndQuestionCountBuilder();
            topicAndQuestionCountBuilder.withCount(topic["count"]);
            topicAndQuestionCountBuilder.withSubjectAndTopicId(topic["subjectAndTopicId"]);
            topicAndQuestionCountBuilder.withWeightage(topic["weightage"]);
            syllabusBuilder.withTopicAndQuestionCounts(topicAndQuestionCountBuilder.build());
        });
        return syllabusBuilder.build();
    },
};
