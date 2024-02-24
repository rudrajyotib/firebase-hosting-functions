export type QuestionDisplay = {
    questionLines: string[],
    options: { value: string, label: string }[],
    questionId: string,
    selectedOption: number
}

export type QuestionAnswerConsoleProps = {
    question: QuestionDisplay,
    questionIndex: number,
    totalQuestions: number,
    onAnswerSubmit: (radioOption: number) => void
}