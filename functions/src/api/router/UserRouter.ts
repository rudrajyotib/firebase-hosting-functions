/* eslint-disable max-len */
/* eslint-disable new-cap */
import express = require("express")
import {AddUser, FindUerByName} from "../controller/UserController";
const userRouter = express.Router();

userRouter.post("/add", AddUser);
userRouter.get("/userByName", FindUerByName);

export {userRouter};
