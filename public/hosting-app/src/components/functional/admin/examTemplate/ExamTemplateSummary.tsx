import { Button, TextInput } from "rb-base-element"
import { ExamTemplateSummary } from "../../../../services/types/domain/ExamData"

type ExamTemplateSummaryViewProp = {
    summary: ExamTemplateSummary
}
const ExamTemplateSummaryView = (props:ExamTemplateSummaryViewProp ) =>{
    return (
    <div style={{display:'flex', flex:1, flexDirection:'column'}}>
        <div style={{display:'flex', flex: 1, flexDirection:'row', backgroundColor:'wheat', 
                paddingTop: '5px', paddingBottom:'5px', marginTop:'5px', marginBottom:'5px'}}>
            <div style={{display:'flex', flex: 1}}><span style={{paddingRight:'4px'}}>Grade:</span><span>{props.summary.grade}</span></div>
            <div style={{display:'flex', flex: 1}}><span style={{paddingRight:'4px'}}>Subject:</span><span>{props.summary.subject}</span></div>
            <div style={{display:'flex', flex: 4}}><span>{props.summary.title}</span></div>
            <div style={{display:'flex', flex: 1}}><Button name="Add assignee" size="medium" importance="secondary" onClick={()=>{

            }}/></div>
        </div>
        <div style={{display:'flex', flex:1, visibility:'visible'}}>
            <div>Name:</div>
            <div><TextInput name="examineeSearch" onChangeHandler={(text:string)=>{}} placeHolderText="Name" textType="alphanumeric" value="" /></div>
            <div><Button name="Search" importance="primary" size="small" onClick={()=>{}}/></div>
        </div>
    </div>)
}

export default ExamTemplateSummaryView