import { Button, TextInput } from "rb-base-element"
import { useState } from "react"
import ExamService from "../../../../services/ExamService"
import { ExamTemplateSummary } from "../../../../services/types/domain/ExamData"

type CreateTemplateProp = {
    syllabusList: {id: string, title: string}[],
    orgId: string,
    successCallback : (request: ExamTemplateSummary)=>void,
    failureCallback: ()=>void
}

type CreateExamTemplateState = {
    selectedSyllabusId: string,
    grade: number,
    subject: string,
    title: string
}

const isValid = (state: CreateExamTemplateState)=>{
    return (state.selectedSyllabusId && 
        state.selectedSyllabusId.trim() !== "" && 
        state.grade && state.grade > 0 && 
        state.subject && state.subject.trim() !== "" && 
        state.title && state.title.trim() !== "")
}

const CreateExamTemplate = (props: CreateTemplateProp) => {

    const [createTemplateState, setCreateTemplateState] = useState<CreateExamTemplateState>({
        selectedSyllabusId: '',
        grade: -1,
        subject: '',
        title: ''
    })
    
    let subjectSelect = <></>

    subjectSelect = <select id={"subjectSelection"} onChange={(e)=>{
        setCreateTemplateState((currentState: CreateExamTemplateState)=>{
            const newState = {...currentState}
            newState.selectedSyllabusId = e.target.value
            return newState
        })
    }}>
            <option value="">Select a syllabus</option>
        {
            props.syllabusList.map((s)=>{
                // eslint-disable-next-line no-template-curly-in-string
                return <option value={s.id} key={`SubjectSelectOptionId${s.id}`} id={"`dropdownOption`${s.id}"} onChange={(e)=>{
                }}>{s.title}</option>
            })
        }
    </select>
    


    return (<div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex' , flex:1}}>
            <div style={{display: 'flex' , flex:1}}>
                <span>Select syllabus:</span>
            </div>
            <div style={{display: 'flex' , flex:2}}>
                {subjectSelect}
            </div>
        </div>
        <div style={{display: 'flex' , flex:1}}>
            <div style={{display: 'flex' , flex:4}}>
                <span>Grade:</span>
            </div>
            <div style={{display: 'flex' , flex:2}}>
                <TextInput textType={"numeric"} placeHolderText="Grade" value={""}
                     name={"createTemplateGrade"} onChangeHandler={(text:string)=>{
                    setCreateTemplateState((currentState: CreateExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.grade = parseInt(text)
                        return newState
                    })
                }}/>
            </div>
        </div>
        <div style={{display: 'flex' , flex:1}}>
            <div style={{display: 'flex' , flex:4}}>
                <span>Subject:</span>
            </div>
            <div style={{display: 'flex' , flex:2}}>
                <TextInput textType={"alpha"} placeHolderText="Subject" value={""}
                     name={"createTemplateSubject"} onChangeHandler={(text:string)=>{
                    setCreateTemplateState((currentState: CreateExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.subject = text
                        return newState
                    })
                }}/>
            </div>
        </div>
        <div style={{display: 'flex' , flex:1}}>
            <div style={{display: 'flex' , flex:4}}>
                <span>Title:</span>
            </div>
            <div style={{display: 'flex' , flex:2}}>
                <TextInput textType={"alpha-sentence"} placeHolderText="Title" value={""}
                     name={"createTemplateTitle"} onChangeHandler={(text:string)=>{
                    setCreateTemplateState((currentState: CreateExamTemplateState)=>{
                        const newState = {...currentState}
                        newState.title = text
                        return newState
                    })
                }}/>
            </div>
        </div>
        <div><Button name="Create Template" importance="primary" size="large" onClick={()=>{
            if (isValid(createTemplateState)){
                ExamService.addExamTemplate({
                    grade: createTemplateState.grade,
                    subject: createTemplateState.subject,
                    syllabusId: createTemplateState.selectedSyllabusId,
                    organiserId: props.orgId,
                    title: createTemplateState.title
                }, (templateId: string)=>{props.successCallback({grade: createTemplateState.grade,
                    subject: createTemplateState.subject,
                    title: createTemplateState.title,
                    id: templateId,
                    status: 'Active',
                    syllabusId: createTemplateState.selectedSyllabusId
                })}, ()=>{props.failureCallback()})
            }
            
        }}/></div>
    </div>)
}

export default CreateExamTemplate