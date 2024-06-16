import { Link } from "react-router-dom"

const AllQuestionsAnswered = () => {

    return (<div style={{display:'flex', flexDirection:'column', flex:1}}>

        <div>All questions are answered. Good job. Evaluating now.</div>
        <div><Link to={"/"}>home</Link></div>
    </div>)


}

export default AllQuestionsAnswered