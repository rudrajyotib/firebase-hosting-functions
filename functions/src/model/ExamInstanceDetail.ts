/* eslint-disable max-len */

/* eslint-disable require-jsdoc */
export class ExamInstanceDetail {
    id: string;
    examineeId: string;
    subject: string;
    grade: string;
    template: string;
    questions: string[];
    // secondsRemaining: number;
    examTitle: string;
    organiser: string;
    startTime?: Date;
    status: string;
    totalQuestions: number;
    currentQuestionIndex: number;
    duration: number;

    constructor(id: string,
        examineeId: string,
        subject: string,
        grade: string,
        template: string,
        questions: string[],
        // secondsRemaining: number,
        examTitle: string,
        organiser: string,
        status: string,
        duration: number,
        totalQuestions: number,
        currentQuestionIndex: number,
        startTime?: Date ) {
        this.id = id;
        this.examineeId = examineeId;
        this.subject = subject;
        this.grade = grade;
        this.template = template;
        this.questions = questions;
        // this.secondsRemaining = secondsRemaining;
        this.examTitle = examTitle;
        this.organiser = organiser;
        this.startTime = startTime;
        this.status = status;
        this.totalQuestions = totalQuestions;
        this.currentQuestionIndex = currentQuestionIndex;
        this.duration = duration;
    }

    getSecondsRemaining = ()=>{
        if (this.status === "inProgress" && this.startTime) {
            const passedSeconds = (new Date().getUTCSeconds() - this.startTime.getUTCSeconds());
            return this.duration - passedSeconds;
        }
        return -1;
    };

    setInProgress = () => {
        if (this.status === "ready") {
            this.status = "InProgress";
            this.startTime = new Date();
            this.currentQuestionIndex = 0;
        }
    };
}

export class ExamInstanceDetailBuilder {
    id = "";
    examineeId = "";
    subject = "";
    grade = "";
    template = "";
    questions: string[] = [];
    // secondsRemaining = 0;
    examTitle = "";
    organiser = "";
    startTime?: Date;
    status = "";
    totalQuestions = 0;
    currentQuestionIndex = -1;
    duration = -1;

    withId = (id:string) => {
        this.id = id;
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

    withTemplate = (template: string) => {
        this.template = template;
        return this;
    };

    withQuestion = (question: string) => {
        this.questions.push(question);
        return this;
    };

    // withSecondsRemaining = (secondsRemaining: number) => {
    //     this.secondsRemaining = secondsRemaining;
    //     return this;
    // };

    withExamTitle = (examTitle: string) => {
        this.examTitle = examTitle;
        return this;
    };

    withOrganiser = (organiser: string) => {
        this.organiser = organiser;
        return this;
    };

    withStartTime = (startTime: Date) => {
        this.startTime = startTime;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withTotalQuestions = (totalQuestions: number) => {
        this.totalQuestions = totalQuestions;
        return this;
    };

    withCurrentQuestionIndex = (currentQuestionIndex : number) => {
        this.currentQuestionIndex = currentQuestionIndex;
        return this;
    };

    withDuration = (duration: number) => {
        this.duration = duration;
        return this;
    };

    build = () => new ExamInstanceDetail(this.id,
        this.examineeId,
        this.subject,
        this.grade,
        this.template,
        this.questions,
        // this.secondsRemaining,
        this.examTitle,
        this.organiser,
        this.status,
        this.duration,
        this.totalQuestions,
        this.currentQuestionIndex,
        this.startTime);
}

