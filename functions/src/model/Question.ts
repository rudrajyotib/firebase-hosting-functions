export type Question = {
    format: "textOnly" | "textWithImage",
    questionLines : string[],
    options: string[],
    correctOptionIndex : number
}

