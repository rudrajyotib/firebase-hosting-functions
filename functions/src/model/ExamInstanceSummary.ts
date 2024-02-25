/* eslint-disable require-jsdoc */
export class ExamInstanceSummary {
    examInstanceId: string;
    status: string;
    examineeId: string;
    subject: string;
    grade: string;
    organiser: string;
    examTitle: string;

    constructor(id: string,
        status: string,
        examineeId: string,
        subject: string,
        grade: string,
        organiser: string,
        examTitle: string) {
        this.examInstanceId = id;
        this.status = status;
        this.subject = subject;
        this.grade = grade;
        this.organiser = organiser;
        this.examineeId =examineeId;
        this.examTitle = examTitle;
    }
}

export class ExamInstanceSummaryBuilder {
    examInstanceId = "";
    status= "";
    examineeId = "";
    subject = "";
    grade = "";
    organiser = "";
    title = "";

    withId = (id: string)=>{
        this.examInstanceId = id;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withExamineeId = (examineeId: string) => {
        this.examineeId = examineeId;
        return this;
    };

    withSubject = (subject: string) => {
        this.subject = subject;
        return this;
    };

    withGrade = (grade: string) => {
        this.grade = grade;
        return this;
    };

    withOrganiser = (organiser: string) => {
        this.organiser = organiser;
        return this;
    };

    withTitle = (title: string) => {
        this.title = title;
        return this;
    };

    build = () => {
        return new ExamInstanceSummary(
            this.examInstanceId,
            this.status,
            this.examineeId,
            this.subject,
            this.grade,
            this.organiser,
            this.title
        );
    };
}
