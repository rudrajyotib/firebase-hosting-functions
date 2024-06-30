import { Button, TextInput } from "rb-base-element"
import { useEffect, useRef, useState } from "react"
import ExamService from "../../../../services/ExamService"

type AddSingleQuestionState = {
    organiserId: string,
    questionLine: string,
    options: string[],
    correctOptionIndex: number,
    tags: string[],
    subjectsLoaded: 'loading' | 'loaded' | 'failed',
    subjectsAndTopics: {id: string, title: string}[],
    selectedTopic: string
}


const AddSingleQuestion = () =>{

    const [addQuestionState, setAddQuestionState] = useState<AddSingleQuestionState>({
        organiserId: ''+localStorage.getItem('entityId'),
        questionLine: "",
        options: ['','','',''],
        correctOptionIndex: -1,
        tags:[],
        subjectsLoaded: 'loading',
        subjectsAndTopics: [],
        selectedTopic: ''
    })

    let subjectLoadingInit = useRef(false)

    useEffect(()=>{
        if (subjectLoadingInit.current === true) {
            return
        }
        subjectLoadingInit.current = true
        ExamService.listOfSubjectsAndTopics(addQuestionState.organiserId,
            (subjectAndTopics)=>{
                const subs:  {id: string, title: string}[] = []
                subjectAndTopics.forEach((s)=>{
                    subs.push({id:s.id, title:s.title})
                })
                setAddQuestionState((currentState: AddSingleQuestionState)=>{
                    const newState = {...currentState}
                    newState.subjectsLoaded = 'loaded'
                    newState.subjectsAndTopics = subs
                    return newState
                })
            },
            () => {}
        )
    }, [addQuestionState.organiserId])

    let subjectSelect = <></>
    if (addQuestionState.subjectsLoaded === 'loaded'){
        subjectSelect = <select id={"subjectSelection"} onChange={(e)=>{
            setAddQuestionState((currentState: AddSingleQuestionState)=>{
                const newState = {...currentState}
                newState.selectedTopic = e.target.value
                return newState
            })
        }}>
             <option value="">Select a subject</option>
            {
                addQuestionState.subjectsAndTopics.map((s)=>{
                    // eslint-disable-next-line no-template-curly-in-string
                    return <option value={s.id} key={`SubjectSelectOptionId${s.id}`} id={"`dropdownOption`${s.id}"} onChange={(e)=>{
                    }}>{s.title}</option>
                })
            }
        </select>
    }


    return (<div>
        Space to add a single question
        <div style={{display:'flex', flexDirection:'column', backgroundColor:'white'}}>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Question Text:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Question body" 
                    textType="freetext"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.questionLine = text
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', justifyContent:'flex-start', alignItems:'flex-start'}}>
                <span style={{fontWeight:'bold'}}>Options:</span>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Option 1:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Option 1" 
                    textType="freetext"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.options[0] = text
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Option 2:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Option 2" 
                    textType="freetext"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.options[1] = text
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Option 3:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Option 3" 
                    textType="freetext"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.options[2] = text
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Option 4:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Option 4" 
                    textType="freetext"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.options[3] = text
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Correct option:</span>
                </div>
                <div style={{display:'flex', flex:8}}><TextInput 
                    name="questionLine" 
                    placeHolderText="Option 4" 
                    textType="numeric"
                    value="" 
                    key={"questionText"}
                    onChangeHandler={(text: string)=>{
                        setAddQuestionState((currentState: AddSingleQuestionState)=>{
                            const newState = {...currentState}
                            newState.correctOptionIndex = parseInt(text)
                            return newState
                        })
                    }}/>
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <span style={{fontWeight:'bold'}}>Add to topic:</span>
                </div>
                <div style={{display:'flex', flex:8}}>
                    {subjectSelect}
                </div>
            </div>
            <div style={{display:'flex', flexDirection:'row'}}>
                <div style={{display:'flex', flex:2, justifyContent:'center', alignItems:'center'}}>
                    <Button importance="primary" onClick={()=>{
                       ExamService.addSingleQuestion({
                        format:'text',
                        correctOptionIndex: addQuestionState.correctOptionIndex,
                        options: addQuestionState.options,
                        organiserId: addQuestionState.organiserId,
                        questionLines: [addQuestionState.questionLine],
                        topicId: addQuestionState.selectedTopic
                       },
                        ()=>{},
                        ()=>{}
                       )
                    }} name="Add Question"/>
                </div>
            </div>

        </div>


    </div>)
}

export default AddSingleQuestion