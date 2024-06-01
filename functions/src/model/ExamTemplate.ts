/* eslint-disable require-jsdoc */
export class ExamTemplate {
    grade: number;
    subject: string;
    syllabusId: string;
    status: string;
    organiserId: string;
    title: string;
    id: string;

    constructor(grade: number,
        subject: string,
        syllabusId: string,
        status: string,
        organiserId: string,
        title: string,
        id: string,
    ) {
        this.grade = grade;
        this.subject = subject;
        this.syllabusId = syllabusId;
        this.status = status;
        this.organiserId = organiserId;
        this.title = title;
        this.id = id;
    }

    isActive= (): boolean=>{
        return this.status === "Active";
    };

    isValid = (): boolean =>{
        if (
            !this.grade ||
            this.grade < 1 ||
            !this.subject ||
            this.subject === "" ||
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

export class ExamTemplateBuilder {
    grade = -1;
    subject= "";
    syllabusId= "";
    status= "Active";
    organiserId= "";
    title= "";
    id= "";

    withId= (id: string)=>{
        this.id = id;
        return this;
    };

    withGrade= (grade: number)=>{
        this.grade = grade;
        return this;
    };

    withSubject= (subject: string)=>{
        this.subject = subject;
        return this;
    };

    withSyllabusId= (syllabusId: string)=>{
        this.syllabusId = syllabusId;
        return this;
    };

    withOrganiserId=(organiserId: string) =>{
        this.organiserId = organiserId;
        return this;
    };

    withTitle=(title: string)=>{
        this.title= title;
        return this;
    };

    withStatus= (status: string) => {
        this.status = status;
        return this;
    };

    build= ()=>{
        return new ExamTemplate(
            this.grade,
            this.subject,
            this.syllabusId,
            this.status,
            this.organiserId,
            this.title,
            this.id
        );
    };
}
