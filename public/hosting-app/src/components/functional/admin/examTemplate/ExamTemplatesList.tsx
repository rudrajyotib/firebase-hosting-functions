import { useEffect, useRef, useState } from "react"
import { ExamTemplateSummary, SyllabusSummary } from "../../../../services/types/domain/ExamData"
import ExamService from "../../../../services/ExamService"
import ExamTemplateSummaryView from "./ExamTemplateSummary"
import CreateExamTemplate from "./CreateExamTemplate"

type ExamTemplateState = {
    syllabusLoadStatus : 'loading' | 'loaded' | 'failed',
    examTemplateLoadStatus : 'loading' | 'loaded' | 'failed',
    organiserId: string,
    examTemplates: ExamTemplateSummary[],
    syllabusList: {id: string, title: string}[],
    addNewExamTemplateGrade: number,
    addNewExamTemplateExamName: string
}

const ExamTemplatesList = ()=>{
    let syllabusLoadRef = useRef([false, false])
    const [examTemplateState, setExamTemplateSet] = useState<ExamTemplateState>({
        syllabusLoadStatus:'loading',
        examTemplateLoadStatus: 'loading',
        organiserId: ''+localStorage.getItem('entityId'),
        examTemplates:[],
        syllabusList: [],
        addNewExamTemplateGrade: 0,
        addNewExamTemplateExamName: ''
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
    }, [examTemplateState.organiserId])

    let examTemplateListView = <></>
    if(examTemplateState.examTemplateLoadStatus === 'loaded'){
        examTemplateListView =
        <div> {examTemplateState.examTemplates.map((e)=>{
            return <div key={`examTemplateViewId${e.id}`}>
                <ExamTemplateSummaryView summary={e} />
            </div>
        })
        }</div>
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
        {examTemplateListView}
    </div>)
}

export default ExamTemplatesList