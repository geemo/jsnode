var ccap = require('ccap');

function generateText() {
    var text = '';
    var randomChar = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B',
        'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    for (var i = 0; i < 4; ++i) {
        var index = Math.floor(Math.random() * 36);
        text += randomChar[index];
    }

    return text;
}

var captcha = ccap({
    width: 90,
    height: 37,
    offset: 20,
    quality: 90,
    fontsize: 30,
    generate: generateText
});

module.exports = captcha;
