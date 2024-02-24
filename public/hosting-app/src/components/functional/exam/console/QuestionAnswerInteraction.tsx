import { useRef } from "react"
import QuestionBody from "../../../ui/composite/QuestionBody"
import QuestionIndex from "../../../ui/composite/QuestionIndex"
import { QuestionAnswerConsoleProps } from "../../types/QuestionConsoleProps"
import { Button } from "rb-base-element"



const QuestionAnswerInteraction = (props:QuestionAnswerConsoleProps) =>{
    let selectedOption = useRef(-1)
    return (<div style={{display:'flex', flex:1, flexDirection:'column'}}>
        <QuestionIndex currentIndex={props.questionIndex} totalQuestions={props.totalQuestions}/>
        <QuestionBody textLines={props.question.questionLines} displayType={'textOnly'} options={props.question.options} 
            onSelect={(option: string)=>{
                selectedOption.current = Number.parseInt(option)
            }}/>
        <div style={{display:'flex', justifyContent:'center', paddingBottom:30}}>
            <Button name='Submit Answer' size="large" onClick={() => {
            if ( ! (selectedOption.current >= 0)){
                return
            }
            props.onAnswerSubmit(selectedOption.current)
            selectedOption.current = -1
        }} importance="primary" />
        </div>
    </div>)
}

export default QuestionAnswerInteraction