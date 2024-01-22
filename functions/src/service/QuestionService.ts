import { error } from "firebase-functions/logger";
import { Question } from "../model/Question";
import { QuestionRepository } from "../repository/QuestionRepository";

export const QuestionService = {
    getQuestion: async function (questionId: string) : Promise<Question | undefined> {
        return QuestionRepository.getQuestion(questionId)
        .then(question => {
            if (question){
                return question
            }
            throw error('Question could not be retrieved')
        })
        .catch(()=>{
            throw error('Question could not be retrieved')
        })
    }
}