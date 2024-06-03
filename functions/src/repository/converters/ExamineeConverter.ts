/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {FirestoreDataConverter} from "firebase-admin/firestore";
import {Examinee, ExamineeBuilder} from "../../model/Examinee";

export const ExamineeConverter : FirestoreDataConverter<Examinee> = {
    toFirestore: function(modelObject: FirebaseFirestore.WithFieldValue<Examinee>): FirebaseFirestore.DocumentData {
        return {
            name: modelObject.name,
            email: modelObject.email,
            status: modelObject.status,
            examInstances: modelObject.assignedExams,
        };
    },
    fromFirestore: function(snapshot: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): Examinee {
        const examineeBuilder = new ExamineeBuilder();
        examineeBuilder.withId(snapshot.id);
        examineeBuilder.withEmail(snapshot.get("email"));
        examineeBuilder.withName(snapshot.get("name"));
        examineeBuilder.withStatus(snapshot.get("status"));
        const examInstanceIds: {id: string, status: string}[] = snapshot.get("examInstances");
        examInstanceIds.forEach((exam)=>{
            examineeBuilder.withAssignedExamAndStatus(exam["id"], exam["status"]);
        });
        return examineeBuilder.build();
    },
};
