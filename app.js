const TelegramBot = require('node-telegram-bot-api')
const getData = require('./test.js')

const TOKEN = '<TOKEN_ID>'

const bot = new TelegramBot(TOKEN, {
    polling:{
        interval: 300,
        autoStart:true,
        params:{
            timeout:10
        }

    }
})


const request = require('request');

bot.onText(/\/start/, msg=>{
    const {id} = msg.chat
    const {first_name} = msg.from
    bot.sendMessage(id, `Hello, ${first_name}`)

}
)

bot.onText(/\/word(.+)/, (msg, [source, match])=>{
    const {id} = msg.chat;
    console.log("ID   :", id);
    sendCard(id, match);
})

bot.onText(/\/add(.+)/, (msg, [source, match]) => {
    const {id} = msg.chat;
    const message = msg.text.replace(/"/g,  "").replace("/add", "");
    const before = message.slice(0, message.indexOf('\n')).trim();
    const after = message.slice(message.indexOf('\n') + 1);
    console.log(before);
    console.log("-------------------------------");
    console.log(after);

    const headers = {
        'authority': 'ankiuser.net',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'cookie': 'ankiweb=eyJrIjogIlNzMVVtRjAzRzc1QmJLV2MiLCAiYyI6IDIsICJ0IjogMTY3NjQ3NjUwMX0.oRT0lctxyE1FxF2w9p74PvCWxtDPYi8uAjO2k8m57OM',
        'origin': 'https://ankiuser.net',
        'referer': 'https://ankiuser.net/edit/',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
    };
    const dt = encodeURIComponent(before) +"=" + encodeURIComponent(after);
    console.log(dt);
    var dataString = `nid=&data=${dt}&csrf_token=eyJvcCI6ICJlZGl0IiwgImlhdCI6IDE2NzY0NzY1MDcsICJ1aWQiOiAiYjc4MjgxZjgifQ.fi4h5CfNwBpS8UOmGJaCq0yIX239Cgf06kWYECpaGgM&mid=1445149831387&deck=1570820542946`;
    
    var options = {
        url: 'https://ankiuser.net/edit/save',
        method: 'POST',
        headers: headers,
        body: dataString
    };
    
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log("READY");
        }
    }
    request(options, callback);
    
})

bot.on('inline_query', query=>{
    console.log(query.query)
    sendInlineCard(query.id, query.query)
})

function deleteSpaces(word){
    return word? word.trim():''
}

function sendCard(chatId, word){
    getData(deleteSpaces(word)).then(result => {
        if(Object.keys(result).length===0){
            bot.sendMessage(chatId, "Try another word. There's no such a word in our dictionary")
            return
        }
        const keys = Object.keys(result)
        const response = keys.map(dic =>{
            const value = result[dic]
            const pairs = value.pairs
            const pairs_keys = Object.keys(pairs)
            const explanations = pairs_keys.map(word=>{
                const value = pairs[word]
                return `<strong>${word?`-----${word}\n`:''}</strong>${value}\n`
            }).join('\n')
            return `<b>${dic.trim()?`#${dic}`:''}</b> <b>${value.word?`\n${value.word}`:''}</b>${value.pron_us?`\nUS: [${value.pron_us}]`:''}  ${value.pron_uk?`UK:[${value.pron_uk}]`:''}\n${explanations}`
        }).join('\n')

        bot.sendMessage(chatId, response, {parse_mode: 'HTML'})
    })
}

function sendInlineCard(chatId, word){
    getData(deleteSpaces(word)).then(result => {
        if(Object.keys(result).length===0){
            bot.sendMessage(chatId, "Try another word. There's no such a word in our dictionary")
            return
        }
        const keys = Object.keys(result)
        const response = keys.map(dic =>{
            const value = result[dic]
            const pairs = value.pairs
            const pairs_keys = Object.keys(pairs)
            const explanations = pairs_keys.map(word=>{
                const value = pairs[word]
                return `<strong>${word?`-----${word}\n`:''}</strong>${value}\n`
            }).join('\n')
            return `<b>${dic.trim()?`#${dic}`:''}</b> <b>${value.word?`\n${value.word}`:''}</b>${value.pron_us?`\nUS: [${value.pron_us}]`:''}  ${value.pron_uk?`UK:[${value.pron_uk}]`:''}\n${explanations}`
        }).join('\n')
        const message = [{
            type:'article',
            id:chatId.toString(),
            title:word,
            input_message_content:{
                message_text:response,
                parse_mode:'HTML'
            }
        }]

        bot.answerInlineQuery(chatId, message, {
            cache_time:0
        })
})
}




bot.on("polling_error", (err) => console.log(err))


// fetch("https://ankiuser.net/edit/save", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-fetch-site": "same-origin",
//     "sec-gpc": "1",
//     "x-requested-with": "XMLHttpRequest",
//     "cookie": "ankiweb=eyJrIjogIlNzMVVtRjAzRzc1QmJLV2MiLCAiYyI6IDIsICJ0IjogMTY3NjQ3NjUwMX0.oRT0lctxyE1FxF2w9p74PvCWxtDPYi8uAjO2k8m57OM",
//     "Referer": "https://ankiuser.net/edit/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "nid=&data=%5B%5B%22%E2%98%85+In+the+middle+of+something%5C%22%22%2C%22%3Cdiv%3E%5C%22%E2%80%93+%D0%B2%D0%B5%D1%81%D1%8C%D0%BC%D0%B0+%D0%BF%D0%BE%D0%BB%D0%B5%D0%B7%D0%BD%D0%BE%D0%B5+%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5+%D0%BD%D0%B0+%D1%81%D0%BB%D1%83%D1%87%D0%B0%D0%B9%2C+%D0%B5%D1%81%D0%BB%D0%B8+%D0%B2%D1%8B+%D1%87%D0%B5%D0%BC-%D1%82%D0%BE+%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D1%8B+%D0%B8+%D0%BD%D0%B0%D0%B4%D0%BE+%D0%B1%D1%8B%D1%81%D1%82%D1%80%D0%BE+%D0%BA%D0%BE%D0%B3%D0%BE-%D1%82%D0%BE+%D0%BE%D1%82%D1%88%D0%B8%D1%82%D1%8C.+%D0%A7%D1%82%D0%BE%D0%B1%D1%8B+%D0%BD%D0%B5+%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B8%D1%82%D1%8C+%5C%22Margaret%2C+fuck+off!%5C%22+(%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B5%D1%82%2C+%D0%BE%D1%82%D1%8A%D0%B5%D0%B1%D0%B8%D1%81%D1%8C!)%2C+%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5+%D0%BB%D1%83%D1%87%D1%88%D0%B5+%5C%22Margaret%2C+I'm+in+the+middle+of+something.%5C%22+(%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B5%D1%82%2C+%D1%8F+%D1%81%D0%B5%D0%B9%D1%87%D0%B0%D1%81+%D0%BA%D0%BE%D0%B5-%D1%87%D0%B5%D0%BC+%D0%B7%D0%B0%D0%BD%D1%8F%D1%82(-%D0%B0).+%D0%92+%D0%B1%D1%83%D0%BA%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%BC+%D1%81%D0%BC%D1%8B%D1%81%D0%BB%D0%B5+in+the+middle+%D0%B7%D0%BD%D0%B0%D1%87%D0%B8%D1%82+%D0%BF%D0%BE%D1%81%D1%80%D0%B5%D0%B4%D0%B8%D0%BD%D0%B5%2C+%D0%B0%2C+%D0%B5%D1%81%D0%BB%D0%B8+%D0%B1%D1%80%D0%B0%D1%82%D1%8C+%D0%B2%D0%BE+%D0%B2%D0%BD%D0%B8%D0%BC%D0%B0%D0%BD%D0%B8%D0%B5+%D0%BE%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8+%D0%BD%D0%B0%D1%88%D0%B5%D0%B3%D0%BE+%D1%81%D0%B5%D0%B3%D0%BE%D0%B4%D0%BD%D1%8F%D1%88%D0%BD%D0%B5%D0%B3%D0%BE+%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F%2C+%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE+%D1%81%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C%2C+%D1%87%D1%82%D0%BE+%D0%B2%D1%8B+%D0%BD%D0%B0%D1%85%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D1%81%D1%8C+%D0%B2+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D1%81%D1%81%D0%B5+%D0%B2%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F+%D1%87%D0%B5%D0%B3%D0%BE-%D0%BB%D0%B8%D0%B1%D0%BE+%D0%B8+%D0%BD%D0%B5+%D1%85%D0%BE%D1%82%D0%B8%D1%82%D0%B5%2C+%D1%87%D1%82%D0%BE%D0%B1%D1%8B+%D0%B2%D0%B0%D0%BC+%D0%BC%D0%B5%D1%88%D0%B0%D0%BB%D0%B8.+%D0%9A%D1%81%D1%82%D0%B0%D1%82%D0%B8%2C+%5C%22something%5C%22+%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE+%D1%81%D0%B4%D0%B5%D0%BB%D0%B0%D1%82%D1%8C+%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5+%D0%BA%D0%BE%D0%BD%D0%BA%D1%80%D0%B5%D1%82%D0%BD%D1%8B%D0%BC%2C+%D1%83%D0%BA%D0%B0%D0%B7%D0%B0%D0%B2%2C+%D1%87%D1%82%D0%BE+%D1%83+%D0%B2%D0%B0%D1%81+%D1%82%D0%B0%D0%BC+%D0%B7%D0%B0+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D1%81%D1%81+%D1%81+%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E+%D0%B3%D0%B5%D1%80%D1%83%D0%BD%D0%B4%D0%B8%D1%8F+(%D0%B3%D0%BB%D0%B0%D0%B3%D0%BE%D0%BB+%2B+ing)+%D0%B8%D0%BB%D0%B8+%D1%81%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D0%B3%D0%BE.%3C%2Fdiv%3E%3Cdiv%3E%3Cbr%3E%3C%2Fdiv%3E%3Cdiv%3E-+For+fuck's+sake%2C+Jack.+Get+out+and+close+the+door+on+the+other+side.+I'm+in+the+middle+of+something.%3C%2Fdiv%3E%3Cdiv%3E-+%D0%91%D0%BB%D1%8F%2C+%D0%94%D0%B6%D0%B5%D0%BA%2C+%D1%82%D1%8B+%D0%B7%D0%B0%D0%B5%D0%B1%D0%B0%D0%BB.+%D0%92%D1%8B%D0%B9%D0%B4%D0%B8+%D0%B8+%D0%B7%D0%B0%D0%BA%D1%80%D0%BE%D0%B9+%D0%B4%D0%B2%D0%B5%D1%80%D1%8C+%D1%81+%D1%82%D0%BE%D0%B9+%D1%81%D1%82%D0%BE%D1%80%D0%BE%D0%BD%D1%8B.+%D0%AF+%D1%81%D0%B5%D0%B9%D1%87%D0%B0%D1%81+%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B0.%3C%2Fdiv%3E%22%2C%22%22%5D%2C%22%22%5D&csrf_token=eyJvcCI6ICJlZGl0IiwgImlhdCI6IDE2NzY0ODAwODIsICJ1aWQiOiAiYjc4MjgxZjgifQ.Z-kG5_IRRUBtqPHWs5G7M_E0msneMjRdXj93FrT9lx8&mid=1445149831387&deck=1570820542946",
//   "method": "POST"
// }); ;
// fetch("https://ankiuser.net/edit/save", {
//   "headers": {
//     "accept": "*/*",
//     "accept-language": "en-US,en;q=0.9",
//     "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
//     "sec-fetch-dest": "empty",
//     "sec-fetch-mode": "cors",
//     "sec-wjk -site": "same-origin",
//     "sec-gpc": "1",
//     "x-requested-with": "XMLHttpRequest",
//     "cookie": "ankiweb=eyJrIjogIlNzMVVtRjAzRzc1QmJLV2MiLCAiYyI6IDIsICJ0IjogMTY3NjQ3NjUwMX0.oRT0lctxyE1FxF2w9p74PvCWxtDPYi8uAjO2k8m57OM",
//     "Referer": "https://ankiuser.net/edit/",
//     "Referrer-Policy": "strict-origin-when-cross-origin"
//   },
//   "body": "nid=&data=%5B%5B%22%5C%22%E2%98%85+In+the+middle+of+something%5C%22%22%2C%22%5C%22%E2%80%93+%D0%B2%D0%B5%D1%81%D1%8C%D0%BC%D0%B0+%D0%BF%D0%BE%D0%BB%D0%B5%D0%B7%D0%BD%D0%BE%D0%B5+%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5+%D0%BD%D0%B0+%D1%81%D0%BB%D1%83%D1%87%D0%B0%D0%B9%2C+%D0%B5%D1%81%D0%BB%D0%B8+%D0%B2%D1%8B+%D1%87%D0%B5%D0%BC-%D1%82%D0%BE+%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D1%8B+%D0%B8+%D0%BD%D0%B0%D0%B4%D0%BE+%D0%B1%D1%8B%D1%81%D1%82%D1%80%D0%BE+%D0%BA%D0%BE%D0%B3%D0%BE-%D1%82%D0%BE+%D0%BE%D1%82%D1%88%D0%B8%D1%82%D1%8C.+%D0%A7%D1%82%D0%BE%D0%B1%D1%8B+%D0%BD%D0%B5+%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B8%D1%82%D1%8C+%5C%22Margaret%2C+fuck+off!%5C%22+(%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B5%D1%82%2C+%D0%BE%D1%82%D1%8A%D0%B5%D0%B1%D0%B8%D1%81%D1%8C!)%2C+%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5+%D0%BB%D1%83%D1%87%D1%88%D0%B5+%5C%22Margaret%2C+I'm+in+the+middle+of+something.%5C%22+(%D0%9C%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B5%D1%82%2C+%D1%8F+%D1%81%D0%B5%D0%B9%D1%87%D0%B0%D1%81+%D0%BA%D0%BE%D0%B5-%D1%87%D0%B5%D0%BC+%D0%B7%D0%B0%D0%BD%D1%8F%D1%82(-%D0%B0).+%D0%92+%D0%B1%D1%83%D0%BA%D0%B2%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D0%BC+%D1%81%D0%BC%D1%8B%D1%81%D0%BB%D0%B5+in+the+middle+%D0%B7%D0%BD%D0%B0%D1%87%D0%B8%D1%82+%D0%BF%D0%BE%D1%81%D1%80%D0%B5%D0%B4%D0%B8%D0%BD%D0%B5%2C+%D0%B0%2C+%D0%B5%D1%81%D0%BB%D0%B8+%D0%B1%D1%80%D0%B0%D1%82%D1%8C+%D0%B2%D0%BE+%D0%B2%D0%BD%D0%B8%D0%BC%D0%B0%D0%BD%D0%B8%D0%B5+%D0%BE%D1%81%D0%BE%D0%B1%D0%B5%D0%BD%D0%BD%D0%BE%D1%81%D1%82%D0%B8+%D0%BD%D0%B0%D1%88%D0%B5%D0%B3%D0%BE+%D1%81%D0%B5%D0%B3%D0%BE%D0%B4%D0%BD%D1%8F%D1%88%D0%BD%D0%B5%D0%B3%D0%BE+%D0%B2%D1%8B%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D1%8F%2C+%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE+%D1%81%D0%BA%D0%B0%D0%B7%D0%B0%D1%82%D1%8C%2C+%D1%87%D1%82%D0%BE+%D0%B2%D1%8B+%D0%BD%D0%B0%D1%85%D0%BE%D0%B4%D0%B8%D1%82%D0%B5%D1%81%D1%8C+%D0%B2+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D1%81%D1%81%D0%B5+%D0%B2%D1%8B%D0%BF%D0%BE%D0%BB%D0%BD%D0%B5%D0%BD%D0%B8%D1%8F+%D1%87%D0%B5%D0%B3%D0%BE-%D0%BB%D0%B8%D0%B1%D0%BE+%D0%B8+%D0%BD%D0%B5+%D1%85%D0%BE%D1%82%D0%B8%D1%82%D0%B5%2C+%D1%87%D1%82%D0%BE%D0%B1%D1%8B+%D0%B2%D0%B0%D0%BC+%D0%BC%D0%B5%D1%88%D0%B0%D0%BB%D0%B8.+%D0%9A%D1%81%D1%82%D0%B0%D1%82%D0%B8%2C+%5C%22something%5C%22+%D0%BC%D0%BE%D0%B6%D0%BD%D0%BE+%D1%81%D0%B4%D0%B5%D0%BB%D0%B0%D1%82%D1%8C+%D0%B1%D0%BE%D0%BB%D0%B5%D0%B5+%D0%BA%D0%BE%D0%BD%D0%BA%D1%80%D0%B5%D1%82%D0%BD%D1%8B%D0%BC%2C+%D1%83%D0%BA%D0%B0%D0%B7%D0%B0%D0%B2%2C+%D1%87%D1%82%D0%BE+%D1%83+%D0%B2%D0%B0%D1%81+%D1%82%D0%B0%D0%BC+%D0%B7%D0%B0+%D0%BF%D1%80%D0%BE%D1%86%D0%B5%D1%81%D1%81+%D1%81+%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%D1%8E+%D0%B3%D0%B5%D1%80%D1%83%D0%BD%D0%B4%D0%B8%D1%8F+(%D0%B3%D0%BB%D0%B0%D0%B3%D0%BE%D0%BB+%2B+ing)+%D0%B8%D0%BB%D0%B8+%D1%81%D1%83%D1%89%D0%B5%D1%81%D1%82%D0%B2%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE%D0%B3%D0%BE.%5C%22%22%2C%22%22%5D%2C%22%22%5D&csrf_token=eyJvcCI6ICJlZGl0IiwgImlhdCI6IDE2NzY0ODAwODIsICJ1aWQiOiAiYjc4MjgxZjgifQ.Z-kG5_IRRUBtqPHWs5G7M_E0msneMjRdXj93FrT9lx8&mid=1445149831387&deck=1570820542946",
//   "method": "POST"
// });

// inpurt from the keyboard in javascript
  
