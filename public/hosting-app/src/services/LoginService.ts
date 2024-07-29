import axios, { AxiosResponse } from "axios";
import { UserContext } from "./types/domain/UserData";
import { SearchUserResponse } from "./types/api/UserApi";

const LoginService = {
    authenticateStudent : (userName: string, 
            successCallback: (response: UserContext) => void,
    ) => {
        axios.get("/api/user/userByName?userName="+userName)
            .then((res: AxiosResponse) => {
                const status = res.status;
                if (status === 200 ) {
                    const user: SearchUserResponse = res.data;
                    const userContext: UserContext = {
                        userId: user.userId,
                        entityId: user.entityId
                    }
                    localStorage.setItem('entityId', userContext.entityId)
                    successCallback(userContext);
                } else {
                    console.error("Login failed");
                }
            })
            .catch ((e)=>{
                console.error("Login failed with exception", e);
            })
    },
    examineeSearchService : (userName: string, 
        successCallback: (response: UserContext) => void,
) => {
    axios.get("/api/user/userByName?userName="+userName)
        .then((res: AxiosResponse) => {
            const status = res.status;
            if (status === 200 ) {
                const user: SearchUserResponse = res.data;
                const userContext: UserContext = {
                    userId: user.userId,
                    entityId: user.entityId
                }
                localStorage.setItem('entityId', userContext.entityId)
                successCallback(userContext);
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