export type Question = {
    questionLines : string[],
    displayFormat : 'Text' | 'textAndImage' | 'image',
    options : string[],
    questionId: string,
    questionIndex: number
}

export type ActiveExamDetails = {
    totalQuestions : number,
    secondsRemaining : number,
    currentQuestionIndex : number
}

export type ExamRequest = {
    userId: string,
    examInstance : string,
    request: 'Initialise' | 'TimeOut' | 'FinalSubmission'
}

export type ExamResponse = {
    responseStatus : 'initialised' | 'failed' | 'notassigned' | 'TimedOut' | 'Submitted',
    activeExamDetails ?: ActiveExamDetails,
    activeQuestion ?: Question
}

export type SubmitAnswerRequest = {
    examInstanceId: string,
    questionId : string,
    selectedOption: number,
    studentId: string,
    questionIndex: number
}

export type SubmitAnswerAndMoveNextResponse = {
    staus: 'Success' | 'Timedout' | 'Failed' | 'AllAnswered',
    allAnswered: boolean,
    nextQuestion?: Question,
    secondsRemaining: number 
}

export type NextQuestionRequest = {
    examId: string
}

export type NextQuestionResponse = {
    questionFound : boolean,
    questionData ?: Question,
    questionIndex : number,
    secondsRemaining : number
}

export type ActiveExams = {
    exams: {id: string, title: string}[]
}

export type ExamResultSummary = {
    totalMarks: number,
    score: number
}