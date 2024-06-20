import { Link } from "react-router-dom"

const AdminHome = () => {



    return (<div>
        <div style={{display:'flex', flexDirection:'column'}}>
            <div><Link to={"subjects"}>Manage subjects and topics</Link></div>
            <div><Link to={"questions"}>Manage questions</Link></div>
            <div><Link to={"addSingleQuestion"}>Add single question</Link></div>
            <div><Link to={"addsyllabus"}>Create syllabus</Link></div>
            <div>Manage syllabus</div>
            <div>Manage exams</div>
            <div>Manage questions</div>
        </div>
    </div>)
}

export default AdminHome