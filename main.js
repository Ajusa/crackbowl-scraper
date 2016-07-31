var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var mkpath = require('mkpath');
var obj = [];
var words = ["mention", "is", "either", "before", "or", "accept", "like", "answers", "[", "]", "on", "until", "it", "mentioned", "synonyms", "the", "do", "any", "kind", "of", "mention", "a"];
var chars = [".", "[", "]", ",", "(", ")", ";", '"'];
<<<<<<< HEAD
<<<<<<< HEAD
var subjects = ["Literature", "History", "Science", "Fine Arts", "Religion", "Mythology", "Philosophy", "Social Science", "Geography", "Current Events", "Trash"]
var levels = ["College", "HS", "MS"]
var heading;
for (var i = levels.length - 1; i >= 0; i--) {
    for (var j = subjects.length - 1; j >= 0; j--) {
        obj = [];
        makeJson(buildUrl(subjects[j], levels[i]), levels[i] + "/", subjects[j], levels[i])
    }

}
=======
=======
>>>>>>> parent of 8319da3... Added tourney headings
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
>>>>>>> parent of 8319da3... Added tourney headings

function buildUrl(subject, level) {
    return "http://www.quinterest.org/php/searchDatabase.php?limit=20&info=&categ=" + encodeURIComponent(subject) + "&sub=None&stype=Answer&qtype=Tossup&difficulty=" + encodeURIComponent(level) + "&tournamentyear=All"
}

function makeJson(url, file, subject, level) {
    mkpath(file)
    request(url, function(error, response, body) {
        $ = cheerio.load(body);
        $('div.col-md-12').each(function(i, elem) {
            var raw = $(this).find('p').next().text();
            heading = $(this).find('p').find('b').text();
            heading = heading.slice(heading.indexOf("|") + 2, heading.length);
            if (raw.indexOf("ANSWER:") == -1 || raw.split("ANSWER:")[0].indexOf("*") > -1) {} else {
                var arr = [];
                var answer = raw.split("ANSWER:")[1];
                answer = answer.trim();
                var finalObj = {
                    answerText: answer,
                    prompts: [],
                    heading: heading,
                    subject: subject,
                    level: level,
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
        fs.writeFile(file + subject + ".json", JSON.stringify(obj, null, "\t"), function(err) {});
    })

}
