import { Outlet } from "react-router-dom"
import VerticalStackFullPageContainer from "../../ui/element/container/VerticalStackFullPageCotainer"

const CommonLayout = (props:any) =>{
    return (<>
        <VerticalStackFullPageContainer>
            <div>Prepare MCQ ... as many as you want. literally.</div>
            <Outlet/>
        </VerticalStackFullPageContainer>
    </>)
}

export default CommonLayout