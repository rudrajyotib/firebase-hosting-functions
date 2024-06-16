import Banner from "../element/container/Banner"
import QuestionIndexProps from "./types/QuestionIndexProps"

const QuestionIndex = (props:QuestionIndexProps) => {
    return (
        <>
            <Banner text={`Question ${props.currentIndex+1} of ${props.totalQuestions}`}/>
        </>
    )
}

export default QuestionIndex