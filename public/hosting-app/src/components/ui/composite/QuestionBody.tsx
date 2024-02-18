import { Radio } from "rb-base-element"
import QuestionBodyProps from "./types/QuestionBodyProps"

const QuestionBody = (props:QuestionBodyProps) => {
    return (
        <div style={{display:'flex', flexDirection:'column', flex:1}}>
            {
                props.textLines.map((line, index) => 
                    <div key={`questionLine${index}`} style={{paddingLeft:10, paddingBottom:5, backgroundColor:'white'}}> {line}</div>
                ) 
            }
            <div style={{paddingTop:40, paddingLeft:10}}>Chose option and submit</div>
            <div style={{paddingTop:20}}>
                <Radio data={props.options} groupBorder={false} radioBorder={true} backgroundColor="white"
                compact={true} groupId="questionOptions" onChange={(selected:string)=>{
                    props.onSelect(selected)
                }}/>
            </div>
        </div>
    )
}

export default QuestionBody