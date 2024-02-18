
export type AssignedExamProp = {
    examId: string,
    examTitle : string,
    status : 'new' | 'attempted'
}

export type AssignedExamsListProps = {
 exams: AssignedExamProp[]   
}

