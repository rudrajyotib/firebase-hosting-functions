/* eslint-disable max-len */
import {Question} from "../model/Question";
import {source} from "../infra/DataSource";
import {QuestionConverter} from "./converters/QuestionConverter";
import {RepositoryResponse} from "./data/RepositoryResponse";
const repository = source.repository;

export const QuestionRepository = {
    getQuestion: async function(questionId: string):
        Promise<RepositoryResponse<Question>> {
        const response: RepositoryResponse<Question> = {
            responseCode: -1,
            data: undefined,
        };
        await repository
            .collection("Question")
            .withConverter(QuestionConverter)
            .doc(questionId)
            .get()
            .then((snapshot) => {
                response.data = snapshot.data();
                response.responseCode = 0;
            })
            .catch(() => {
                response.responseCode = -1;
            });
        return response;
    },

    addQuestion: async function(question: Question): Promise<RepositoryResponse<string>> {
        const response: RepositoryResponse<string> = {
            responseCode: -1,
            data: "",
        };
        await repository
            .collection("Question")
            .withConverter(QuestionConverter)
            .add(question)
            .then((questionRef: FirebaseFirestore.DocumentReference<Question>)=>{
                response.responseCode = 0;
                response.data = questionRef.id;
            });
        return response;
    },
};
