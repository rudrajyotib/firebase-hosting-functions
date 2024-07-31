
import { Button } from "rb-base-element"
import { ExamTemplateSummary } from "../../../../services/types/domain/ExamData"

type ExamTemplateSummaryViewProp = {
    summary: ExamTemplateSummary,
    assignHandler: (examTemplateId: string)=>void
}
const ExamTemplateSummaryView = (props:ExamTemplateSummaryViewProp ) =>{
    return (
    <div style={{display:'flex', flex:1, flexDirection:'column'}}>
        <div style={{display:'flex', flex: 1, flexDirection:'row', backgroundColor:'wheat', 
                paddingTop: '5px', paddingBottom:'5px', marginTop:'5px', marginBottom:'5px'}}>
            <div style={{display:'flex', flex: 1}}><span style={{paddingRight:'4px'}}>Grade:</span><span>{props.summary.grade}</span></div>
            <div style={{display:'flex', flex: 1}}><span style={{paddingRight:'4px'}}>Subject:</span><span>{props.summary.subject}</span></div>
            <div style={{display:'flex', flex: 4}}><span>{props.summary.title}</span></div>
            <div style={{display:'flex', flex: 1}}>
                <Button name="assign" importance="primary" size="small" onClick={()=>{
                    props.assignHandler(props.summary.id)
                }}/>
            </div>
        </div>
    </div>)
}

export default ExamTemplateSummaryView