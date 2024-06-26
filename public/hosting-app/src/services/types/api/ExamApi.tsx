export type StartExamRequest = {"examId": string, "studentId": string}
export type StartExamResponse = {"responseCode":number, "data": StartResponseBody}
export type StartResponseBody = {"nextQuestion":ResponseQuestionBody, "totalQuestions":number, "secondsRemaining": number, "questionId": string, questionIndex: number}
export type ResponseQuestionBody = {"displayFormat": "Text" | "textAndImage" | "image", "questionLines": string[], "options": string[],questionId:string}
export type ActiveExamQueryResponseList = ActiveExamQueryResponseDefinition[]
export type ActiveExamQueryResponseDefinition = {id: string
    examineeId: string
    label: string
    status : "attempted" | "ready" | "complete"
    organiser: string}
export type ApiSubmitAnswerRequest = {"questionId": string, "option": number}
export type ApiSubmitAnswerResponse = {responseCode: number, allAnswered: boolean, nextQuestion?: QuestionWithIdAndIndex, secondsRemaining: number, questionIndex: number}
export type QuestionWithIdAndIndex = {question: ResponseQuestionBody, id: string}
export type EvaluationRequest = {examineeId: string, examInstanceId: string}
export type EvaluationResponse = {examineeId: string, examInstanceId: string, totalMarks: number, totalScore: number}