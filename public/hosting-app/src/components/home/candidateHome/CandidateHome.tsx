import { useEffect, useState } from "react"
import ExamService from "../../../services/ExamService"
import { ActiveExams } from "../../../services/types/domain/ExamData"
import AssignedExamsList from "../../ui/composite/AssignedExamsList"
import { AssignedExamProp } from "../../ui/composite/types/AssignedExamsListProps"


interface AvailableExams {
    queryState: 'loading' | 'fetched' | 'notFound'
    exams: {examId: string,
        examTitle: string}[]
}

const CandidateHome = (props:any) => {

    const [studentId] = useState(localStorage.getItem('entityId'))
    const [availableExams, setAvailableExams] = useState<AvailableExams>({
        queryState: 'loading',
        exams: []
    })

    useEffect(()=>{
        if (!studentId || studentId === ''){
            return
        }
        ExamService.queryActiveExams(studentId, (response: ActiveExams)=>{
            if (response && response.exams && response.exams.length > 0){
                // console.log('Assigned exams')
                setAvailableExams((presentState: AvailableExams)=>{
                    const newState: AvailableExams = {queryState: 'fetched', exams:[]}
                    response.exams.forEach((exam)=>{
                        newState.exams.push({examId: exam.id, examTitle: exam.title})
                    })
                    return newState
                })
            }else{
                setAvailableExams({queryState:'notFound', exams:[]})
            }
        })
    },[studentId])

    const unattemptedExams: AssignedExamProp[] = availableExams.exams.map( (_e) => {
        return {examId: _e.examId, examTitle: _e.examTitle, status:'new'}
    } )

    return (<>
        <div>Welcome Candidate</div>
        {
            (availableExams.queryState === 'loading') && 
            <>
                <div> Loading list of exams</div>
            </>
        }
        {
            (availableExams.queryState === 'fetched') && 
            <>
                   <AssignedExamsList exams={unattemptedExams}/>
            </>
        }
    </>)
}

export default CandidateHome