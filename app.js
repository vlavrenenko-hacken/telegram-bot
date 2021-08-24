const TelegramBot = require('node-telegram-bot-api')
const getData = require('./test.js')

const TOKEN = '1984159588:AAGpgJhOWa_LktPZKUpczBWGrwO8dqaN_L0'

const bot = new TelegramBot(TOKEN, {
    polling:{
        interval: 300,
        autoStart:true,
        params:{
            timeout:10
        }

    }
})


bot.onText(/\/start/, msg=>{
    const {id} = msg.chat
    const {first_name} = msg.from
    bot.sendMessage(id, `Hello, ${first_name}`)

}
)

bot.onText(/\/word(.+)/, (msg, [source, match])=>{
    const {id} = msg.chat
    sendCard(id, match)
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

