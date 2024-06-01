/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class SubjectAndTopic {
    grade: number;
    subject: string;
    topic: string;
    questionIds: {id: string, active: boolean}[];
    id: string;
    organiserId: string;
    title: string;

    constructor(
        id: string,
        grade: number,
        subject: string,
        topic: string,
        questionIds: {id: string, active: boolean}[],
        organiserId: string,
        title: string) {
        this.grade =grade;
        this.subject = subject;
        this.topic = topic;
        this.questionIds = questionIds;
        this.id = id;
        this.organiserId = organiserId;
        this.title = title;
    }

    markQuestionAtIndexActive = (index: number) => {
        if (this.questionIds.length >= index) {
            this.questionIds[index].active = true;
        }
    };

    markQuestionAtIndexInActive = (index: number) => {
        if (this.questionIds.length >= index) {
            this.questionIds[index].active = false;
        }
    };

    isValid = ():boolean =>{
        if (!this.grade ||
            this.grade < 1 ||
            !this.subject ||
            this.subject === "" ||
            !this.topic ||
            this.topic === "" ||
            !this.organiserId ||
            this.organiserId === "" ||
            !this.title ||
            this.title === ""
        ) {
            return false;
        }
        return true;
    };
}

export class SubjectAndTopicBuilder {
    grade = -1;
    subject = "";
    topic = "";
    questionIds: {id: string, active: boolean}[] = [];
    id = "";
    organiserId = "";
    title = "";

    withGrade = (grade: number) => {
        this.grade = grade;
        return this;
    };

    withSubject = (subject: string) => {
        this.subject = subject;
        return this;
    };

    withTopic = (topic: string) => {
        this.topic = topic;
        return this;
    };

    withQuestionId = (questionId: string, active: boolean) => {
        this.questionIds.push({id: questionId, active: active});
        return this;
    };

    withActiveQuestionId = (questionId: string) => {
        this.questionIds.push({
            id: questionId,
            active: true,
        });
        return this;
    };

    withOrganiserId = (organiserId: string) => {
        this.organiserId = organiserId;
        return this;
    };

    withExpiredQuestionId = (questionId: string) => {
        this.questionIds.push({
            id: questionId,
            active: false,
        });
        return this;
    };

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withTitle = (title: string) => {
        this.title = title;
        return this;
    };

    build = () => {
        if (this.grade < 0) {
            throw new Error("Cannot create subject and topic with negative grade");
        }
        if (this.subject === "" || this.topic === "") {
            throw new Error("Cannot create subject with empty subject or topic name");
        }
        return new SubjectAndTopic(
            this.id, this.grade, this.subject, this.topic, this.questionIds, this.organiserId, this.title
        );
    };
}
