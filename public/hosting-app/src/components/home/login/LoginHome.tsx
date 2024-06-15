import { useState } from "react"
import { CandidateLoginState } from "../types/LoginPropsAndStates"
import { Button, TextInput } from "rb-base-element"
import LoginService from "../../../services/LoginService"
import { StudentUserContext } from "../../../services/types/domain/UserData"
import { useNavigate } from "react-router-dom"

const LoginHome = (props: any) => {

    const navigate = useNavigate()

    const [loginState, setLoginState] = useState<CandidateLoginState> ({
        status: 'NotAttempted',
        userName: '',
        attemptCount: 0,
        examineeId: ''
    })

    var successMessage = <></>
    if (loginState.status === 'LoggedIn') {
        successMessage = <div style={{backgroundColor:'green'}}>
            Logged In !!!
        </div>
    }

    return (
        <div> 
            <TextInput 
                name="CandidateLoginName" 
                onChangeHandler={(text:string)=>{
                    setLoginState((presentState: CandidateLoginState)=>{
                        const newState: CandidateLoginState = { ...presentState }
                        newState.userName = text
                        return newState
                    })
                }}
                placeHolderText="Your name here"
                textType="alphanumeric"
                value=""
                />
            <Button importance="primary" name="Login" onClick={()=>{
                LoginService.authenticateStudent(loginState.userName,
                    (response: StudentUserContext) => {
                        setLoginState((currentState: CandidateLoginState) => {
                        const newState: CandidateLoginState = { ...currentState }
                        newState.status = "LoggedIn"
                        return newState
                        })
                        navigate("/home")
                    }
                )
            }}/>
            {successMessage}
        </div>
    )
}

export default LoginHome