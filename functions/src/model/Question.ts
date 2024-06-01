/* eslint-disable require-jsdoc */
export class Question {
    format: string;
    questionLines : string[];
    options: string[];
    correctOptionIndex : number;
    id: string;
    status: string;
    organiserId: string;
    tags: string[];

    constructor(format: string,
        questionLines: string[],
        options: string[],
        correctOptionIndex: number,
        id: string,
        status: string,
        organiserId: string,
        tags: string[]) {
        this.format = format;
        this.questionLines = questionLines;
        this.options = options;
        this.correctOptionIndex = correctOptionIndex;
        this.id = id;
        this.status = status;
        this.organiserId = organiserId;
        this.tags = tags;
    }

    isValid = (): boolean => {
        console.log("Qeustion to validate", JSON.stringify(this));
        if (
            !this.format ||
            this.format === "" ||
            !this.questionLines ||
            this.questionLines.length <1 ||
            this.questionLines.length > 5 ||
            !this.options ||
            this.options.length < 3 ||
            this.options.length > 5 ||
            !this.correctOptionIndex ||
            this.correctOptionIndex <0 ||
            this.correctOptionIndex >= this.options.length ||
            !this.organiserId ||
            this.organiserId === ""
        ) {
            return false;
        }
        return true;
    };
}

export class QuestionBuilder {
    format= "";
    questionLines: string[]= [];
    options: string[]= [];
    correctOptionIndex= -1;
    id="";
    status= "Active";
    organiserId = "";
    tags: string[] = [];

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

    markInactive = () => {
        this.status = "Inactive";
        return this;
    };

    withOrganiserId = (orgId: string) => {
        this.organiserId = orgId;
        return this;
    };

    withTag = (tag: string) => {
        this.tags.push(tag);
        return this;
    };

    build = ()=>{
        return new Question(
            this.format,
            this.questionLines,
            this.options,
            this.correctOptionIndex,
            this.id,
            this.status,
            this.organiserId,
            this.tags
        );
    };
}

