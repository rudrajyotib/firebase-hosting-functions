export type CreateOrganiserRequest = {
    name: string
}

export type CreateSyllabusRequest = {
    subject: string,
    duration: number,
    totalMarks: number,
    title: string,
    organiserId: string,
    topics?: TopicAndQuestionCountRequest[]
}

export type TopicAndQuestionCountRequest = {
    subjectAndTopicId: string;
    count: number;
    weightage: number;
}


export type AddTopicAndQuestionCountRequest = {
    topics: TopicAndQuestionCountRequest[]
    syllabusId: string
}

export type AddSyllabusIdsToOrganiserRequest = {
    syllabusIds: string[],
    organiserId: string
}


export type AddExamIdsToOrganiserRequest = {
    examIds: string[],
    organiserId: string
}

export type ExamTemplateRequest = {
    grade: number,
    subject: string,
    syllabusId: string,
    organiserId: string,
    title: string
}

export type SubjectAndTopicRequest = {
    grade: number,
    topic: string,
    subject: string,
    organiserId: string,
    title: string
}

export type SubjectsAndTopicsSummaryResponse = {
    grade: number,
    topic: string,
    subject: string,
    id: string,
    title: string
}

export type QuestionSummary = {
    format: string;
    questionLines : string[];
    options: string[];
    correctOptionIndex : number;
    id: string;
    status: string;
    organiserId: string;
}

export type SyllabusSummary = {
    id: string;
    title: string;
    subject: string;
    status: string;
    duration: number;
    totalMarks: number
}

export type ExamTemplateSummary = {
    id: string;
    grade: number;
    subject: string;
    status: string;
    title: string;
    syllabusId: string;
}

export type AssignedExaminee = {
    id: string,
    name: string
}

export type AssignExamineeToOrganiserRequest = {
    organiserId: string,
    examineeId: string,
    examineeName: string
}
