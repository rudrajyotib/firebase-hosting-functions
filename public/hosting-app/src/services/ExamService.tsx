import { ExamResponse, NextQuestionRequest, NextQuestionResponse, SubmitAnswerResponse } from "./types/ExamData"

const ExamService = {

    initialiseExam: (examId: string, successCallback: (response: ExamResponse) => void) => {
        console.log('initialising exam', examId)
        console.log('assuming exam id' + examId + ' initialised')
        successCallback({
            responseStatus: 'initialised',
            activeQuestion: {
                displayFormat: 'textonly',
                questionLines: ['line 1 as initialised', 'line 2 as initialised'],
                questionId: 'Q1',
                options: ['OPT A Q1', 'OPT B Q1', 'OPT C Q1', 'OPT D Q1']
            },
            activeExamDetails: {
                currentQuestionIndex: 1,
                totalQuestions: 20,
                secondsRemaining: 200
            }
        })
    },

    fetchNext: (request: NextQuestionRequest, successCallback: (question: NextQuestionResponse
        ) => void) => {
        console.log('fetching question for exam::' + request.examId)
        console.log('retrieved question::')
        successCallback({
            questionFound: true,
            questionIndex: 2,
            secondsRemaining: 150,
            questionData: {
                displayFormat:'textonly',
                options: ['OPT A Q2','OPT B Q2', 'OPT C Q2'],
                questionId:'q2',
                questionLines: ['Line 1 Next Question', 'Line 2 Next Question', 'Line 3 Next Question']
            }
        })
    },

    submitAnswer: (examId: string, questionId: string, answerIndex: number, successCallback: (response: SubmitAnswerResponse) => void) => {
        console.log('submitting question')
        successCallback({
            nextQuestionAvailable: true,
            submitAnswerSuccess: true
        })
    }
}

export default ExamService