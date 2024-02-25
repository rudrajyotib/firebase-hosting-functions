import {ExamInstanceResultDto} from "./ExamInstanceResultDto";

export type ExamInstanceSummaryDto = {
    id: string
    examineeId: string
    label: string
    status : string
    organiser: string
    result?: ExamInstanceResultDto
}
