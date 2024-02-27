/* eslint-disable require-jsdoc */
export class Question {
    format: string;
    questionLines : string[];
    options: string[];
    correctOptionIndex : number;
    id: string;

    constructor(format: string,
        questionLines: string[],
        options: string[],
        correctOptionIndex: number,
        id: string) {
        this.format = format;
        this.questionLines = questionLines;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.id = id;
    }
}

export class QuestionBuilder {
    format= "";
    questionLines: string[]= [];
    options: string[]= [];
    correctOptionIndex= -1;
    id="NOT_ASSIGNED";

    withFormat= (format: string) => {
        this.format = format;
        return this;
    };

    withQuestionLine = (questionLine: string) => {
        this.questionLines.push(questionLine);
        return this;
    };

    withOption = (option: string) => {
        this.options.push(option);
        return this;
    };

    withCorrectOptionIndex = (correctOptionIndex: number)=>{
        this.correctOptionIndex = correctOptionIndex;
        return this;
    };

    withId= (id: string) => {
        this.id = id;
        return this;
    };

    build = ()=>{
        return new Question(
            this.format,
            this.questionLines,
            this.options,
            this.correctOptionIndex,
            this.id
        );
    };
}

