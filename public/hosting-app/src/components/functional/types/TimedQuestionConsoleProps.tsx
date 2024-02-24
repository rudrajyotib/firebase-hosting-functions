import { QuestionAnswerConsoleProps } from "./QuestionConsoleProps"

export type TimedQuestionConsoleProps = {
    questionAnswerConsole : QuestionAnswerConsoleProps,
    secondsRemaining: number,
    onTimeout: () => void
}