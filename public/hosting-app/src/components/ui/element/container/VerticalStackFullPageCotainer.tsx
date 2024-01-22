import styled from "styled-components";

const VerticalStackFullPageContainerStyle = styled.div`

    border: 1px solid #cbcdcf;
    border-radius: 0.25rem; 
    width:80%;
    margin: auto;
    height:100%;
    flex:1;
    flex-direction:column;
    display:flex;
    background-color:beige;

   
    @media (max-width:768px){
        width:100%;
    }
    
    @media only screen and (min-device-width: 769px) and (max-device-width: 1024px) and (orientation:portrait) {
        width:90%;
      }
    
      @media (min-width:1024px){
        width:1024px;
    }
`

const VerticalStackFullPageContainer = (props:any) => {
    return (
        <VerticalStackFullPageContainerStyle>
            {props.children}
        </VerticalStackFullPageContainerStyle>
    )
}

export default VerticalStackFullPageContainer