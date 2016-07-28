var cheerio = require('cheerio');
var fs = require('fs');
var obj = [];
var words = ["mention", "is", "either", "before", "or", "accept", "like", "answers", "[", "]", "on", "until", "it", "mentioned", "synonyms", "the", "do", "any", "kind", "of", "mention", "a"];
var chars = [".", "[", "]", ",", "(", ")", ";", '"'];
fs.readFile('source.html', 'utf8', function(err, contents) {
    $ = cheerio.load(contents);
    $('div.col-md-12').each(function(i, elem) {
        var raw = $(this).find('p').next().text();
        if (raw.indexOf("ANSWER:") == -1) {} else {
            var arr = [];

            var answer = raw.split("ANSWER:")[1];
            answer = answer.trim();
            var finalObj = {
                answerText: answer,
                prompts: [],
            }
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
            obj.push(finalObj)
        }
    });
    fs.writeFile("output.json", JSON.stringify(obj, null, "\t"), function(err) {
        console.log("The file was saved!");
    });
});
