import { useEffect, useState } from "react";
import QuestionBody from "../../ui/composite/QuestionBody";
import { Button, CountdownTimer } from "rb-base-element";
import ExamService from "../../../services/ExamService";
import { ExamResponse, NextQuestionResponse, SubmitAnswerAndMoveNextResponse } from "../../../services/types/domain/ExamData";
import QuestionIndex from "../../ui/composite/QuestionIndex";

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

    const [examState, setExamState] = useState<ExamState>({
        totalQuestions: 0,
        questionIndex: 0,
        state: 'initialising',
        secondsRemaining: 20,
        examId: ''
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
        if (examState.state === 'initialising') {
            console.log('question state is initialising')

            ExamService.initialiseExam(examState.examId, '112', (response: ExamResponse) => {
                console.log('Exam component on start::', JSON.stringify(response))
                if (response.responseStatus !== 'initialised'){
                    setExamState((presentState: ExamState) => {
                        const newState: ExamState = { ...presentState }
                        newState.state = 'initialiseFailed'
                        return newState
                    })
                    return
                }
                console.log('Exam component on start::initialised')
                if (! (response.activeExamDetails && response.activeQuestion )){
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
                            newState.selectedOption=-1
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

            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                <div style={{flex:3, textAlign:'right', paddingRight:20}}><span>Time remaining</span></div>
                <div style={{flex:3}}>
                <CountdownTimer timerName="examTimer" border={{apply: true, color:'blue', width:'thin'}} startTimer={examState.secondsRemaining} onTimeout={() => {
                    console.log('timed out')
                    setExamState((currentState: ExamState) => {
                        currentState.state = 'timedout';
                        return currentState
                    })
                }} />
            </div></div>
            <QuestionIndex currentIndex={examState.questionIndex} totalQuestions={examState.totalQuestions} />
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
        <div style={{display:'flex', justifyContent:'center', paddingBottom:30}}><Button name='Submit Answer' size="large" onClick={() => {
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
        </div>
             
        </>
        }
        
    </div>)
}

export default ActiveExam
