/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class ExamInstanceDetail {
    id: string;
    examineeId: string;
    subject: string;
    grade: string;
    template: string;
    questions: string[];
    answers: number[];
    examTitle: string;
    organiser: string;
    startTime?: Date;
    status: string;
    totalQuestions: number;
    currentQuestionIndex: number;
    duration: number;
    examResultId: string;

    constructor(id: string,
        examineeId: string,
        subject: string,
        grade: string,
        template: string,
        questions: string[],
        answers: number[],
        examTitle: string,
        organiser: string,
        status: string,
        duration: number,
        totalQuestions: number,
        currentQuestionIndex: number,
        examResultId: string,
        startTime?: Date ) {
        this.id = id;
        this.examineeId = examineeId;
        this.subject = subject;
        this.grade = grade;
        this.template = template;
        this.questions = questions;
        this.answers = answers;
        this.examTitle = examTitle;
        this.organiser = organiser;
        this.startTime = startTime;
        this.status = status;
        this.totalQuestions = totalQuestions;
        this.currentQuestionIndex = currentQuestionIndex;
        this.duration = duration;
        this.examResultId = examResultId;
    }

    getSecondsRemaining = ()=>{
        if (this.status === "InProgress" && this.startTime) {
            const passedSeconds = (new Date().getUTCSeconds() - this.startTime.getUTCSeconds());
            return this.duration - passedSeconds;
        }
        return -1;
    };

    setInProgress = () => {
        if (this.status === "Ready") {
            this.status = "InProgress";
            this.startTime = new Date();
            this.currentQuestionIndex = 0;
        }
    };

    isInProgress = () => {
        return (this.status === "InProgress" && this.getSecondsRemaining() > 0);
    };

    isExamOver = () => {
        return (this.status === "AllAnswered" || this.getSecondsRemaining()<0 );
    };

    moveToNetQuestion = (): boolean =>{
        if (!this.isExamOver) {
            if (this.currentQuestionIndex < (this.totalQuestions - 1)) {
                ++this.currentQuestionIndex;
                return true;
            }
        }
        return false;
    };

    isAtLastQuestion = (): boolean =>{
        return this.currentQuestionIndex === (this.questions.length - 1);
    };

    recordAnswerAndmoveToNextQuestion = (questionId: string, answerOption: number, questionIndex: number): boolean =>{
        if (answerOption < 0 ) {
            return false;
        }
        if (questionIndex < 0) {
            return false;
        }
        if (questionIndex>=this.questions.length) {
            return false;
        }
        if (this.questions[questionIndex] !== questionId) {
            return false;
        }
        if (!this.isExamOver()) {
            if (this.questions[this.currentQuestionIndex] !== questionId) {
                return false;
            }
            this.answers[this.currentQuestionIndex] = answerOption;
            if (this.currentQuestionIndex < (this.questions.length - 1)) {
                ++this.currentQuestionIndex;
            }
            return true;
        }
        return false;
    };
}

export class ExamInstanceDetailBuilder {
    id = "";
    examineeId = "";
    subject = "";
    grade = "";
    template = "";
    questions: string[] = [];
    answers: number[] = [];
    examTitle = "";
    organiser = "";
    startTime?: Date;
    status = "";
    totalQuestions = 0;
    currentQuestionIndex = -1;
    duration = -1;
    examResultId = "";

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

    withAnswer = (answer: number) => {
        this.answers.push(answer);
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

    withExamResultId = (examResultId: string) => {
        this.examResultId = examResultId;
        return this;
    };

    build = () => new ExamInstanceDetail(this.id,
        this.examineeId,
        this.subject,
        this.grade,
        this.template,
        this.questions,
        this.answers,
        this.examTitle,
        this.organiser,
        this.status,
        this.duration,
        this.totalQuestions,
        this.currentQuestionIndex,
        this.examResultId,
        this.startTime);
}

