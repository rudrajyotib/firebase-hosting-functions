import axios, { AxiosResponse } from "axios"
import {  ActiveExamDetails, ActiveExams, ExamResponse, NextQuestionRequest, NextQuestionResponse, Question, SubmitAnswerRequest, SubmitAnswerResponse } from "./types/domain/ExamData"
import { ActiveExamQueryResponseDefinition, ActiveExamQueryResponseList, ApiSubmitAnswerResponse, QuestionWithIdAndIndex, StartExamResponse, StartResponseBody } from "./types/api/ExamApi"

const ExamService = {

    queryActiveExams: (examineeId: string, successCallback : (response: ActiveExams)=> void) => {
        console.log('querying active exam for student', examineeId)
        axios.get('/api/exams/active?examineeId='+examineeId)
            .then((res:AxiosResponse)=>{
                const activeExams : ActiveExams = {exams:[]}
                if (res.status === 200){
                    if (res.data){
                        const httpResponse: ActiveExamQueryResponseList = res.data
                        if (httpResponse.length > 0){
                         httpResponse.forEach((value: ActiveExamQueryResponseDefinition)=>{
                            activeExams.exams.push({
                                id: value.id,
                                title: value.label
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
        axios.post('/api/exams/start', {examInstanceId: examId, examineeId: studentId}, {
            'headers' : {
                'Accept' : 'application/JSON'
            }
        })
            .then((res: AxiosResponse)=>{
                if (res.status === 200){
                    const data: StartExamResponse = res.data
                    console.log("Start exam service received response::"+JSON.stringify(data));
                    const examStartResponse: ExamResponse = {responseStatus:'initialised'}
                    if (data.responseCode !== 0){
                        examStartResponse.responseStatus = 'failed'
                    }else{
                        const startResponseBody: StartResponseBody = data.data;
                        if (startResponseBody.nextQuestion){
                            const activeQuestion: Question = {
                                displayFormat: startResponseBody.nextQuestion.displayFormat,
                                questionId: startResponseBody.questionId,
                                questionLines: startResponseBody.nextQuestion.questionLines,
                                options: startResponseBody.nextQuestion.options,
                                questionIndex: startResponseBody.questionIndex
                            }
                            examStartResponse.activeQuestion = activeQuestion
                        }
                        const examDetails: ActiveExamDetails = {
                            totalQuestions: startResponseBody.totalQuestions,
                            secondsRemaining: startResponseBody.secondsRemaining,
                            currentQuestionIndex: startResponseBody.questionIndex
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
                displayFormat:'Text',
                options: ['OPT A Q2','OPT B Q2', 'OPT C Q2'],
                questionId:'q2',
                questionLines: ['Line 1 Next Question', 'Line 2 Next Question', 'Line 3 Next Question'],
                questionIndex: 0
            }
        })
    },

    submitAnswer: (answer: SubmitAnswerRequest,  successCallback: (response: SubmitAnswerResponse) => void) => {
        console.log('submitting answer')
        axios.post('/api/exams/answer', {
             examineeId: answer.studentId,
             questionId: answer.questionId, 
             examInstanceId: answer.examInstanceId,
             answer: answer.selectedOption,
             questionIndex: answer.questionIndex},{
            'headers' : {
                'Accept' : 'application/JSON'
            },
            validateStatus: (status:number) =>{
                if (status === 200 || status === 400){
                    return true
                }
                return false
            }
        } ).then((res:AxiosResponse)=>{
            console.log('answer received', res.data)
            if (res.status === 200){
                const responseData: ApiSubmitAnswerResponse = res.data.data
                const submitAnswerResponse: SubmitAnswerResponse = {
                    staus: responseData.allAnswered===true ? 'AllAnswered' : 'Success',
                    allAnswered: responseData.allAnswered,
                    secondsRemaining: responseData.allAnswered ? 0 : responseData.secondsRemaining
                }
                if (responseData.nextQuestion){
                    const nextQuestionResponse: QuestionWithIdAndIndex = responseData.nextQuestion
                    const nextQuestion: Question = {
                        questionLines: nextQuestionResponse.question.questionLines,
                        displayFormat: nextQuestionResponse.question.displayFormat,
                        options: nextQuestionResponse.question.options,
                        questionId: nextQuestionResponse.id,
                        questionIndex: responseData.questionIndex
                    }
                    submitAnswerResponse.nextQuestion = nextQuestion
                }    
                successCallback(submitAnswerResponse)
            }
        }).catch((error)=>{
            console.log('error in submitting', error)
        })
    }
}

export default ExamService