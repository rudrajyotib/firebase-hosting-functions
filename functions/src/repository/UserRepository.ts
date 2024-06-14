/* eslint-disable max-len */
import {User} from "../model/User";
import {RepositoryResponse} from "./data/RepositoryResponse";

import {source} from "../infra/DataSource";
import {UserConverter} from "./converters/UserConverter";


const repository = source.repository;


export const UserRepository = {
    addUser: async function(user: User) :
        Promise<RepositoryResponse<string>> {
        const response: RepositoryResponse<string> = {
            responseCode: -1,
        };
        await repository
            .collection("Users")
            .withConverter(UserConverter)
            .add(user)
            .then((userRef: FirebaseFirestore.DocumentReference<User>) => {
                response.responseCode = 0;
                response.data = userRef.id;
            })
            .catch((e)=>{
                console.error("Error adding user", e);
            });
        return response;
    },

    queryUser: async function(name: string):
        Promise<RepositoryResponse<User>> {
        const response: RepositoryResponse<User> = {
            responseCode: -1,
        };
        await repository
            .collection("Users")
            .withConverter(UserConverter)
            .where("name", "==", name)
            .limit(1)
            .get()
            .then((querySnapshot:FirebaseFirestore.QuerySnapshot<User>) => {
                if (!querySnapshot.empty) {
                    const userSnapshot: undefined | FirebaseFirestore.QueryDocumentSnapshot<User> = querySnapshot.docs.at(0);
                    if (userSnapshot !== undefined) {
                        const user: User = userSnapshot.data();
                        response.data = user;
                        response.responseCode = 0;
                    }
                } else {
                    response.responseCode = 1;
                    console.error("Could not find user with name::"+name);
                }
            })
            .catch((e)=>{
                console.error("Error searching user by name", e);
            });
        return response;
    },
};
