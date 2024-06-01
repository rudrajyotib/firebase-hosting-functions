/* eslint-disable require-jsdoc */
export class ExamResult {
    id: string;
    score: number;
    totalMarks: number;
    questionsAndAnswers: AnswerRecord[];
    status: string;

    constructor(
        id: string,
        score: number,
        totalMarks: number,
        questionAndAnswers: AnswerRecord[],
        status: string
    ) {
        this.id = id;
        this.score = score;
        this.totalMarks = totalMarks;
        this.questionsAndAnswers = questionAndAnswers;
        this.status = status;
    }

    createQuestionAnswerMapArray = () =>{
        if (this.questionsAndAnswers.length > 0 ) {
            const convertedQuestions =
                this.questionsAndAnswers.map((questionAnswer)=>{
                    const map = new Map<string, string>();
                    map.set("QId", questionAnswer.questionId);
                    return map;
                });
            return convertedQuestions;
        }
        return [];
    };

    evaluate = () =>{
        let tempScore = 0;
        this.questionsAndAnswers.forEach((value)=>{
            if (value.givenAnswerIndex >= 0 &&
                value.status === "Answered" &&
                value.givenAnswerIndex===value.correctAnswerIndex) {
                tempScore = tempScore + value.weightage;
            }
        });
        this.score = tempScore;
        this.status = "Evaluated";
    };
}

export class AnswerRecord {
    correctAnswerIndex: number;
    givenAnswerIndex: number;
    weightage: number;
    status: string;
    questionId: string;

    constructor(
        correctAnswerIndex: number,
        givenAnswerIndex:number,
        weightage: number,
        status: string,
        questionId: string
    ) {
        this.correctAnswerIndex = correctAnswerIndex;
        this.givenAnswerIndex = givenAnswerIndex;
        this.weightage = weightage;
        this.status = status;
        this.questionId = questionId;
    }
}

export class AnswerRecordBuilder {
    correctAnswerIndex = -1;
    givenAnswerIndex = -1;
    weightage = 0;
    status = "NotAnswered";
    questionId = "";


    withCorrectAnswerIndex = (correctAnswerIndex: number) => {
        this.correctAnswerIndex = correctAnswerIndex;
        return this;
    };

    withGivenAnswerIndex = (givenAnswerIndex: number) => {
        this.givenAnswerIndex = givenAnswerIndex;
        return this;
    };

    withWeightage = (weightage: number) => {
        this.weightage = weightage;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withQuestionId = (qId: string) => {
        this.questionId = qId;
        return this;
    };

    build = () =>{
        return new AnswerRecord(
            this.correctAnswerIndex,
            this.givenAnswerIndex,
            this.weightage,
            this.status,
            this.questionId);
    };
}

export class ExamResultBuilder {
    id= "";
    score= -1;
    totalMarks= -1;
    questionsAndAnswers= <AnswerRecord[]>[];
    status= "Ready";

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withScore = (score: number) => {
        this.score = score;
        return this;
    };

    withTotalMarks= (totalMarks: number)=>{
        this.totalMarks = totalMarks;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withQuestionAnswer = ( answer: AnswerRecord) =>{
        this.questionsAndAnswers.push(answer);
        return this;
    };

    build = () =>{
        return new ExamResult(
            this.id,
            this.score,
            this.totalMarks,
            this.questionsAndAnswers,
            this.status
        );
    };
}
