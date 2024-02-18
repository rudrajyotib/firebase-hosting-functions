import AttemptableExam from "./AttemptableExam"
import { AssignedExamsListProps } from "./types/AssignedExamsListProps"

const AssignedExamsList = (props: AssignedExamsListProps) => {

    const unattemptedExams = props.exams.filter(_i => {
        return _i.status === 'new'
    })

    return <div style={{display:'flex', flexDirection:'column', flex:1}}>
  
        {
            (unattemptedExams && unattemptedExams.length > 0) && 
            unattemptedExams.map(_i => <div key={`unattemptedExamDivId${_i.examId}`}><AttemptableExam examId={_i.examId} examTitle={_i.examTitle} status={_i.status}/></div>)
        }
    </div>
}

export default AssignedExamsList