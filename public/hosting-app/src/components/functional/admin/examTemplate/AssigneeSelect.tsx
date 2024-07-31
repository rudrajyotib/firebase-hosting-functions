import { CheckboxInput } from "rb-base-element"

type AssigneeSelectProps = {
    assignees: {id: string, name: string, checked: boolean}[]
    checkHandler: (assignedExaminee: string) => void
    uncheckHandler: (assignedExaminee: string) => void
}

const AssigneeSelect = (props: AssigneeSelectProps) => {

    let checkBoxes = <div></div>

    if (props.assignees.length > 0 ){
        checkBoxes = <div>
            {props.assignees.map((e)=>{
            return <div key={`assigneeId${e.id}`} style={{display:'flex', flex:1}}>
                <CheckboxInput
                     checked={e.checked} 
                    label={e.name} id={e.id} 
                    key={`AssigneeSelectCb${e.id}`}
                    onCheck={(id:string)=>{
                        props.checkHandler(e.id)
                    }}
                    onUncheck={(id:string)=>{
                        props.uncheckHandler(e.id)
                    }}/>
            </div>
        })}
        </div>
    }


    return (<div style={{display:'flex', flex:1, flexDirection:'column'}}>
        {checkBoxes}
    </div>)
}

export default AssigneeSelect