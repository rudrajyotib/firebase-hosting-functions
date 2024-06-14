import { useState } from "react"
import { CandidateLoginState } from "../types/LoginPropsAndStates"
import { Button, TextInput } from "rb-base-element"

const LoginHome = (props: any) => {

    const [loginState, setLoginState] = useState<CandidateLoginState> ({
        status: 'NotAttempted',
        userName: '',
        attemptCount: 0
    })


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
                
            }}/>
        </div>
    )
}

export default LoginHome