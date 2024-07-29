/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
export class Organiser {
    id: string;
    name: string;
    status: string;
    syllabus: string[];
    exams: string[];
    subjects: string[];
    assignedExaminees: {id: string, name: string}[];

    constructor(id: string,
        name: string,
        status: string,
        syllabus: string[],
        exams: string[],
        subjects: string[],
        examineeIds: {id: string, name: string}[]) {
        this.id = id;
        this.name = name;
        this.syllabus = syllabus;
        this.exams = exams;
        this.status = status;
        this.subjects = subjects;
        this.assignedExaminees = examineeIds;
    }

    assignExamineeId= (examinee: {id: string, name: string} ): boolean => {
        if (this.assignedExaminees.filter((e)=> e.id === examinee.id).length === 0 ) {
            this.assignedExaminees.push(examinee);
            return true;
        }
        return false;
    };
}

export class OrganiserBuilder {
    id= "";
    name= "";
    status= "";
    syllabus: string[] = [];
    exams: string[] = [];
    subjectIds: string[] = [];
    examineeIds: {id: string, name: string}[] = [];

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

    withAssignedExaminee = (examinee: {id: string, name: string}) => {
        if (this.examineeIds.filter((e)=> e.id === examinee.id).length === 0 ) {
            this.examineeIds.push(examinee);
        }
        return this;
    };

    build = () => {
        return new Organiser(
            this.id,
            this.name,
            this.status,
            this.syllabus,
            this.exams,
            this.subjectIds,
            this.examineeIds
        );
    };
}
