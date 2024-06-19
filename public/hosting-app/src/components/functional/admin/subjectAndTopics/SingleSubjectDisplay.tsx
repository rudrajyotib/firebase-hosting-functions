import { SingleSubjectAndTopicDisplayProp } from "../../types/SubjectAndTopicDisplayProps"

const SingleSubjectDisplay = (props: SingleSubjectAndTopicDisplayProp) => {
    return (<div style={{display:'flex', flexDirection:'column', backgroundColor:'white', paddingTop:'5px', margin:'10px'}}>
       <div style={{display:'flex'}}>
            <h4>{props.title}</h4>
       </div>
       <div style={{display:'flex', flexDirection:'row', flex:1}}>
            <div style={{display:'flex', flexDirection:'row', flex:1, alignItems:'center'}}>
                <div><h5 style={{paddingRight:'4px'}}>Grade:</h5></div>
                <div><span>{props.grade}</span></div>
            </div>
            <div style={{display:'flex', flexDirection:'row', flex:1, alignItems:'center'}}>
                <div><h5 style={{paddingRight:'4px'}}>Subject:</h5></div>
                <div><span>{props.subject}</span></div>
            </div>
            <div style={{display:'flex', flexDirection:'row', flex:1, alignItems:'center'}}>
                <div><h5 style={{paddingRight:'4px'}}>Topic:</h5></div>
                <div><span>{props.topic}</span></div>
            </div>
       </div>
    </div>)
}

export default SingleSubjectDisplay