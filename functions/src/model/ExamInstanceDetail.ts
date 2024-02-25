
/* eslint-disable require-jsdoc */
export class ExamInstanceDetail {
    id: string;
    examineeId: string;
    subject: string;
    grade: string;
    template: string;
    questions: string[];
    secondsRemaining: number;

    constructor(id: string,
        examineeId: string,
        subject: string,
        grade: string,
        template: string,
        questions: string[],
        secondsRemaining: number) {
        this.id = id;
        this.examineeId = examineeId;
        this.subject = subject;
        this.grade = grade;
        this.template = template;
        this.questions = questions;
        this.secondsRemaining = secondsRemaining;
    }
}

export class ExamInstanceDetailBuilder {
    id = "";
    examineeId = "";
    subject = "";
    grade = "";
    template = "";
    questions: string[] = [];
    secondsRemaining = 0;

    withId = (id:string) => {
        this.id = id;
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

    withTemplate = (template: string) => {
        this.template = template;
        return this;
    };

    withQuestion = (question: string) => {
        this.questions.push(question);
        return this;
    };

    withSecondsRemaining = (secondsRemaining: number) => {
        this.secondsRemaining = secondsRemaining;
        return this;
    };

    build = () => new ExamInstanceDetail(this.id,
        this.examineeId,
        this.subject,
        this.grade,
        this.template,
        this.questions,
        this.secondsRemaining);
}
