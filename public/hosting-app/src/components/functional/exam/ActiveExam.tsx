import { useEffect, useState } from "react";
import QuestionBody from "../../ui/composite/QuestionBody";
import ActiveExamProps from "../types/ActiveExamProps";
import { Button, CountdownTimer } from "rb-base-element";
import ApiService from "../../../services/ApiService";
import ExamService from "../../../services/ExamService";
import { ExamResponse, NextQuestionResponse, SubmitAnswerResponse } from "../../../services/types/ExamData";
import QuestionIndex from "../../ui/composite/QuestionIndex";

interface ExamState {
    totalQuestions: number,
    questionIndex: number,
    state: 'active' | 'submitting' | 'fetching' | 'timedout' | 'initialising' | 'finalAnswerSubmitted',
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

    const [examState, setExamState] = useState<ExamState>({
        totalQuestions: 0,
        questionIndex: 0,
        state: 'initialising',
        secondsRemaining: 20,
        examId: 'E1'
    }
    )

    const [questionDisplay, setQuestionDisplay] = useState<QuestionDisplay>({
        questionLines: [],
        options: [],
        questionId: '',
        selectedOption: -1
    })

    useEffect(() => {
        if (examState.state === 'initialising') {
            console.log('question state is initialising')

            ExamService.initialiseExam(examState.examId, (response: ExamResponse) => {
                setExamState((presentState: ExamState) => {
                    const newState: ExamState = { ...presentState }
                    if (response.activeExamDetails) {
                        newState.questionIndex = response.activeExamDetails.currentQuestionIndex
                        newState.secondsRemaining = response.activeExamDetails.secondsRemaining
                        newState.totalQuestions = response.activeExamDetails.totalQuestions
                    }
                    if (response.responseStatus === 'initialised') {
                        newState.state = 'active'
                    }
                    return newState
                })

                if (response.responseStatus === 'initialised' && response.activeQuestion) {
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
                }
            })
            return
        }
        if (examState.state === 'submitting') {
            console.log('question state is submitting')
            ExamService.submitAnswer(examState.examId, questionDisplay.questionId, 1, (response: SubmitAnswerResponse) => {

                if (response.nextQuestionAvailable === true && response.submitAnswerSuccess === true) {
                    setExamState((presentState: ExamState) => {
                        const newState: ExamState = { ...presentState }
                        newState.state = 'fetching'
                        return newState
                    })
                }
            })
            return
        }
        if (examState.state === 'fetching') {
            console.log('question state is fetching')
            ExamService.fetchNext({ examId: examState.examId }, (response: NextQuestionResponse) => {
                if (response.questionFound === true) {
                    setExamState((presentState: ExamState) => {
                        const newState: ExamState = { ...presentState }
                        newState.questionIndex = response.questionIndex
                        newState.state = 'active'
                        newState.secondsRemaining = response.secondsRemaining
                        return newState
                    })
                    setQuestionDisplay((presentState: QuestionDisplay) => {
                        const newState: QuestionDisplay = presentState
                        if (response.questionData) {
                            newState.questionId = response.questionData.questionId
                            newState.questionLines = response.questionData.questionLines
                            newState.options = response.questionData.options.map((value: string, index: number) => {
                                return { value: '' + index, label: value }
                            })
                        }
                        return presentState
                    })
                }
            })
            return
        }


    }, [examState.state])




    return (<div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        {(examState.state === 'active' && (examState.secondsRemaining > 0)) &&
        <>
            <CountdownTimer timerName="examTimer" startTimer={examState.secondsRemaining} onTimeout={() => {
                console.log('timed out')
                setExamState((currentState: ExamState) => {
                    currentState.state = 'timedout';
                    return currentState
                })
            }} />
            <QuestionBody displayType="textOnly"
            textLines={questionDisplay.questionLines}
            options={questionDisplay.options}
            onSelect={(selectedOption: string) => {
                console.log('Question body notified as selected option::' + selectedOption)
                setQuestionDisplay((presentState: QuestionDisplay)=>{
                    const newState: QuestionDisplay = presentState
                    newState.selectedOption = parseInt(selectedOption)
                    return newState
                })
            }} />
        <Button name='testing button' onClick={() => {
            console.log('Button clicked')
            if (examState.state !== 'active') {
                return
            }
            if ( !(questionDisplay.selectedOption >= 0)){
                return
            }
            setExamState((presentState: ExamState) => {
                const newState: ExamState = { ...presentState }
                newState.state = 'submitting'
                return newState
            })
        }} importance="primary" />
              <QuestionIndex currentIndex={examState.questionIndex} totalQuestions={examState.totalQuestions} />
        </>
        }
        
    </div>)
}

export default ActiveExam
