import { useEffect, useRef, useState } from "react";
import ExamService from "../../../services/ExamService";
import { ExamResponse, Question, SubmitAnswerRequest, SubmitAnswerAndMoveNextResponse } from "../../../services/types/domain/ExamData";
import TimedQuestionAnswerInteraction from "./console/TimedQuestionAnswerInteraction";
import { useNavigate, useParams } from "react-router-dom";
import AllQuestionsAnswered from "./AllQuestionsAnswered";
import TimeOut from "./TimeOut";

interface ExamState {
    totalQuestions: number,
    questionIndex: number,
    state: 'active' | 'submitting' | 'fetching' | 'timedout' | 'initialising' | 'finalAnswerSubmitted' | 'initialiseFailed' | 'failedToLoad',
    secondsRemaining: number,
    examId: string
}

interface QuestionDisplay {
    questionLines: string[],
    options: { value: string, label: string }[],
    questionId: string,
    selectedOption: number
}


const ActiveExam = () => {

    const navigate = useNavigate()


    let examId = useRef(useParams()['examId']).current;
    const examineeId = localStorage.getItem('entityId')
    const examStarted = useRef(false);

    const [examState, setExamState] = useState<ExamState>({
        totalQuestions: 0,
        questionIndex: 0,
        state: 'initialising',
        secondsRemaining: 20,
        examId: examId ? examId : '',
    }
    )

    const [questionDisplay, setQuestionDisplay] = useState<QuestionDisplay>({
        questionLines: [],
        options: [],
        questionId: '',
        selectedOption: -1
    })

    useEffect(() => {
        console.log('useEffect in action:', examState.state)
        if (examStarted.current === true) {
            return;
        }
        examStarted.current = true;
        localStorage.setItem('examInstanceId', examState.examId)
        if (examState.state === 'initialising' && examineeId && examineeId !== "" ) {
            console.log('question state is initialising')

            ExamService.initialiseExam(examState.examId, examineeId, (response: ExamResponse) => {
                console.log('Exam component on start::', JSON.stringify(response))
                if (response.responseStatus !== 'initialised') {
                    setExamState((presentState: ExamState) => {
                        const newState: ExamState = { ...presentState }
                        newState.state = 'initialiseFailed'
                        return newState
                    })
                    return
                }
                console.log('Exam component on start::initialised')
                if (!(response.activeExamDetails && response.activeQuestion)) {
                    setExamState((presentState: ExamState) => {
                        const newState: ExamState = { ...presentState }
                        newState.state = 'failedToLoad'
                        return newState
                    })
                    return
                }
                console.log('Exam component on start::initialised with question')
                setExamState((presentState: ExamState) => {
                    const newState: ExamState = { ...presentState }
                    newState.state = 'active'
                    if (response.activeExamDetails) {
                        newState.questionIndex = response.activeExamDetails.currentQuestionIndex
                        newState.secondsRemaining = response.activeExamDetails.secondsRemaining
                        newState.totalQuestions = response.activeExamDetails.totalQuestions
                    }
                    return newState
                })


                setQuestionDisplay((presentState: QuestionDisplay) => {
                    const newState = { ...presentState }
                    if (response.activeQuestion) {
                        newState.questionId = response.activeQuestion.questionId
                        newState.questionLines = response.activeQuestion.questionLines
                        newState.options = response.activeQuestion.options.map((value: string, index: number) => {
                            return { value: '' + index, label: value }
                        })
                    }
                    return newState
                })

            })
            return
        }

    })


    const submitHandler = (option: number) => {
        setExamState((currentState: ExamState) => {
            const newState: ExamState = { ...currentState }
            newState.state = 'submitting'
            return newState
        })
        const submitAnswerRequest: SubmitAnswerRequest = {
            examInstanceId: examState.examId,
            questionId: questionDisplay.questionId,
            studentId: examineeId ? examineeId : '',
            selectedOption: option,
            questionIndex: examState.questionIndex
        }
        ExamService.submitAnswerAndMoveNext(submitAnswerRequest,
            (response: SubmitAnswerAndMoveNextResponse) => {
                if (response.staus === 'Success' && response.nextQuestion){
                    const nextQuestion: Question = response.nextQuestion
                    setQuestionDisplay({
                        questionLines:nextQuestion.questionLines,
                        options: nextQuestion.options.map((value: string, index: number) => {
                            return { value: '' + index, label: value }
                        }),
                        questionId: nextQuestion.questionId,
                        selectedOption: -1
                    })
                    setExamState((currentState: ExamState) => {
                        const newState: ExamState = { ...currentState }
                        newState.state = 'active'
                        newState.secondsRemaining = response.secondsRemaining
                        newState.questionIndex = response.nextQuestion? response.nextQuestion.questionIndex: -1
                        return newState
                    })
                }else if (response.staus === 'AllAnswered'){
                    navigate("/exam/evaluate")
                    setExamState((currentState: ExamState) => {
                        const newState: ExamState = { ...currentState }
                        newState.state = 'finalAnswerSubmitted'
                        newState.secondsRemaining = response.secondsRemaining
                        return newState
                    })
                }
            })
    }

    var content = <></>
    if ((examState.state === 'active' && (examState.secondsRemaining > 0))){
        content = <TimedQuestionAnswerInteraction
        questionAnswerConsole={{
            question: questionDisplay,
            questionIndex: examState.questionIndex,
            totalQuestions: examState.totalQuestions,
            onAnswerSubmit: (option: number) => {
                submitHandler(option)
            }
        }}
        secondsRemaining={examState.secondsRemaining}
        onTimeout={() => { 
            navigate("/exam/evaluate")
        }}
    />
    }
    if (examState.state === 'finalAnswerSubmitted'){
        content = <AllQuestionsAnswered/>
    }
    if (examState.state === 'timedout'){
        content = <TimeOut/>
    }

    return (<div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        {content}
    </div>)
}

export default ActiveExam
