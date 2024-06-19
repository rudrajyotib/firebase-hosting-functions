import { useEffect, useRef, useState } from "react"
import ExamService from "../../../services/ExamService";
import { ExamResultSummary } from "../../../services/types/domain/ExamData";
import { Link } from "react-router-dom";

interface EvaluationState {
    examInstanceId: string,
    totalMarks: number,
    score: number,
    status: 'Attempting' | 'Success' | 'Failed'
}

const EvaluateExam = () => {

    const evaluationAttempted = useRef(false);
    const [evalState, setEvalState] = useState<EvaluationState> ({
        examInstanceId: '',
        totalMarks: 0,
        score: 0,
        status: 'Attempting'
    })
    
    useEffect(()=>{
        if (evaluationAttempted.current === false) {
            const examineeId = localStorage.getItem("entityId")
            const examInstanceId = localStorage.getItem("examInstanceId")
            if (!examineeId || !examInstanceId) {
                return;
            }
            evaluationAttempted.current = true
            console.log('Evaluating exam')
            ExamService.evaluate({
                examineeId: examineeId,
                examInstanceId: examInstanceId
            }, ((evalSummary: ExamResultSummary)=>{
                setEvalState((presentState: EvaluationState)=>{
                    const newState: EvaluationState = { ...presentState }
                    newState.status = 'Success'
                    newState.score = evalSummary.score
                    newState.totalMarks = evalSummary.totalMarks
                    return newState
                })
                localStorage.removeItem('examInstanceId')
            }), ()=>{
                setEvalState((presentState: EvaluationState)=>{
                    const newState: EvaluationState = { ...presentState }
                    presentState.status = 'Failed'
                    return newState
                })
            })
        }
    }, [])

    let content = <></>
    if (evalState.status === 'Attempting'){
        content = <div>
            System is evaluating your exam.
        </div>
    } else if (evalState.status === 'Failed' ){
        content = <div>
            Your evaluation process did not succeeed.
        </div>
    } else {
        content = <div>
            You have scored {evalState.score} out of {evalState.totalMarks}
        </div>
    }
    let homeLink = <div>
        <div><Link to={"/home"}>Home</Link></div>
    </div>
    return (<div>
        {content}
        {homeLink}
    </div>)
}

export default EvaluateExam