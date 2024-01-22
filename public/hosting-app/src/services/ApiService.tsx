import axios, { AxiosResponse } from "axios"
import { error } from "console"

const ApiService = {

    makeCall : (successCallback : ()=> void)=>{
        axios.get('./api/api')
        .then((response : AxiosResponse)=>{
            console.log('Received response::'+JSON.stringify(response))
            successCallback()
        })
        .catch((error)=>{
            console.log('error calling api')
            console.log(error)
        })
    }

}


export default ApiService