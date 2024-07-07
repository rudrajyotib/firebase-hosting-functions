import { ExamTemplateSummary } from "../../../../services/types/domain/ExamData"

type ExamTemplateSummaryViewProp = {
    summary: ExamTemplateSummary
}
const ExamTemplateSummaryView = (props:ExamTemplateSummaryViewProp ) =>{
    return (<div style={{display:'flex', flexDirection:'row'}}>
        <div style={{display:'flex', flex: 1}}><span>{props.summary.subject}</span></div>
        <div style={{display:'flex', flex: 4}}><span>{props.summary.title}</span></div>
    </div>)
}

export default ExamTemplateSummaryView