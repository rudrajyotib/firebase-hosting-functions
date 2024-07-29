/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {Organiser, OrganiserBuilder} from "../../model/Organiser";

export const OrganiserConverter : FirestoreDataConverter<Organiser> = {
    toFirestore: function(modelObject: Organiser): FirebaseFirestore.DocumentData {
        return {
            name: modelObject.name,
            status: modelObject.status,
            examIds: modelObject.exams,
            syllabusIds: modelObject.syllabus,
            subjects: modelObject.subjects,
            assignedExaminees: modelObject.assignedExaminees,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>) {
        const organiserBuilder: OrganiserBuilder = new OrganiserBuilder();
        organiserBuilder.withId(snapshot.id);
        organiserBuilder.withName(snapshot.get("name"));
        organiserBuilder.withStatus(snapshot.get("status"));
        const examIds: [] = snapshot.get("examIds");
        const syllabusIds: [] = snapshot.get("syllabusIds");
        const subjects: [] = snapshot.get("subjects");
        const examineeIds: [] = snapshot.get("assignedExaminees");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        examIds.forEach((examId: string)=>{
            organiserBuilder.withExamId(examId);
        });
        syllabusIds.forEach((syllabusId: string)=>{
            organiserBuilder.withSyllabusId(syllabusId);
        });
        subjects.forEach((subjectId: string)=>{
            organiserBuilder.withSubjectId(subjectId);
        });
        examineeIds.forEach((examinee: {id: string, name: string})=>{
            organiserBuilder.withAssignedExaminee({
                id: examinee.id,
                name: examinee.name,
            });
        });
        return organiserBuilder.build();
    },
};
