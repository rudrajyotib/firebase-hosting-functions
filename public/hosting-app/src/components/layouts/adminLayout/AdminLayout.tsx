import { Outlet } from "react-router-dom"
import VerticalStackFullPageContainer from "../../ui/element/container/VerticalStackFullPageCotainer"

const AdminLayout = (props:any) =>{
    return (<>
        <VerticalStackFullPageContainer>
            <div><h3>Manage your organisation</h3></div>
            <Outlet/>
        </VerticalStackFullPageContainer>
    </>)
}

export default AdminLayout