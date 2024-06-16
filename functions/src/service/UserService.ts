/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {ExamineeBuilder} from "../model/Examinee";
import {OrganiserBuilder} from "../model/Organiser";
import {User} from "../model/User";
import {ExamRepository} from "../repository/ExamRepository";
import {UserRepository} from "../repository/UserRepository";
import {RepositoryResponse} from "../repository/data/RepositoryResponse";
import {ServiceResponse} from "./data/ServiceResponse";

export const UserService = {
    addUser: async function(user: User) :
        Promise<ServiceResponse<string>> {
        const response: ServiceResponse<string>= {
            responseCode: -1,
        };
        if (user.role === "student" ) {
            const createExamineeResponse: RepositoryResponse<string> =
                await ExamRepository.createNewExaminee(new ExamineeBuilder()
                    .withName(user.name)
                    .withEmail(user.email)
                    .build());
            if (createExamineeResponse.responseCode !== 0 || !createExamineeResponse.data) {
                return response;
            }
            user.orgId = createExamineeResponse.data;
        } else if (user.role === "org-admin" ) {
            const createOrgResponse: RepositoryResponse<string> =
                await ExamRepository
                    .addOrganiser(new OrganiserBuilder().withName(user.name).build());
            if (createOrgResponse.responseCode !== 0 || !createOrgResponse.data) {
                return response;
            }
            user.orgId = createOrgResponse.data;
        }
        await UserRepository.addUser(user)
            .then((repoResponse: RepositoryResponse<string>) => {
                response.responseCode = repoResponse.responseCode;
                if (repoResponse.responseCode === 0) {
                    response.data = repoResponse.data;
                }
            })
            .catch((e)=>{
                console.error("Could not add user", e);
            });
        return response;
    },

    searchUserByName: async function(name: string):
        Promise<ServiceResponse<User>> {
        const response: ServiceResponse<User> = {
            responseCode: -1,
        };
        await UserRepository.queryUser(name)
            .then((repoResponse: RepositoryResponse<User>)=>{
                response.responseCode = repoResponse.responseCode;
                if (repoResponse.responseCode === 0) {
                    response.data = repoResponse.data;
                }
            })
            .catch((e)=>{
                console.error("Error searching user", e);
            });
        return response;
    },
};
