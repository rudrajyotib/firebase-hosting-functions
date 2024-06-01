/* eslint-disable max-len */
// export type Question = {
//     displayFormat: string,
//     questionLines: string[],
//     options: string[],
// }
export type CreateQuestionRequest = {
    format: string;
    questionLines : string[];
    options: string[];
    correctOptionIndex : number;
    organiserId: string;
    tags: string[];
}
export type SubmitAnswerRequest = {
    questionId: string,
    answer: number,
    examInstanceId: string,
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
    questionId: string
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
    allAnswered: boolean,
    nextQuestion?: QuestionWithId,
    secondsRemaining: number
}
export type EvaluateRequest = {
    examineeId: string,
    examInstanceId: string
}
export type ApiEvaluateResponse = {
    evaluationAccepted: boolean,
    evaluationRejectionReason ?: string
}
export type AnswerAttempt = {
    questionId: string,
    correctAnswerIndex: string,
    attemptedAnswerIndex: string
}
export type ExamResultResponse = {
    examineeId: string,
    examInstanceId: string,
    totalMarks: number,
    marksScrore: number,
    answers: AnswerAttempt[]
}
export type CorrelateQuestionAndTopicRequest = {
    questionId: string,
    subjectAndTopicId: string
}

