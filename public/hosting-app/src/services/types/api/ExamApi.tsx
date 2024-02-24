export type StartExamRequest = {"examId": string, "studentId": string}
export type StartExamResponse = {"responseCode":number,"nextQuestion":ResponseQuestionBody, "totalQuestions":number, "secondsRemaining": number, "questionId": string}
export type ResponseQuestionBody = {"displayFormat": "textonly" | "textAndImage" | "image", "questionLines": string[], "options": string[]}
export type ActiveExamQueryResponseList = ActiveExamQueryResponseDefinition[]
export type ActiveExamQueryResponseDefinition = {"examId": string, "examTitle": string}
export type ApiSubmitAnswerRequest = {"questionId": string, "option": number}
export type ApiSubmitAnswerResponse = {responseCode: number, allAnswered: boolean, nextQuestion?: QuestionWithId, secondsRemaining: number}
export type QuestionWithId = {question: ResponseQuestionBody, id: string}