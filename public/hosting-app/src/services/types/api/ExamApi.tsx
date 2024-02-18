export type StartExamRequest = {"examId": string, "studentId": string}
export type StartExamResponse = {"responseCode":number,"nextQuestion":ResponseQuestionBody, "totalQuestions":number, "secondsRemaining": number, "questionId": string}
export type ResponseQuestionBody = {"displayFormat": "textonly" | "textAndImage" | "image", "questionLines": string[], "options": string[]}
export type ActiveExamQueryResponseList = ActiveExamQueryResponseDefinition[]
export type ActiveExamQueryResponseDefinition = {"examId": string, "examTitle": string}