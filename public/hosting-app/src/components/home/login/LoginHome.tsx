import { useState } from "react"
import { LoginState } from "../types/LoginPropsAndStates"
import { Button, TextInput } from "rb-base-element"
import LoginService from "../../../services/LoginService"
import { UserContext } from "../../../services/types/domain/UserData"
import { useNavigate } from "react-router-dom"

const LoginHome = (props: any) => {

    const navigate = useNavigate()

    const [loginState, setLoginState] = useState<LoginState> ({
        status: 'NotAttempted',
        userName: '',
        attemptCount: 0,
        examineeId: '',
        userType: 'NotAttempted'
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
                    setLoginState((presentState: LoginState)=>{
                        const newState: LoginState = { ...presentState }
                        newState.userName = text
                        return newState
                    })
                }}
                placeHolderText="Your name here"
                textType="alphanumeric"
                value=""
                />
                <div style={{display:'flex'}}>
            <Button importance="primary" name="Candidate login" onClick={()=>{
                LoginService.authenticateStudent(loginState.userName,
                    (response: UserContext) => {
                        setLoginState((currentState: LoginState) => {
                        const newState: LoginState = { ...currentState }
                        newState.status = "LoggedIn"
                        newState.userType = 'Candidate'
                        return newState
                        })
                        navigate("/home")
                    }
                )
            }}/>
            <Button importance="primary" name="Admin Login" onClick={()=>{
                LoginService.authenticateStudent(loginState.userName,
                    (response: UserContext) => {
                        setLoginState((currentState: LoginState) => {
                        const newState: LoginState = { ...currentState }
                        newState.status = "LoggedIn"
                        newState.userType = 'Admin'
                        return newState
                        })
                        navigate("/admin")
                    }
                )
            }}/>
            </div>
            {successMessage}
        </div>
    )
}

export default LoginHome