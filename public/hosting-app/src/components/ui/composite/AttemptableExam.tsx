import { Link } from "react-router-dom"
import { AssignedExamProp } from "./types/AssignedExamsListProps"

const AttemptableExam = (props: AssignedExamProp)=>{
    return <div style={{display:'flex', flexDirection:'row', flex:1, marginTop:10, marginBottom:10}}>
        <Link to={`/exam/${props.examId}`}>{props.examTitle}</Link>
    </div>
}

export default AttemptableExam