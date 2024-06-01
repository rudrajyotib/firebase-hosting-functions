export type CreateOrganiserRequest = {
    name: string
}

export type CreateSyllabusRequest = {
    subject: string,
    duration: number,
    totalMarks: number,
    title: string,
    organiserId: string,
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
