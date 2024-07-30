import { useEffect, useRef, useState } from "react"
import { AssignedExaminee } from "../../../../services/types/domain/ExamData"
import ExamService from "../../../../services/ExamService"
import SingleAssignedExaminee from "./SingleAssignExaminee"
import { Button } from "rb-base-element"
import { Link } from "react-router-dom"

type AssignedExamineeListState = {
    organiserId: string,
    listFetched: boolean,
    assignedExaminees: AssignedExaminee[]
}

const AssignedExaminees = () =>{

    const [assignedExamineeListState, setAssignedExamineeListState] = useState<AssignedExamineeListState>({
        organiserId: ""+localStorage.getItem('entityId'),
        listFetched: false,
        assignedExaminees: []
    })

    let examineeListRef = useRef(false)
    
    useEffect(()=>{
        if (examineeListRef.current === true){
            return
        }
        examineeListRef.current = true
        ExamService.listAssignedExaminees(assignedExamineeListState.organiserId,
            (examinees: AssignedExaminee[])=>{
                if (examinees.length > 0){
                    setAssignedExamineeListState((current: AssignedExamineeListState)=>{
                        const newState: AssignedExamineeListState = {...current}
                        newState.assignedExaminees = examinees
                        newState.listFetched = true
                        return newState
                    })
                }
            },
            () => {}
        )
    }, [assignedExamineeListState.organiserId])

    let examineeListView = <></>
    if (assignedExamineeListState.listFetched === true && assignedExamineeListState.assignedExaminees.length > 0){
        examineeListView = <div>{assignedExamineeListState.assignedExaminees.map((value: AssignedExaminee)=>{
            return (<div key={`${value.id}`}>
                <SingleAssignedExaminee id={value.id} name={value.name}/>
            </div>)
        })}</div>
    }

    return (<div>
        <div>
        <div><Link to={"/admin/assignExaminee"}>Assign examinee</Link></div>
        </div>
        <div>
        {examineeListView}
        </div>
    </div>)
}

export default AssignedExaminees