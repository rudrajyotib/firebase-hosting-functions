import { Button, TextInput } from "rb-base-element"
import { useState } from "react"
import ExamService from "../../../../services/ExamService"
import { AddSubjectAndTopicRequest } from "../../../../services/types/domain/ExamData"
import { useNavigate } from "react-router-dom"

type CreateSubjectAndTopicState = {
    subject?: string,
    grade?: number,
    title?: string,
    topic?: string,
    status: 'notsubmitted' | 'submitting' | 'submitted' | 'failed'
}

const AddSubjectAndTopic = () => {

    const [addSubject, setAddSubject] = useState<CreateSubjectAndTopicState>({
        status: 'notsubmitted'
    })

    const navigate = useNavigate()
    return (<div style={{display:'flex', flexDirection:'column'}}>
       <div>
            <h5>Add new subject and topic</h5>
       </div>
       <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
            <div style={{display:'flex', flex:1, justifyContent:'center'}}>
                <span>Subject</span>
            </div>
            <div style={{display:'flex', flex:1, justifyContent:'flex-start'}}>
                <TextInput name="subject" placeHolderText="Subject" textType="alpha" value="" key={"AddSubject"}
                    onChangeHandler={(text:string)=>{
                        setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                            const newAddSubject = {...currentAddSubject}
                            newAddSubject.subject = text
                            return newAddSubject
                        })
                    }}/>
            </div>
       </div>
       <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
            <div style={{display:'flex', flex:1, justifyContent:'center'}}>
                <span>Topic</span>
            </div>
            <div style={{display:'flex', flex:1, justifyContent:'flex-start'}}>
                <TextInput name="topic" placeHolderText="Topic" textType="alpha" value="" key={"AddTopic"}
                    onChangeHandler={(text:string)=>{
                        setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                            const newAddSubject = {...currentAddSubject}
                            newAddSubject.topic = text
                            return newAddSubject
                        })
                    }}/>
            </div>
       </div>
       <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
            <div style={{display:'flex', flex:1, justifyContent:'center'}}>
                <span>Grade</span>
            </div>
            <div style={{display:'flex', flex:1, justifyContent:'flex-start'}}>
                <TextInput name="grade" placeHolderText="Grade" textType="numeric" value="" key={"AddGrade"}
                    onChangeHandler={(text:string)=>{
                        setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                            const newAddSubject = {...currentAddSubject}
                            newAddSubject.grade = parseInt(text)
                            return newAddSubject
                        })
                    }}/>
            </div>
       </div>
       <div style={{display:'flex', flexDirection:'row', justifyContent:'center'}}>
            <div style={{display:'flex', flex:1, justifyContent:'center'}}>
                <span>Title</span>
            </div>
            <div style={{display:'flex', flex:1, justifyContent:'flex-start'}}>
                <TextInput name="title" placeHolderText="Title" textType="alpha-sentence" value="" key={"AddTitle"}
                    onChangeHandler={(text:string)=>{
                        setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                            const newAddSubject = {...currentAddSubject}
                            newAddSubject.title = text
                            return newAddSubject
                        })
                    }}/>
            </div>
       </div>
       <div>
                    <Button name="submit" importance="primary" onClick={()=>{
                        if ( !addSubject.subject || addSubject.subject.trim() === '' 
                        || !addSubject.grade || addSubject.grade < 1
                    || !addSubject.title || addSubject.title.trim() === ''
                    || !addSubject.topic || addSubject.topic.trim() === ''){
                        return
                    }
                        setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                            const newAddSubject = {...currentAddSubject}
                            newAddSubject.status = "submitting"
                            return newAddSubject
                        })
                        const addSubjectRequest: AddSubjectAndTopicRequest = {
                            subject: addSubject.subject,
                            grade: addSubject.grade,
                            title: addSubject.title,
                            topic: addSubject.topic,
                            organiserId: ''+localStorage.getItem('entityId')
                        }
                        ExamService.addSubjectAndTopic(addSubjectRequest,
                            ()=>{
                                navigate("/admin/subjects")
                                setAddSubject((currentAddSubject: CreateSubjectAndTopicState)=>{
                                    const newAddSubject = {...currentAddSubject}
                                    newAddSubject.status = 'submitted'
                                    return newAddSubject
                                })
                                
                            }, () => {}
                        )
                    }}
                    key={"AddSubjectButton"}
                    size="medium"
                    />
       </div>
    </div>)
}

export default AddSubjectAndTopic