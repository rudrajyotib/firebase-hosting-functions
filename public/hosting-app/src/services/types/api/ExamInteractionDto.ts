/* eslint-disable max-len */
export type Question = {
    displayFormat: string,
    questionLines: string[],
    options: string[],
    questionId: string,
}

export type SubmitAnswerRequest = {
    questionId: string,
    answer: number,
    examId: string,
    examineeId: string
}
export type StartExamRequest = {
    examId: string,
    studentId: string
}
export type StartExamResponse = {
    nextQuestion: ResponseQuestionBody,
    totalQuestions: number,
    secondsRemaining: number,
    questionId: string,
    questionIndex: number,
}
export type ResponseQuestionBody = {
    displayFormat: string,
    questionLines: string[],
    options: string[]
}
export type ActiveExamQueryResponseList = ActiveExamQueryResponseDefinition[]
export type ActiveExamQueryResponseDefinition = {
    id: string
    examineeId: string
    label: string
    status: string
    organiser: string
}
export type ApiSubmitAnswerRequest = {
    questionId: string,
    option: number
}
export type QuestionWithId = {
    question: ResponseQuestionBody,
    id: string
}
export type ApiSubmitAnswerResponse = {
    responseCode: number,
    allAnswered: boolean,
    nextQuestion?: QuestionWithId,
    secondsRemaining: number
}

export type SubjectsAndTopicsSummaryResponse = {
    grade: number,
    topic: string,
    subject: string,
    id: string,
    title: string
}

