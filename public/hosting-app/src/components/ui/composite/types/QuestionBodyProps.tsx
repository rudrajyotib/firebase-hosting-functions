type QuestionBodyProps  = {
    textLines : string[],
    displayType: 'textOnly' | 'textImage',
    options: {value:string, label:string}[]
    onSelect : (selectedOption: string) => void
}

export default QuestionBodyProps