function acceptAnswerSubmissionHappyPathOnly(paramName){
    var questionAnswers = [
        {
            responseCode:0,
            allAnswered:false,
            nextQuestion:{
                question:{
                    displayFormat: "Text" ,
                    questionLines: ["Which city is the capital of India?"], 
                    options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"]
                },
                id:"Q2"
            },
            secondsRemaining: 200
        },
        {
            responseCode:0,
            allAnswered:false,
            nextQuestion:{
                question:{
                    displayFormat: "Text" ,
                    questionLines: ["Which city is the capital of India?"], 
                    options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"]
                },
                id:"Q3"
            },
            secondsRemaining: 120
        },
        {
            responseCode:0,
            allAnswered:false,
            nextQuestion:{
                question:{
                    displayFormat: "Text" ,
                    questionLines: ["Which city is the capital of India?"], 
                    options: ["Kolkata", "Bengaluru", "New Delhi", "Mumbai"]
                },
                id:"Q4"
            },
            secondsRemaining: 20
        },
        {
            responseCode:0,
            allAnswered:true
        }
    ]
    var questionId = '' + _context.getValue(paramName);
    var questionIndex = parseInt(questionId.substring(1))-1
    var x = questionAnswers[questionIndex]
    return JSON.stringify(x)
}