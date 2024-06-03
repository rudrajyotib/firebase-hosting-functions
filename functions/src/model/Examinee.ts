/* eslint-disable max-len */
/* eslint-disable require-jsdoc */


// eslint-disable-next-line require-jsdoc
export class Examinee {
    id: string;
    name: string;
    email: string;
    status: string;
    assignedExams: {id: string, status: string}[];

    constructor(
        id: string,
        name: string,
        email: string,
        status: string,
        assignedExams : {id: string, status: string}[]) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.status = status;
        this.assignedExams = assignedExams;
    }

    assignExamInstance = (examInstanceId: string) => {
        this.assignedExams.push({id: examInstanceId, status: "Ready"});
    };

    updateAssignedExamStatus = (examInstanceId: string, status: string) => {
        this.assignedExams.filter((exam)=>{
            return exam.id === examInstanceId;
        }).forEach((exam)=>{
            exam.status = status;
        });
    };
}

export class ExamineeBuilder {
    id = "";
    name = "";
    email = "";
    assignedExams: {id: string, status: string}[] = [];
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

    withAssignedExam = (assignedExam: string) =>{
        this.assignedExams.push({id: assignedExam, status: "Ready"});
        return this;
    };

    withAssignedExamAndStatus = (assignedExam: string, status: string) => {
        this.assignedExams.push({id: assignedExam, status: status});
    };

    build = ():Examinee => {
        return new Examinee(this.id, this.name, this.email, this.status, this.assignedExams);
    };
}
