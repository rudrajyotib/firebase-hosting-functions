/* eslint-disable max-len */
import {Question} from "../model/Question";
import {source} from "../infra/DataSource";
import {QuestionConverter} from "./converters/QuestionConverter";
import {RepositoryResponse} from "./data/RepositoryResponse";
import {SubjectAndTopicConverter} from "./converters/SubjectAndTopicsConverter";
import {SubjectAndTopic} from "../model/SubjectAndTopic";
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

    getQuestionByOrganiserAndTopic: async function(organiserId: string, topicId: string)
        : Promise<RepositoryResponse<Question[]>> {
        const response: RepositoryResponse<Question[]> = {
            responseCode: -1,
        };
        const questions: Question[] = [];
        let orgBasedQuery: FirebaseFirestore.Query<Question> = repository
            .collection("Question")
            .withConverter(QuestionConverter)
            .where("orgainserId", "==", organiserId);
        if (topicId != undefined && topicId.trim() !== "") {
            orgBasedQuery = orgBasedQuery.where("topics", "array-contains", topicId);
        }
        await orgBasedQuery
            .get()
            .then((snapshot: FirebaseFirestore.QuerySnapshot<Question>)=>{
                snapshot.forEach((element)=>{
                    questions.push(element.data());
                });
                response.data = questions;
                response.responseCode = 0;
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

    addQuestionsWithTopicInBatch: async (questions: Question[], topicId: string):
     Promise<RepositoryResponse<boolean>> =>{
        const response: RepositoryResponse<boolean> = {responseCode: -1, data: false};
        const createBatch = repository.batch();
        const subjectAndTopicRef: FirebaseFirestore.DocumentReference<SubjectAndTopic> =
            repository.collection("SubjectAndTopic").withConverter(SubjectAndTopicConverter).doc(topicId);
        const subjectAndTopicDoc: FirebaseFirestore.DocumentSnapshot<SubjectAndTopic> = await subjectAndTopicRef.get();
        if (subjectAndTopicDoc.exists === false ) {
            response.responseCode = 1;
            console.error("QustionRepository.addQuestionsWithTopicInBatch: Topic with ID:"+topicId+":not found");
            return response;
        }
        const subjectAndTopic: SubjectAndTopic | undefined = subjectAndTopicDoc.data();
        if (subjectAndTopic == undefined) {
            response.responseCode = 2;
            console.error("QustionRepository.addQuestionsWithTopicInBatch: Topic with ID:"+topicId+":doc is empty");
            return response;
        }
        questions.forEach((q)=>{
            const ref = repository
                .collection("Question")
                .withConverter(QuestionConverter)
                .doc();
            subjectAndTopic.questionIds.push({id: ref.id, active: true});
            createBatch.create(ref, q);
        });
        createBatch.set(subjectAndTopicRef, subjectAndTopic, {mergeFields: ["questionIds"]});
        await createBatch.commit()
            .then(()=>{
                response.responseCode = 0;
                response.data = true;
            })
            .catch((e)=>{
                response.responseCode = -1;
                response.data = false;
                console.error("QustionRepository.addQuestionsWithTopicInBatch: Batch failed for Topic:"+topicId+"", e);
            });
        return response;
    },
};
