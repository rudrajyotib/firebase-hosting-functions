/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class SubjectAndTopicSummary {
    grade: number;
    subject: string;
    topic: string;
    id: string;
    title: string;

    constructor(grade: number,
        subject: string,
        topic: string,
        id: string,
        title: string
    ) {
        this.grade = grade;
        this.subject = subject;
        this.topic = topic;
        this.id = id;
        this.title = title;
    }
}

export class SubjectAndTopicSummaryBuilder {
    grade = -1;
    subject = "";
    topic = "";
    id = "";
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

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withTitle = (title: string) => {
        this.title = title;
        return this;
    };

    build = ():SubjectAndTopicSummary => {
        return new SubjectAndTopicSummary(
            this.grade,
            this.subject,
            this.topic,
            this.id,
            this.title
        );
    };
}
