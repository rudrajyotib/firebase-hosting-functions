import { useEffect, useRef, useState } from "react"
import ExamService from "../../../../services/ExamService"
import { QuestionSummary, SubjectAndTopicSummary } from "../../../../services/types/domain/ExamData"
import { Button } from "rb-base-element"

type QuestionHomeState = {
    organiserId: string,
    subjectsLoadStatus: 'loading' | 'loaded' | 'failed',
    selectedSubjectId: string,
    questionsLoadStatus: 'loading' | 'loaded' | 'failed' | 'not-initiated',
    subjects: {title: string, id: string}[],
    questions: {questionId: string, questionLines: string[]}[]
}

const QuestionsHome = () => {
     
     let subjectsLoadInitiated = useRef(false)
     const [questionHomeState, setQuestionHomeState] = useState<QuestionHomeState>({
        organiserId: ''+localStorage.getItem('entityId'),
        subjectsLoadStatus: 'loading',
        selectedSubjectId: '',
        questionsLoadStatus: 'not-initiated',
        subjects:[],
        questions:[]
     })
    
     useEffect(()=>{
        if (subjectsLoadInitiated.current === true){
            return
        }
        subjectsLoadInitiated.current = true
        ExamService.listOfSubjectsAndTopics(questionHomeState.organiserId, (subjectAndTopics: SubjectAndTopicSummary[])=>{
            const subjects:{title: string, id: string}[] = []
            subjectAndTopics.forEach((s)=>{
                subjects.push({
                    title: s.title,
                    id: s.id
                })
            })
            setQuestionHomeState((currentState: QuestionHomeState)=>{
                const newState = {...currentState}
                newState.subjectsLoadStatus = 'loaded'
                newState.subjects = subjects
                newState.questions = currentState.questions
                return newState
            })
        }, () =>{
            setQuestionHomeState((currentState: QuestionHomeState)=>{
                const newState = {...currentState}
                newState.subjectsLoadStatus = 'failed'
                newState.questions = currentState.questions
                return newState
            })
        })
     },[questionHomeState.organiserId])

     let subjectDropdown = <></>
     if (questionHomeState.subjectsLoadStatus === 'loaded'){
        subjectDropdown = <select 
        onChange={(event)=>{
            setQuestionHomeState((currentState: QuestionHomeState)=>{
                const newState = {...currentState}
                newState.selectedSubjectId = event.target.value
                newState.subjects = currentState.subjects
                newState.questions = currentState.questions
                return newState
            })
        }}>
            <option value="">Select a subject</option>
            {
                questionHomeState.subjects.map((s)=>{
                    return <option 
                        key={s.id} 
                        value={s.id}>{s.title}</option>
                })
            }
        </select>
     }

     let selectSubjectButton = <Button name="Get questions" importance="primary" size="large"
            onClick={()=>{
                console.log('Subject selected::'+questionHomeState.selectedSubjectId)
                ExamService.listQuestionsByOrgIdAndTopic(
                    questionHomeState.organiserId,
                    questionHomeState.selectedSubjectId,
                    (questions: QuestionSummary[])=>{
                        const questionsForDisplay = questions.map((q)=>{
                            return {
                                questionId: q.id,
                                questionLines: q.questionLines
                            }
                        })
                        setQuestionHomeState((currentState: QuestionHomeState)=>{
                            const newState = {...currentState}
                            newState.questionsLoadStatus = 'loaded'
                            newState.questions = questionsForDisplay
                            newState.subjects = currentState.subjects
                            return newState
                        })
                    },
                    ()=>{}
                )
            }}/>

        let questionsArea = <></>
        if (questionHomeState.questionsLoadStatus === 'loaded'){
            questionsArea = <div>
                {
                    questionHomeState.questions.map((q)=>{
                        const qLine = q.questionLines.join("-")
                        return <div key={q.questionId}>
                            <span>{qLine}</span>
                        </div>
                    })
                }
            </div>
        }

     return (<div style={{backgroundColor:'white', paddingTop: 20}}>
        <div style={{display:'flex', flexDirection:'column'}}>
            <div>
                <h5>View your questions by topic</h5>
            </div>
            <div style={{display:'flex', flexDirection:'row', }}>
               <div style={{flex:1}}>{subjectDropdown}</div> 
               <div style={{flex:2}}>{selectSubjectButton}</div>
            </div>
            <div>
                {questionsArea}
            </div>
        </div>
    </div>)
}

export default QuestionsHome