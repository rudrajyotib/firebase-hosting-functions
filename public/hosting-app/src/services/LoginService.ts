import axios, { AxiosResponse } from "axios";
import { StudentUserContext } from "./types/domain/UserData";
import { SearchUserResponse } from "./types/api/UserApi";

const LoginService = {
    authenticateStudent : (userName: string, 
            successCallback: (response: StudentUserContext) => void,
    ) => {
        axios.get("/api/user/userByName?userName="+userName)
            .then((res: AxiosResponse) => {
                const status = res.status;
                if (status === 200 ) {
                    const user: SearchUserResponse = res.data;
                    const studentUserContext: StudentUserContext = {
                        userId: user.userId,
                        examineeId: user.entityId
                    }
                    localStorage.setItem('examineeId', studentUserContext.examineeId)
                    successCallback(studentUserContext);
                } else {
                    console.error("Login failed");
                }
            })
            .catch ((e)=>{
                console.error("Login failed with exception", e);
            })
    }
}

export default LoginService