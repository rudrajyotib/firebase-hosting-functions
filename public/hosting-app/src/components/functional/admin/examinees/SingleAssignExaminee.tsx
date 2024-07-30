
type AssignedExamineeProp = {
    id: string,
    name: string
}

const SingleAssignedExaminee = (props: AssignedExamineeProp) => {

  
    return (<div style={{display:'flex', flex:1, flexDirection: 'row', backgroundColor: 'white', marginTop: 5, marginBottom:5}}>
       <div style={{fontWeight:'bold'}}>{props.name}</div>
    </div>)
}

export default SingleAssignedExaminee