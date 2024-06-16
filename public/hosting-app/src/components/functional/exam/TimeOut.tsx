import { Link } from "react-router-dom"

const TimeOut = () => {
    return (<div style={{display:'flex', flexDirection:'column', flex:1}}>
        <div>Oh ho !!! Your time is up !!!</div>
        <div><Link to={"/exam/evaluate"}>Proceed to evaluate</Link></div>
        </div>)
}

export default TimeOut