import { useEffect, useRef, useState } from "react"
import ExamService from "../../../../services/ExamService"
import { Button, TextInput } from "rb-base-element"
import { AddSyllabusRequest } from "../../../../services/types/domain/ExamData"
import { useNavigate } from "react-router-dom"

type TopicFrequenctWeight = {
    subjectId: string,
    count: number,
    weight: number
}

type AddSyllabusState = {
    subject: string,
    duration: number,
    organiserId: string,
    title: string,
    topics: {subjectAndTopicId: string, count: number, weightage: number}[],
    subjectsList : {id: string, title: string}[],
    subjectsLoadedState: 'loading' | 'loaded' | 'failed'
}

const CreateSyllabus = () => {

    const navigate = useNavigate()

    const [addSyllabusState, setAddSyllabusState] = useState<AddSyllabusState>({
        subject: '',
        duration: 0,
        organiserId: ''+localStorage.getItem('entityId'),
        title: '',
        topics: [],
        subjectsList: [],
        subjectsLoadedState: 'loading'
    })

    const [topicToAdd, setTopicToAdd] = useState<TopicFrequenctWeight>({
        subjectId: '',
        count: -1,
        weight: -1
    })

    let subjectLoadInit = useRef(false)

    useEffect(()=>{
        if (subjectLoadInit.current === true) {
            return
        }
        subjectLoadInit.current = true
        ExamService.listOfSubjectsAndTopics(addSyllabusState.organiserId,
            (subjcts)=>{
                const subs: {id: string, title: string}[] = []
                subjcts.forEach((s)=>{
                    subs.push({
                        id:s.id,
                        title: s.title
                    })
                })
                setAddSyllabusState((currentState: AddSyllabusState)=>{
                    const newState = {...currentState}
                    newState.subjectsList = subs
                    newState.subjectsLoadedState = 'loaded'
                    return newState
                })
            },
            () => {}
        )
    }, [addSyllabusState.organiserId])
    let topicSelect = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        topicSelect =<div><select id={"subjectSelection"} onChange={(e)=>{
            setTopicToAdd((currentState: TopicFrequenctWeight)=>{
                const newState = {...currentState}
                newState.subjectId = e.target.value
                console.log('Topic to add sub:'+newState.subjectId)
                return newState
            })
        }}>
             <option value="">Select a subject</option>
            {
                addSyllabusState.subjectsList.map((s)=>{
                    // eslint-disable-next-line no-template-curly-in-string
                    return <option key={`SubjectDropdownOption${s.id}`} id={"`dropdownOption`${s.id}"} value={s.id} onChange={(e)=>{
                    }}>{s.title}</option>
                })
            }
        </select>
        </div> 
    }

    let subjectInput = <></>
    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        subjectInput = 
        <div style={{display:'flex', flexDirection:'row', flex:1}}>
        <div style={{display:'flex', flex: 2, paddingRight:'10px', justifyContent:'center', alignItems:'center'}}><span>Subject:</span></div>
        <div style={{display:'flex', flex: 2}}><TextInput name="subject" onChangeHandler={(text:string)=>{
            setAddSyllabusState((currentState: AddSyllabusState)=>{
                const newState = {...currentState}
                newState.subject = text
                return newState
            })
        }} placeHolderText="Subject" textType="alpha" value="" key={"DurationInput"} />
        </div>
        </div>
    
    }

    let durationInput = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        durationInput = 
        
        <div style={{display:'flex', flexDirection:'row', flex:1}}>
        <div style={{display:'flex', flex: 2, paddingRight:'10px', justifyContent:'center', alignItems:'center'}}><span>Duration:</span></div>
        <div style={{display:'flex', flex: 2}}><TextInput name="duration" onChangeHandler={(text:string)=>{
            setAddSyllabusState((currentState: AddSyllabusState)=>{
                const newState = {...currentState}
                newState.duration = parseInt(text)
                return newState
            })
        }} placeHolderText="Duration in Minutes" textType="numeric" value="" key={"DurationInput"} />
        </div>
        </div>
    
    }

    let titleInput = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        titleInput =
        <div style={{display:'flex', flexDirection:'row', flex:1}}>
        <div style={{display:'flex', flex: 2, paddingRight:'10px', justifyContent:'center', alignItems:'center'}}><span>Title:</span></div>
        <div style={{display:'flex', flex: 2}}>
        
        <TextInput name="title" onChangeHandler={(text:string)=>{
            setAddSyllabusState((currentState: AddSyllabusState)=>{
                const newState = {...currentState}
                newState.title = text
                return newState
            })
        }} placeHolderText="Title" textType="alpha-sentence" value="" key={"TitleInput"} />
        </div>
        </div>
    }

    let countInput = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        countInput = <TextInput name="count" onChangeHandler={(text:string)=>{
            setTopicToAdd((currentState: TopicFrequenctWeight)=>{
                const newState = {...currentState}
                newState.count = parseInt(text)
                return newState
            })
        }} placeHolderText="Count" textType="numeric" value="" key={"CountInput"} />
    
    }

    let weightageInput = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        weightageInput = <TextInput name="weightage" onChangeHandler={(text:string)=>{
            setTopicToAdd((currentState: TopicFrequenctWeight)=>{
                const newState = {...currentState}
                newState.weight = parseInt(text)
                return newState
            })
        }} placeHolderText="Weightage" textType="numeric" value="" key={"WeightageInput"} />
    
    }

    let addTopicButton = <></>
    if (addSyllabusState.subjectsLoadedState === 'loaded'){
    
        addTopicButton = <Button name="Add Topic" importance="primary" onClick={()=>{
            setAddSyllabusState((currentState: AddSyllabusState)=>{
                const newState: AddSyllabusState = {...currentState}
               
                const topics = currentState.topics
                
                const clonedTopics = topics.map((t)=>{
                    return {
                        subjectAndTopicId: t.subjectAndTopicId,
                        count: t.count,
                        weightage: t.weightage
                    }
                })
                if (!topicToAdd.subjectId || topicToAdd.subjectId.trim() === ""){
                    return currentState
                }
                const filterTopic = clonedTopics.find((value)=>{
                    return value.subjectAndTopicId === topicToAdd.subjectId
                })
                if (               
                    filterTopic === undefined ){
                    clonedTopics.push({
                        count: topicToAdd.count,
                        weightage: topicToAdd.weight,
                        subjectAndTopicId: topicToAdd.subjectId
                    })
                }
                newState.topics = clonedTopics
                return newState
            })
        }} key={"AddTopicButton"} size="medium"/>
    }

    let addTopicArea = <></>

    if (addSyllabusState.subjectsLoadedState === 'loaded'){
        addTopicArea = <div style={{display:'flex'}}>
            <div style={{display:'flex', flex:1, justifyContent:'center', alignItems:'center'}}>{topicSelect}</div>
            <div style={{display:'flex', flex:1, marginLeft:20,marginRight:20}}>{countInput}</div>
            <div style={{display:'flex', flex:1, marginRight:30}}>{weightageInput}</div>
            <div style={{display:'flex', flex:1}}>{addTopicButton}</div>
        </div>
    
    }


    let topicsList = <></>

    if (addSyllabusState.topics.length && addSyllabusState.topics.length > 0){
        topicsList = <div>
            {
                
                addSyllabusState.topics.map((t)=>{
                    const subject = addSyllabusState.subjectsList.find((s)=>{
                        return s.id === t.subjectAndTopicId
                    })
                    const subjectTitle = subject !== undefined ? subject.title : 'Please select'
                    return (<div key={`topicSummaryLine${t.subjectAndTopicId}`} style={{display:'flex', flexDirection:'row', marginTop:10, marginBottom:10, backgroundColor:'white',paddingTop:5, paddingBottom:5}}>
                        <div><span>{subjectTitle}</span></div>
                        <div style={{marginLeft:10}}><span style={{fontWeight:'bold'}}>{t.count}</span><span style={{marginLeft:10}}>Questions</span></div>
                        <div style={{marginLeft:10}}><span style={{marginLeft:10, marginRight:10}}>Weightage:</span><span style={{fontWeight:'bold'}}>{t.weightage}</span></div>
                    </div>)
                })
            }
        </div>
    }

    let addSyllabusButton=<></>
    if (addSyllabusState.topics && addSyllabusState.topics.length>0){
        addSyllabusButton = <div>
            <Button name="Add syllabus" importance="primary" size="medium" onClick={()=>{

                let totalMarks = 0
                addSyllabusState.topics.forEach((t)=>{
                    totalMarks += (t.weightage * t.count)
                })

                const addSyllabusRequest: AddSyllabusRequest = {
                    subject: addSyllabusState.subject,
                    duration: addSyllabusState.duration,
                    title: addSyllabusState.title,
                    organiserId: addSyllabusState.organiserId,
                    topics: addSyllabusState.topics,
                    totalMarks: totalMarks
                }

                ExamService.addSyllabus(addSyllabusRequest, ()=>{
                    navigate("/admin")
                }, ()=>{
                    console.log("Could not create syllabus")
                })
            }}/>
        </div>
    }

    return (<div>
        <div style={{display:'flex', flexDirection:'column'}}>
            <div>{subjectInput}</div>
            <div>{durationInput}</div>
            <div>{titleInput}</div>
            <div>{addTopicArea}</div>
            <div>{topicsList}</div>
            <div>
                {addSyllabusButton}
            </div>
        </div>
    </div>)
}

export default CreateSyllabus