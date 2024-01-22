import Banner from "../element/container/Banner"
import QuestionIndexProps from "./types/QuestionIndexProps"

const QuestionIndex = (props:QuestionIndexProps) => {
    return (
        <>
            <Banner text={`${props.currentIndex} of ${props.totalQuestions}`}/>
        </>
    )
}

export default QuestionIndex