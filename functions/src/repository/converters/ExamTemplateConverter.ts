/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {ExamTemplate, ExamTemplateBuilder} from "../../model/ExamTemplate";
export const ExamTemplateConverter : FirestoreDataConverter<ExamTemplate> = {
    toFirestore: function(modelObject: FirebaseFirestore.WithFieldValue<ExamTemplate>): FirebaseFirestore.DocumentData {
        return {
            grade: modelObject.grade,
            subject: modelObject.subject,
            syllabusId: modelObject.syllabusId,
            status: modelObject.status,
            organiserId: modelObject.organiserId,
            title: modelObject.title,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): ExamTemplate {
        const exampleTemplateBuilder: ExamTemplateBuilder = new ExamTemplateBuilder();
        exampleTemplateBuilder.withGrade(snapshot.get("grade"));
        exampleTemplateBuilder.withSubject(snapshot.get("subject"));
        exampleTemplateBuilder.withSyllabusId(snapshot.get("syllabusId"));
        exampleTemplateBuilder.withStatus(snapshot.get("status"));
        exampleTemplateBuilder.withOrganiserId(snapshot.get("organiserId"));
        exampleTemplateBuilder.withTitle(snapshot.get("title"));
        exampleTemplateBuilder.withId(snapshot.id);

        return exampleTemplateBuilder.build();
    },
};
