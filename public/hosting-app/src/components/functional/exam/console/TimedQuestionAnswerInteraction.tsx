import { CountdownTimer } from "rb-base-element"
import { TimedQuestionConsoleProps } from "../../types/TimedQuestionConsoleProps"
import QuestionAnswerInteraction from "./QuestionAnswerInteraction"

const TimedQuestionAnswerInteraction = (props:TimedQuestionConsoleProps) => {
    return (<div style={{display:'flex', flex:1, flexDirection:'column'}}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ flex: 3, textAlign: 'right', paddingRight: 20 }}><span>Time remaining</span></div>
                    <div style={{ flex: 3 }}>
        <CountdownTimer timerName="examTimer" border={{ apply: true, color: 'blue', width: 'thin' }} 
                startTimer={props.secondsRemaining} 
                onTimeout={() => {
                            props.onTimeout()
                        }} />
                        </div>
                </div>
        
        <QuestionAnswerInteraction
                    question={props.questionAnswerConsole.question}
                    questionIndex={props.questionAnswerConsole.questionIndex}
                    totalQuestions={props.questionAnswerConsole.totalQuestions}
                    onAnswerSubmit={(option: number) => {
                        props.questionAnswerConsole.onAnswerSubmit(option)
                    }}
                />
    </div>)
}


export default TimedQuestionAnswerInteraction