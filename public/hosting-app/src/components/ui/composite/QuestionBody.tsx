import { Radio } from "rb-base-element"
import QuestionBodyProps from "./types/QuestionBodyProps"

const QuestionBody = (props:QuestionBodyProps) => {
    return (
        <div style={{display:'flex', flexDirection:'column', flex:1}}>
            {
                props.textLines.map((line, index) => 
                    <div key={`questionLine${index}`}> {line}</div>
                ) 
            }
            <div>
                <Radio data={props.options} groupId="questionOptions" onChange={(selected:string)=>{
                    props.onSelect(selected)
                }}/>
            </div>
        </div>
    )
}

export default QuestionBody