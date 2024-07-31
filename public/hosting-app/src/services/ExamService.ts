import axios, { AxiosResponse } from "axios"
import {  ActiveExamDetails, ActiveExams, ExamResponse, NextQuestionRequest, NextQuestionResponse, Question, SubmitAnswerRequest, SubmitAnswerAndMoveNextResponse, ExamResultSummary, SubjectAndTopicSummary, AddSubjectAndTopicRequest, QuestionSummary, SingleQuestionRequest, AddSyllabusRequest, SyllabusSummary, SyllabusSummaryResponse, ExamTemplateSummary, ExamTemplateResponse, CreateExamTemplateRequest, AssignedExaminee, AssignExamineeToOrganiserRequest, CreateExamInstanceRequest } from "./types/domain/ExamData"
import { ActiveExamQueryResponseDefinition, ActiveExamQueryResponseList, ApiSubmitAnswerResponse, EvaluationRequest, EvaluationResponse, QuestionWithIdAndIndex, StartExamResponse, StartResponseBody } from "./types/api/ExamApi"
import { QuestionSummaryResponse } from "./types/api/ExamInteractionDto"

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

    submitAnswerAndMoveNext: (answer: SubmitAnswerRequest,  successCallback: (response: SubmitAnswerAndMoveNextResponse) => void) => {
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
                const submitAnswerResponse: SubmitAnswerAndMoveNextResponse = {
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
    },

    evaluate: (request: EvaluationRequest, 
            successCallback: ((evalSummary: ExamResultSummary)=> void),
            failureCallBack: (()=>void)) => {
        console.log('Evaluating exam')
        axios.post("/api/exams/evaluate", 
            request,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if (status === 200 || status === 400){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse) => {
            if (res.status === 200) {
                const evalSummary: EvaluationResponse = res.data
                const examSummary: ExamResultSummary = {
                    totalMarks: evalSummary.totalMarks,
                    score: evalSummary.totalScore
                }
                successCallback(examSummary)
            } else {
                failureCallBack();
            }
        }).catch((e)=>{
            failureCallBack();
        })
    },

    listOfSubjectsAndTopics: (organiserId: string,
        successCallback: ((subjectsAndTopics: SubjectAndTopicSummary[]) => void),
        failureCallBack: (()=>void) ) => {
            axios.get("/api/org/subjects?orgId="+organiserId,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if (status === 200 || status === 400){
                        return true
                    }
                    return false
                }
            }
            ).then((res: AxiosResponse) => {
                if (res.status === 200) {
                    const summaryLines: SubjectAndTopicSummary[] = res.data;
                    successCallback(summaryLines);
                }else {
                    failureCallBack();
                }
            })
            .catch((e)=>{
                console.error("Error in http controller", e);
                failureCallBack();
            })
        },

    addSubjectAndTopic: (addSubjectRequest: AddSubjectAndTopicRequest,
        successCallback: ()=>void,
        failureCallBack: ()=>void ) => {
            axios.post("/api/org/addsubjectandtopic", 
                addSubjectRequest, 
                {
                    'headers' : {
                        'Accept' : 'application/JSON'
                    },
                    validateStatus: (status:number) =>{
                        if (status === 200 || status === 400){
                            return true
                        }
                        return false
                    }
                }
            ).then((res: AxiosResponse)=>{
                successCallback()
            }).catch(()=>{
                failureCallBack()
            })
        },
    
    listQuestionsByOrgIdAndTopic: (orgId: string, 
        topicId: string,
        successCallback:(questions: QuestionSummary[])=>void,
        failureCallBack:() => void) =>{
            let queryParam = '?organiserId='+orgId
            if (topicId.trim() !== '') {
                queryParam = queryParam + "&topicId=" + topicId
            }
            axios.get("/api/org/questionsbyorganiserandtopic"+queryParam,
                {
                    'headers' : {
                        'Accept' : 'application/JSON'
                    },
                    validateStatus: (status:number) =>{
                        if (status === 200 ){
                            return true
                        }
                        return false
                    }
                }
            ).then ((res:AxiosResponse)=>{
                const questionSummaryRes: QuestionSummaryResponse[] = res.data
                const questionSummary: QuestionSummary[] = []
                questionSummaryRes.forEach((q)=>{
                    questionSummary.push({
                        format: q.format,
                        id: q.id,
                        status: q.status, 
                        options: q.options,
                        questionLines: q.questionLines,
                        organiserId: orgId,
                        correctOptionIndex: q.correctOptionIndex
                    })
                })
                successCallback(questionSummary)
            })
            .catch(()=>{
                failureCallBack();
            })
        },
    
    addSingleQuestion: (singleQuestionRequest: SingleQuestionRequest,
        successCallback: ()=>void,
        failureCallBack:()=>void ) =>{
            axios.post("/api/org/addquestion", 
                singleQuestionRequest, 
                {
                    'headers' : {
                        'Accept' : 'application/JSON'
                    },
                    validateStatus: (status:number) =>{
                        if (status === 200 || status === 400 || status === 201){
                            return true
                        }
                        return false
                    }
                }
            ).then((res: AxiosResponse)=>{
                successCallback()
            }).catch(()=>{
                failureCallBack()
            })
        },
    addSingleQuestionWithTopic: (singleQuestionRequest: SingleQuestionRequest,
            successCallback: ()=>void,
            failureCallBack:()=>void ) =>{
                axios.post("/api/org/addquestionwithtopic", 
                    singleQuestionRequest, 
                    {
                        'headers' : {
                            'Accept' : 'application/JSON'
                        },
                        validateStatus: (status:number) =>{
                            if (status === 200 || status === 400 || status === 201){
                                return true
                            }
                            return false
                        }
                    }
                ).then((res: AxiosResponse)=>{
                    successCallback()
                }).catch(()=>{
                    failureCallBack()
                })
            },
    
    addSyllabus: (addSyllabusRequest: AddSyllabusRequest,
        successCallback:()=>void,
        failureCallBack:()=>void
    ) => {
        axios.post("/api/org/addsyllabus",
            addSyllabusRequest,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 201){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            successCallback();
        }).catch((e)=>{
            failureCallBack();
        })
    } ,
    listSyllabus: (orgId: string,
        successCallback:(syllabusSummaryList: SyllabusSummary[])=>void,
        failureCallBack:()=>void
    ) => {
        let queryParam = '?organiserId='+orgId
        axios.get("/api/org/syllabusbyorganiser"+queryParam,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 200){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            const syllabusSummaryResponse: SyllabusSummaryResponse[] = res.data
            const syllabusSummaryList: SyllabusSummary[] = []
            syllabusSummaryResponse.forEach((s)=>{
                syllabusSummaryList.push({
                    id: s.id,
                    subject: s.subject,
                    duration: s.duration,
                    totalMarks: s.totalMarks,
                    status: s.status,
                    title: s.title
                })
            })
            successCallback(syllabusSummaryList);
        }).catch((e)=>{
            failureCallBack();
        })
    },
    listExamTemplate: (orgId: string,
        successCallback:(examTemplateSummaryList: ExamTemplateSummary[])=>void,
        failureCallBack:()=>void
    ) => {
        let queryParam = '?organiserId='+orgId
        axios.get("/api/org/examsbyorganiser"+queryParam,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 200){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            const syllabusSummaryResponse: ExamTemplateResponse[] = res.data
            const syllabusSummaryList: ExamTemplateSummary[] = []
            syllabusSummaryResponse.forEach((s)=>{
                syllabusSummaryList.push({
                    id: s.id,
                    subject: s.subject,
                    status: s.status,
                    title: s.title,
                    grade: s.grade,
                    syllabusId: s.syllabusId
                })
            })
            successCallback(syllabusSummaryList);
        }).catch((e)=>{
            failureCallBack();
        })
    }  ,
    addExamTemplate : (examTemplateCreateRequest : CreateExamTemplateRequest,
        successCallback: (examTemplateId: string)=>void,
        failureCallback: ()=>void
    ) => {
        axios.post("/api/org/addexamtemplate",
            examTemplateCreateRequest,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 201){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            const examTemplateRes: {examTemplateId: string} = res.data
            successCallback(examTemplateRes.examTemplateId);
        }).catch((e)=>{
            failureCallback();
        })
    },
    listAssignedExaminees: (organiserId: string,
        successCallback: (examinees: AssignedExaminee[])=>void,
        failureCallBack: () => void
    ) => {
        let queryParam = '?organiserId='+organiserId
        axios.get("/api/org/listassignedexaminees"+queryParam,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 200){
                        return true
                    }
                    return false
                }
            })
            .then((res: AxiosResponse)=>{
                const examinees: AssignedExaminee[] = res.data;
                successCallback(examinees)
            })
            .catch((e) => {
                failureCallBack()
            })
    },
    assignExaminee: (addExamineeRequest: AssignExamineeToOrganiserRequest,
        successCallback: () => void,
        failureCallback: () => void
    ) => {
        axios.post("/api/org/assignexaminee",
            addExamineeRequest,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 201){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            successCallback();
        }).catch((e)=>{
            failureCallback();
        })
    },
    assignExam: (createExamInstanceRequest: CreateExamInstanceRequest,
        successCallback: () => void,
        failureCallback: () => void
    ) => {
        axios.post("/api/org/createexaminstance",
            createExamInstanceRequest,
            {
                'headers' : {
                    'Accept' : 'application/JSON'
                },
                validateStatus: (status:number) =>{
                    if ( status === 201){
                        return true
                    }
                    return false
                }
            }
        ).then((res: AxiosResponse)=>{
            successCallback();
        }).catch((e)=>{
            failureCallback();
        })
    }
       
    

}

export default ExamService