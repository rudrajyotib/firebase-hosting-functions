/* eslint-disable max-len */
/* eslint-disable require-jsdoc */

import {ExamInstanceDetail} from "./ExamInstanceDetail";

// eslint-disable-next-line require-jsdoc
export class Examinee {
    id: string;
    name: string;
    email: string;
    status: string;
    assignedExams?: ExamInstanceDetail[];

    constructor(
        id: string,
        name: string,
        email: string,
        status: string,
        assignedExams ?: ExamInstanceDetail[]) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.status = status;
        this.assignedExams = assignedExams;
    }
}

export class ExamineeBuilder {
    id = "";
    name = "";
    email = "";
    assignedExams: ExamInstanceDetail[] = [];
    status = "";

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withName = (name: string) => {
        this.name = name;
        return this;
    };

    withEmail = (email: string) => {
        this.email = email;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withAssignedExam = (assignedExam: ExamInstanceDetail) =>{
        this.assignedExams.push(assignedExam);
        return this;
    };

    build = ():Examinee => {
        return new Examinee(this.id, this.name, this.email, this.status, this.assignedExams);
    };
}
