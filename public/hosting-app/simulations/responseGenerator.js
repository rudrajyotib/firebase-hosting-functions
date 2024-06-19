function acceptAnswerSubmissionHappyPathOnly(paramName, questionIndexParam){
    var questionAnswers = [
        {
            responseCode:0,
            data: {
                allAnswered:false,
                nextQuestion:{
                    question:{
                        displayFormat: "Text" ,
                        questionLines: ["Which city is the capital of India?"], 
                        options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"],
                        "questionId": "Q2"
                    },
                    id:"Q2"
                },
                questionIndex: 1,
                indexAtLastQuestion: false,
                secondsRemaining: 200
            }
        },
        {
            responseCode:0,
            data: {
                allAnswered:false,
                nextQuestion:{
                    question:{
                        displayFormat: "Text" ,
                        questionLines: ["Which city is the capital of India?"], 
                        options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"],
                        "questionId": "Q2"
                    },
                    id:"Q3"
                },
                questionIndex: 2,
                indexAtLastQuestion: false,
                secondsRemaining: 200
            }
        },
        {
            responseCode:0,
            data: {
                allAnswered:false,
                nextQuestion:{
                    question:{
                        displayFormat: "Text" ,
                        questionLines: ["Which city is the capital of India?"], 
                        options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"],
                        "questionId": "Q2"
                    },
                    id:"Q2"
                },
                questionIndex: 3,
                indexAtLastQuestion: true,
                secondsRemaining: 200
            }
        },
        {
            responseCode: 0,
            data: {
                allAnswered: true,
                secondsRemaining: -1,
                questionIndex: 3,
                indexAtLastQuestion: true
            }
        }
    ]
    var questionId = '' + _context.getValue(paramName);
    var questionIndex = parseInt(_context.getValue(questionIndexParam));
    // ++questionIndex;
    // var questionIndex = parseInt(questionId.substring(1))-1
    var x = questionAnswers[questionIndex]
    return JSON.stringify(x)
}

function userDetails(paramName) {
    var userDetails = {
        "userId": "user1",
        "entityId": "entity1"
      }
    return JSON.stringify(userDetails)
}

function evaluate() {
    var x =  {
        examineeId: "SEerLPp7RFHQCjDsHaDK",
        examInstanceId: "UWd99f3tNBjgvyOnmI1w",
        totalMarks: 6,
        totalScore: 2
      }
    return JSON.stringify(x)
}

function startExam(examInstanceId) {
    var questionId = '' + _context.getValue(examInstanceId);
    var startExamResponse = {
        responseCode:0, 
        data:{
            nextQuestion:{
                displayFormat: "Text" ,
                questionLines: ["Question Line 1 Says - When did India get independence", "from the British rule?"], 
                options: ["1947", "1946", "1944", "1943"],
                questionId: "Q1"
            }, 
            secondsRemaining:1200,
            questionId: "Q1",
            totalQuestions: 4,
            questionIndex: 0
        }
   }
   if (questionId === "examInstance1") {
        startExamResponse.data.secondsRemaining = 5
    }
   return JSON.stringify(startExamResponse)
}

function listOfSubjectAndTopics(){
    var subjects=[
        {
          grade: 3,
          subject: "English",
          title: "Grade 3 English Tense Easy",
          id: "Sub1",
          topic: "Tenses"
        },
        {
          grade: 3,
          subject: "English",
          title: "Grade 3 English Verbs Easy",
          id: "Sub1",
          topic: "Verbs"
        }
      ]
    return JSON.stringify(subjects);
}