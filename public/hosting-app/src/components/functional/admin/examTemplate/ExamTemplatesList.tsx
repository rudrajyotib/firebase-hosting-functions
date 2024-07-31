import { useEffect, useRef, useState } from "react"
import { AssignedExaminee, ExamTemplateSummary, SyllabusSummary } from "../../../../services/types/domain/ExamData"
import ExamService from "../../../../services/ExamService"
import ExamTemplateSummaryView from "./ExamTemplateSummary"
import CreateExamTemplate from "./CreateExamTemplate"
import AssigneeSelect from "./AssigneeSelect"

type ExamTemplateState = {
    syllabusLoadStatus : 'loading' | 'loaded' | 'failed',
    examTemplateLoadStatus : 'loading' | 'loaded' | 'failed',
    examineeLoadState: 'loading' | 'loaded' | 'failed',
    organiserId: string,
    examTemplates: ExamTemplateSummary[],
    syllabusList: {id: string, title: string}[],
    addNewExamTemplateGrade: number,
    addNewExamTemplateExamName: string
    assignedExaminees: {id: string, name: string}[],
    selectedExaminees: string[]
}

const ExamTemplatesList = ()=>{
    let syllabusLoadRef = useRef([false, false])
    let assignedExamineeLoadRef = useRef(false)
    const [examTemplateState, setExamTemplateSet] = useState<ExamTemplateState>({
        syllabusLoadStatus:'loading',
        examTemplateLoadStatus: 'loading',
        examineeLoadState: 'loading',
        organiserId: ''+localStorage.getItem('entityId'),
        examTemplates:[],
        syllabusList: [],
        addNewExamTemplateGrade: 0,
        addNewExamTemplateExamName: '',
        assignedExaminees: [],
        selectedExaminees: []
    })

    useEffect(()=>{
        if (syllabusLoadRef.current[0] === false){
            syllabusLoadRef.current[0] = true
            ExamService.listSyllabus(examTemplateState.organiserId,
                (syllabusSummaryList: SyllabusSummary[])=>{
                    const syllabusList: {id: string, title: string}[] = []
                    syllabusSummaryList.forEach((s)=>{
                        syllabusList.push({
                            id: s.id,
                            title: s.title
                        })
                    })
                    setExamTemplateSet((currentState: ExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.syllabusList = syllabusList
                        newState.syllabusLoadStatus = 'loaded'
                        return newState
                    })
                },
                ()=>{
                    setExamTemplateSet((currentState: ExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.syllabusLoadStatus = 'failed'
                        return newState
                    })
                }
            )
        }
        if (syllabusLoadRef.current[1] === false){
            syllabusLoadRef.current[1] = true
            ExamService.listExamTemplate(examTemplateState.organiserId,
                (examTemplateSummaryList: ExamTemplateSummary[])=>{
                    setExamTemplateSet((currentState: ExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.examTemplates = examTemplateSummaryList
                        newState.examTemplateLoadStatus = 'loaded'
                        return newState
                    })
                },
                ()=>{}
            )
        }
        if (assignedExamineeLoadRef.current === false){
            assignedExamineeLoadRef.current = true
            ExamService.listAssignedExaminees(examTemplateState.organiserId, 
                (examinees: AssignedExaminee[])=>{
                    if (examinees.length > 0 ){
                        setExamTemplateSet((current: ExamTemplateState)=>{
                            let newState: ExamTemplateState = {...current}
                            newState.assignedExaminees = examinees
                            newState.examineeLoadState = 'loaded'
                            return newState
                        })
                    }
                },
                ()=>{
                    setExamTemplateSet((current: ExamTemplateState)=>{
                    let newState: ExamTemplateState = {...current}
                    newState.examineeLoadState = 'failed'
                    return newState
                })}
            )
        }
    }, [examTemplateState.organiserId])

    let examTemplateListView = <></>
    if(examTemplateState.examTemplateLoadStatus === 'loaded'){
        examTemplateListView =
        <div style={{display:'flex', flex: 1, flexDirection: 'column'}}> {examTemplateState.examTemplates.map((e)=>{
            return <div style={{display:'flex', flex: 1, flexDirection: 'row', }} key={`examTemplateViewId${e.id}`}>
                <ExamTemplateSummaryView summary={e} assignHandler={(id:string)=>{
                    const selectedExamineeIds: string[] = []
                    examTemplateState.selectedExaminees.forEach((e)=>{selectedExamineeIds.push(e)})
                    if (selectedExamineeIds.length === 0 ){
                        return
                    }
                    selectedExamineeIds.forEach((examineeId)=>{
                        console.log('Selected examinee::'+examineeId+'::For template::'+id)
                        ExamService.assignExam({
                            examineeId: examineeId,
                            examTemplateId: id,
                            organiserId: examTemplateState.organiserId
                        }, (()=>{}), (()=>{}))
                    })
                }}/>
            </div>
        })
        }</div>
    }

    let assignees = <div>Assignees not loaded</div>
    if (examTemplateState.examineeLoadState === 'loaded'){
        const assigneesForCheckboxes: { id: string; name: string; checked: boolean }[] = []
        examTemplateState.assignedExaminees.forEach((e)=>{
            const selected: boolean = examTemplateState.selectedExaminees.find(x => x === e.id) !== undefined
            assigneesForCheckboxes.push({
                id:e.id,
                name: e.name,
                checked : selected
            })
        })
        assignees = <AssigneeSelect assignees={assigneesForCheckboxes}
        uncheckHandler={(id:string)=>{
            setExamTemplateSet((current: ExamTemplateState)=>{
                const newState: ExamTemplateState = {...current}
                const selected: string[] = []
                current.selectedExaminees.forEach((e)=>{
                    if (e !== id){
                        selected.push(e)
                    }
                })
                newState.selectedExaminees = selected
                return newState
            })
        }}    
        checkHandler={(selectedId: string)=>{
            setExamTemplateSet((current: ExamTemplateState)=>{
                const newState: ExamTemplateState = {...current}
                const selected = []
                current.selectedExaminees.forEach((e)=>{
                    selected.push(e)
                })
                selected.push(selectedId)
                newState.selectedExaminees = selected
                return newState
            })
        }}/>
    }

    let createTemplate = <></>
    if (examTemplateState.syllabusLoadStatus === 'loaded'){
        createTemplate = <CreateExamTemplate 
            syllabusList={examTemplateState.syllabusList} 
            orgId={examTemplateState.organiserId} 
            successCallback={(response: ExamTemplateSummary)=>{
                setExamTemplateSet((currentState: ExamTemplateState)=>{
                    const newState = {...currentState}
                    const newTemplates: ExamTemplateSummary[] = []
                    currentState.examTemplates.forEach((ex)=>{
                        newTemplates.push(ex)
                    })
                    const newTemplate: ExamTemplateSummary = response
                    newTemplates.push(newTemplate)
                    newState.examTemplates = newTemplates
                    return newState
                })
            }} 
            failureCallback={()=>{}}/>
    }

    return (<div>
        {createTemplate}
        {assignees}
        {examTemplateListView}
    </div>)
}

export default ExamTemplatesList