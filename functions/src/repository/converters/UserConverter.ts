/* eslint-disable max-len */
import {FirestoreDataConverter, QueryDocumentSnapshot} from "firebase-admin/firestore";
import {User, UserBuilder} from "../../model/User";


export const UserConverter : FirestoreDataConverter<User>= {
    toFirestore: function(modelObject: FirebaseFirestore.WithFieldValue<User>): FirebaseFirestore.DocumentData {
        return {
            name: modelObject.name,
            email: modelObject.name,
            role: modelObject.role,
            orgId: modelObject.orgId,
        };
    },
    fromFirestore: function(snapshot: QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): User {
        const userBuilder: UserBuilder = new UserBuilder();
        userBuilder.withEmail(snapshot.get("email"));
        userBuilder.withName(snapshot.get("name"));
        userBuilder.withRole(snapshot.get("role"));
        userBuilder.withOrgId(snapshot.get("orgId"));
        userBuilder.withId(snapshot.id);
        return userBuilder.build();
    },
};
