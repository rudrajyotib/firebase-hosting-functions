/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class Syllabus {
    id: string;
    subject: string;
    topicsAndQuestionCounts: TopicAndQuestionCount[];
    totalMarks: number;
    duration: number;
    status: string;
    title: string;
    organiserId: string;

    constructor(id: string,
        subject: string,
        topicsAndQuestionCounts: TopicAndQuestionCount[],
        totalMarks: number,
        duration: number,
        status: string,
        title: string,
        organiserId: string) {
        this.id = id;
        this.subject = subject;
        this.topicsAndQuestionCounts = topicsAndQuestionCounts;
        this.totalMarks = totalMarks;
        this.duration = duration;
        this.status = status;
        this.title = title;
        this.organiserId = organiserId;
    }

    isValid = (): boolean =>{
        if (
            !this.subject ||
            this.subject === "" ||
            !this.duration ||
            this.duration <1 ||
            !this.status ||
            this.status === "" ||
            !this.title ||
            this.title === "" ||
            !this.organiserId ||
            this.organiserId === ""
        ) {
            return false;
        }
        return true;
    };

    updateTotalMarks = () => {
        let totalMarks = 0;
        this.topicsAndQuestionCounts.forEach((topic)=> {
            totalMarks += (topic.count * topic.weightage);
        });
        this.totalMarks = totalMarks;
    };

    addTopics = (topicsAndQuestionCount: TopicAndQuestionCount[]) => {
        const map: Map<string, TopicAndQuestionCount> = new Map();
        this.topicsAndQuestionCounts.forEach((topic)=>{
            if (map.has(topic.subjectAndTopicId) === true ) {
                map.set(topic.subjectAndTopicId, topic);
            }
        });
        topicsAndQuestionCount.forEach((topic)=>{
            if (map.has(topic.subjectAndTopicId) === false ) {
                this.topicsAndQuestionCounts.push(topic);
            }
        });
        this.updateTotalMarks();
    };
}

export class SyllabusBuilder {
    id = "";
    subject = "";
    topicsAndQuestionCounts: TopicAndQuestionCount[] = [];
    totalMarks = 0;
    duration = 0;
    status = "Active";
    organiserId = "";
    title = "";

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withSubject = (subject: string) => {
        this.subject = subject;
        return this;
    };

    withTopicAndQuestionCounts = (topicAndQuestionCount: TopicAndQuestionCount) => {
        this.topicsAndQuestionCounts.push(topicAndQuestionCount);
        this.totalMarks += (topicAndQuestionCount.weightage * topicAndQuestionCount.count);
        return this;
    };

    withDuration = (duration: number) => {
        this.duration = duration;
        return this;
    };

    withStatus = (status: string)=> {
        this.status = status;
        return this;
    };

    withTitle = (title: string) => {
        this.title = title;
        return this;
    };

    withOrganiserId = (organiserId: string) => {
        this.organiserId = organiserId;
        return this;
    };

    build = ()=>{
        if (this.title === "") {
            throw new Error("Cannot create a syllabus without a title");
        }

        return new Syllabus(
            this.id,
            this.subject,
            this.topicsAndQuestionCounts,
            this.totalMarks,
            this.duration,
            this.status,
            this.title,
            this.organiserId
        );
    };
}


export class TopicAndQuestionCount {
    subjectAndTopicId: string;
    count: number;
    weightage: number;

    constructor(subjectAndTopicId: string,
        count: number,
        weightage: number
    ) {
        this.subjectAndTopicId = subjectAndTopicId;
        this.count = count;
        this.weightage = weightage;
    }
}


export class TopicAndQuestionCountBuilder {
    subjectAndTopicId= "";
    count= 0;
    weightage = 0;

    withSubjectAndTopicId = (subjectAndTopicId: string) => {
        this.subjectAndTopicId = subjectAndTopicId;
        return this;
    };

    withCount = (count: number)=> {
        this.count = count;
        return this;
    };

    withWeightage = (weightage: number) => {
        this.weightage = weightage;
        return this;
    };

    build = () => {
        if (this.count < 0 || this.weightage <= 0) {
            throw new Error("Cannot create a topic for syllabus with zero count or weightage");
        }
        return new TopicAndQuestionCount(
            this.subjectAndTopicId,
            this.count,
            this.weightage
        );
    };
}
