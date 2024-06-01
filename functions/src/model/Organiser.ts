/* eslint-disable require-jsdoc */
export class Organiser {
    id: string;
    name: string;
    status: string;
    syllabus: string[];
    exams: string[];
    subjects: string[];

    constructor(id: string,
        name: string,
        status: string,
        syllabus: string[],
        exams: string[],
        subjects: string[]) {
        this.id = id;
        this.name = name;
        this.syllabus = syllabus;
        this.exams = exams;
        this.status = status;
        this.subjects = subjects;
    }
}

export class OrganiserBuilder {
    id= "";
    name= "";
    status= "";
    syllabus: string[] = [];
    exams: string[] = [];
    subjectIds: string[] = [];

    withId = (id: string) => {
        this.id = id;
        return this;
    };

    withName = (name: string) => {
        this.name = name;
        return this;
    };

    withStatus = (status: string) => {
        this.status = status;
        return this;
    };

    withSyllabusId = (syllabusId: string) => {
        this.syllabus.push(syllabusId);
        return this;
    };

    withExamId = (examId: string) => {
        this.exams.push(examId);
        return this;
    };

    withSubjectId = (subjectId: string) => {
        this.subjectIds.push(subjectId);
        return this;
    };

    build = () => {
        return new Organiser(
            this.id,
            this.name,
            this.status,
            this.syllabus,
            this.exams,
            this.subjectIds
        );
    };
}
