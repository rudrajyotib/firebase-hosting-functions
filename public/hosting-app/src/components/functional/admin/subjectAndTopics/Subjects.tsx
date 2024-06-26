import { useEffect, useRef, useState } from "react"
import { SingleSubjectAndTopicDisplayProp } from "../../types/SubjectAndTopicDisplayProps"
import SingleSubjectDisplay from "./SingleSubjectDisplay"
import ExamService from "../../../../services/ExamService"
import { SubjectAndTopicSummary } from "../../../../services/types/domain/ExamData"
import { Button } from "rb-base-element"
import { useNavigate } from "react-router-dom"

type SubjectAndTopicsListState = {
    status: 'topicsLoaded' | 'topicsLoading' | 'loadingFailed'
    subjectAndTopicsList: SingleSubjectAndTopicDisplayProp[]
}

const Subjects = () => {
    
    const navigate = useNavigate()

    
    let listRequestedRef = useRef(false)
    const [subjectAndTopicListState, setSubjectAndTopicListState] = 
        useState<SubjectAndTopicsListState>({
            status: 'topicsLoaded',
            subjectAndTopicsList: [{
                id:"S1",
                grade:1,
                topic: 'Topic1',
                subject: 'Sub1',
                title: 'Sub1 Topic1 Initial'
            },
            {
                id:"S2",
                grade:1,
                topic: 'Topic1',
                subject: 'Sub1',
                title: 'Sub1 Topic1 Initial'
            }]
        })
    

    useEffect(()=>{
        if (listRequestedRef.current === false) {
            listRequestedRef.current = true
            const orgAdminId = localStorage.getItem('entityId');
            ExamService.listOfSubjectsAndTopics(''+orgAdminId,
                (subjectsAndTopics: SubjectAndTopicSummary[])=>{
                    listRequestedRef.current = true
                    const toDisplay: SingleSubjectAndTopicDisplayProp[] = []
                    subjectsAndTopics.forEach((s)=>{
                        toDisplay.push({
                            grade: s.grade,
                            subject: s.subject,
                            topic: s.topic,
                            id: s.id,
                            title: s.title
                        })
                    })
                    setSubjectAndTopicListState((presentState: SubjectAndTopicsListState)=>{
                        const newState = {...presentState}
                        newState.status = 'topicsLoaded'
                        newState.subjectAndTopicsList = toDisplay
                        return newState
                    })
                },
                ()=>{

                }
            )
        }
    }, [])

    
    
    var listContent = <></>
    
    if (subjectAndTopicListState.status === 'topicsLoaded') {
        listContent = <div>
        {subjectAndTopicListState.subjectAndTopicsList.map(
            (subject) => {
                return <SingleSubjectDisplay 
                key={subject.id}
                    grade={subject.grade} 
                    title={subject.title} 
                    id={subject.id}
                    topic={subject.topic}
                    subject={subject.subject}/>
            }
        )}</div>
    }

    var addSubjectButton = <div>
        <Button name="addSubject" importance="primary" onClick={()=>{
            navigate("/admin/addsubject")
        }}/>
    </div>

    return (<div>
        Subjects of Admin
        
        {listContent}
        {addSubjectButton}
    </div>)
}

export default Subjects