import { Question } from "../model/Question"
import {source} from "../infra/DataSource"
import { logger } from "firebase-functions/v1"
const repository = source.repository

export const QuestionRepository = {
    getQuestion : async function  (questionId:string) : Promise<Question | undefined> {
        
        return repository.collection('questions').doc(questionId)
            .get()
            .then(snapshot => {
                const questionData = snapshot.data()
                
                if (questionData){
                    logger.log(questionData)
                    const result: Question = {
                        format: questionData['format'],
                        questionLines: questionData['questionLines'],
                        options : questionData['options'],
                        correctOptionIndex: questionData['correctOptionIndex']
                    }
                    return result
                }
                return undefined
            })
            .catch(() => {
                return undefined
            })
        
    }
}