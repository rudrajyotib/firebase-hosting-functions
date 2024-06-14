/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import {Request, Response} from "express";
import {ServiceResponse} from "../../service/data/ServiceResponse";
import {AddUserRequest} from "../interfaces/UserInteractionDto";
import {User, UserBuilder} from "../../model/User";
import {UserService} from "../../service/UserService";


export const AddUser = async (req: Request, res: Response) => {
    const addUserRequest: AddUserRequest = req.body as AddUserRequest;
    const userBuilder: UserBuilder = new UserBuilder();
    userBuilder.withName(addUserRequest.name);
    userBuilder.withEmail(addUserRequest.email);
    userBuilder.withRole(addUserRequest.role);
    const user: User = userBuilder.build();
    if (!user.isValid()) {
        res.status(400).send();
    }
    UserService.addUser(userBuilder.build())
        .then((serviceResponse: ServiceResponse<string>)=>{
            if (serviceResponse.responseCode !== 0) {
                res.status(400).send();
            } else {
                res.status(201).send({
                    userId: serviceResponse.data,
                });
            }
        })
        .catch((e)=>{
            res.status(500).send();
        });
};

export const FindUerByName = async (req: Request, res: Response) => {
    const userName = req.query.userName;
    if (!userName || userName.toString().trim() === "") {
        res.status(400).send();
    }
    UserService
        .searchUserByName(""+userName)
        .then((serviceResponse: ServiceResponse<User>)=>{
            if (serviceResponse.responseCode === 0 && serviceResponse.data) {
                res.status(200).send({
                    userId: serviceResponse.data.id,
                    entityId: serviceResponse.data.orgId,
                });
            } else {
                res.status(404).send();
            }
        })
        .catch((e)=>{
            console.error("Error searching for user by name", e);
            res.status(500).send();
        });
};
