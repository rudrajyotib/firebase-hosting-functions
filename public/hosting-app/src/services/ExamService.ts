import axios, { AxiosResponse } from "axios"
import {  ActiveExamDetails, ActiveExams, ExamResponse, NextQuestionRequest, NextQuestionResponse, Question, SubmitAnswerResponse } from "./types/domain/ExamData"
import { ActiveExamQueryResponseDefinition, ActiveExamQueryResponseList, StartExamResponse } from "./types/api/ExamApi"

const ExamService = {

    queryActiveExams: (studentId: string, successCallback : (response: ActiveExams)=> void) => {
        console.log('querying active exam for student', studentId)
        axios.get('/api/exams/active?studentId=student1')
            .then((res:AxiosResponse)=>{
                const activeExams : ActiveExams = {exams:[]}
                if (res.status === 200){
                    if (res.data){
                        const httpResponse: ActiveExamQueryResponseList = res.data
                        if (httpResponse.length > 0){
                         httpResponse.forEach((value: ActiveExamQueryResponseDefinition)=>{
                            activeExams.exams.push({
                                id: value.examId,
                                title: value.examTitle
                            })
                         })
                        }
                    }
                }
                successCallback(activeExams)
            })
            .catch((res)=>{
                
            })
    } ,

    initialiseExam: (examId: string, studentId: string, successCallback: (response: ExamResponse) => void) => {
        console.log('initialising exam', examId)
        console.log('assuming exam id' + examId + ' initialised')
        axios.post('/api/exams/start', {examId: examId, studentId: studentId}, {
            'headers' : {
                'Accept' : 'application/JSON'
            }
        })
            .then((res: AxiosResponse)=>{
                if (res.status === 200){
                    const data: StartExamResponse = res.data
                    const examStartResponse: ExamResponse = {responseStatus:'initialised'}
                    if (data.responseCode !== 0){
                        examStartResponse.responseStatus = 'failed'
                    }else{
                        if (data.nextQuestion){
                            const activeQuestion: Question = {
                                displayFormat: data.nextQuestion.displayFormat,
                                questionId: data.questionId,
                                questionLines: data.nextQuestion.questionLines,
                                options: data.nextQuestion.options
                            }
                            examStartResponse.activeQuestion = activeQuestion
                        }
                        const examDetails: ActiveExamDetails = {
                            totalQuestions: data.totalQuestions,
                            secondsRemaining: data.secondsRemaining,
                            currentQuestionIndex: 1
                        }
                        examStartResponse.activeExamDetails = examDetails
                    }
                    console.log('Start exam::', JSON.stringify(examStartResponse))
                    successCallback(examStartResponse)
                    return
                }
            })
            .catch((res)=>{
                console.log('Exam start service failed')
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