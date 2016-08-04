var cheerio = require('cheerio');
var fs = require('fs');
var firebase = require("firebase");
firebase.initializeApp({
    databaseURL: "https://crackbowl-3dd7d.firebaseio.com/",
});
var db = firebase.database();
var ref = db.ref("/questions");
var request = require('request');

var obj = {};
var words = ["mention", "is", "either", "before", "or", "accept", "like", "answers", "[", "]", "on", "until", "it", "mentioned", "synonyms", "the", "do", "any", "kind", "of", "mention", "a"];
var chars = [".", "[", "]", ",", "(", ")", ";", '"'];
var heading;
request("http://www.quinterest.org/php/searchDatabase.php?limit=&info=&categ=All&sub=None&stype=Answer&qtype=Tossups&difficulty=HS&tournamentyear=All", function(error, response, body) {
    $ = cheerio.load(body);
    $('div.col-md-12').each(function(i, elem) {
        var raw = $(this).find('p').next().text();
        heading = $(this).find('p').find('b').text();
        heading = heading.slice(heading.indexOf("|") + 2, heading.length);
        if (raw.indexOf("ANSWER:") == -1 || raw.split("ANSWER:")[1].trim() == "") {} else {
            var arr = [];
            var answer = raw.split("ANSWER:")[1];
            answer = answer.trim();
            var finalObj = {
                answerText: answer,
                prompts: [],
                heading: heading,
            }
            text = heading.split("|");
            finalObj.level = "HS"
            finalObj.subject = text[text.length - 1].trim() //biology
            finalObj.topic = text[text.length - 2].trim() //science
            for (var i = chars.length - 1; i >= 0; i--) {
                newanswer = answer;
                do {
                    answer = newanswer;
                    newanswer = answer.replace(chars[i], " ");
                }
                while (newanswer != answer);
            }

            for (var i = words.length - 1; i >= 0; i--) {
                answer = answer.split(" " + words[i] + " ").join(" ");
            }
            arr = answer.split(" ");
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i] == "") {
                    arr.splice(i, 1)
                }
            }
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i].search(/prompt/i) == -1) {

                } else {
                    finalObj.prompts = arr.slice(i + 1, arr.length + 1);
                    arr.splice(i, arr.length)
                }

            }
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i].search(/not/i) == -1) {

                } else {
                    arr.splice(i, arr.length)
                }
            }
            finalObj.question = raw.split("ANSWER:")[0];
            arr = arr.filter(function(value, index, array) {
                return array.indexOf(value) == index;
            });
            finalObj.answers = arr;
            obj[finalObj.topic] = obj[finalObj.topic] || {};
            obj[finalObj.topic].list = obj[finalObj.topic].list || [];
            obj[finalObj.topic].list.push(finalObj)
            obj[finalObj.topic].count = obj[finalObj.topic].list.length
        }
    });
    fs.writeFile("output.json", JSON.stringify({questions:obj}, null, "\t"), function(err) {
        console.log("The file was saved!");
    });
    //ref.set(obj);
});
