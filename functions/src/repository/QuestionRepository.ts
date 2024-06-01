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
            })
            .catch((e)=>{
                console.error("Error adding question in repository ", e);
            });
        return response;
    },

    addTopicIdToQuestion: async function(questionId: string, topicId: string): Promise<RepositoryResponse<string>> {
        const response: RepositoryResponse<string> = {
            responseCode: -1,
            data: "",
        };
        const questionRef: FirebaseFirestore.DocumentReference<Question> = repository
            .collection("Question")
            .withConverter(QuestionConverter)
            .doc(questionId);
        const questionDoc: FirebaseFirestore.DocumentSnapshot<Question> = await questionRef.get();
        if (!questionDoc.exists) {
            response.responseCode = 1;
            response.data = "QuestionId is not valid";
            return response;
        }
        const question: Question | undefined = questionDoc.data();
        if (question === undefined) {
            response.responseCode = 2;
            response.data = "Question could not be retrieved";
            return response;
        }
        const topicSet: Set<string> = new Set(question.topics);
        topicSet.add(topicId);
        question.topics = [...topicSet];
        await questionRef.set(question, {mergeFields: ["topics"]})
            .then(()=>{
                response.responseCode = 0;
            })
            .catch((err)=>{
                console.error("Repository could not add topicId to question", err);
                response.responseCode = -1;
                response.data = "Repository could not add topicId to question";
            });
        return response;
    },

    existQuestion: async (questionId: string): Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        await repository.collection("Question")
            .doc(questionId)
            .get()
            .then((data)=>{
                if (data.exists) {
                    response.data = true;
                    response.responseCode = 0;
                }
            })
            .catch((err)=>{
                console.error("Error in repository querying for Question", err);
                response.responseCode=1;
            });
        return response;
    },
};
