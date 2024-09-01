/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
import dayjs = require("dayjs");
import {Question} from "./Question";

export class ExamInstanceState {
    examInstanceId: string;
    examineeId: string;
    status: string;
    duration: number;
    totalQuestions: number;
    currentQuestionIndex?: number;
    nextQuestion?: Question;
    startTime?: Date;


    constructor(examInstanceId: string,
        examineeId: string,
        status: string,
        duration: number,
        totalQuestions: number,
        currentQuestionIndex: number,
        nextQuestion?: Question,
        startTime?: Date
    ) {
        this.examInstanceId = examInstanceId;
        this.examineeId = examineeId;
        this.status = status;
        this.duration = duration;
        this.totalQuestions = totalQuestions;
        this.currentQuestionIndex = currentQuestionIndex;
        this.nextQuestion = nextQuestion;
        this.startTime = startTime;
    }

    isInProgress = () => {
        return this.status === "InProgress";
    };

    getRemainingSeconds = () => {
        if (this.status !== "InProgress") {
            return -1;
        }
        if (this.startTime) {
            const dayNow: dayjs.Dayjs = dayjs();
            const dayStart = dayjs(this.startTime);
            const diffInSeconds = Math.abs(dayNow.diff(dayStart, "seconds"));
            return this.duration - diffInSeconds;
        }
        return -1;
    };

    isLastQuestion = () => {
        return this.currentQuestionIndex === (this.totalQuestions - 1);
    };

    isAllAnswered = () => {
        return this.status === "AllAnswered";
    };

    getCurrentQuestionIndex = (): number => {
        if (this.currentQuestionIndex !== undefined) {
            return this.currentQuestionIndex;
        }
        return -1;
    };
}

export class ExamInstanceStateBuilder {
    examInstanceId = "";
    examineeId = "";
    status = "";
    duration = 0;
    totalQuestions = 0;
    currentQuestionIndex= -1;
    nextQuestion?: Question;
    startTime?: Date;

    withExamInstanceId = (examInstanceId: string) => {
        this.examInstanceId = examInstanceId;
        return this;
    };

    withExamineeId = (examineeId: string) => {
        this.examineeId = examineeId;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withDuration = (duration: number) => {
        this.duration = duration;
        return this;
    };

    withTotalQuestions = (totalQuestions: number) => {
        this.totalQuestions = totalQuestions;
        return this;
    };

    withCurrentQuestionIndex = (currentQuestionIndex: number) => {
        this.currentQuestionIndex = currentQuestionIndex;
        return this;
    };

    withNextQuestion = (nextQuestion: Question) => {
        this.nextQuestion = nextQuestion;
        return this;
    };

    withStartTime = (startTime: Date) => {
        this.startTime = startTime;
        return this;
    };

    build = () => {
        return new ExamInstanceState(
            this.examInstanceId,
            this.examineeId,
            this.status,
            this.duration,
            this.totalQuestions,
            this.currentQuestionIndex,
            this.nextQuestion,
            this.startTime
        );
    };
}
