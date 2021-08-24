const cheerio = require('cheerio')
const axios = require('axios')
const pretty = require('pretty')


async function getData(word) {
    if(!word||(word.length <=2)){
        return {}
    }
    const URL = `https://dictionary.cambridge.org/us/dictionary/english/${word}`
    let arr={}
    const {data} = await axios.get(URL)
    const $ = cheerio.load(data)
    const dictionaries = $('.pr.dictionary')
    var p_usf, p_ukf, wres;
    for(let i = 0;i<dictionaries.length;i++){
        wres = !wres?$(dictionaries[i]).find('.headword.hdb.tw-bw.dhw.dpos-h_hw').first().text():''
        let p_us = $(dictionaries[i]).find('.us.dpron-i')
        let p_uk = $(dictionaries[i]).find('.uk.dpron-i')
        p_usf = !p_usf?$(p_us).find('.ipa.dipa.lpr-2.lpl-1').first().text().split('\n').join('').replace(/\s+/g,' '):''
        p_ukf = !p_ukf?$(p_uk).find('.ipa.dipa.lpr-2.lpl-1').first().text().split('\n').join('').replace(/\s+/g,' '):''
        let entries = $(dictionaries[i]).find('.def-block.ddef_block ')
        let dictionary = {}
        for (let i = 0; i< entries.length;i++){
            let level = $(entries[i]).find('.epp-xref.dxref').text()
            let key = $(entries[i]).find('.def.ddef_d.db').text().split('\n').join('').replace(/\s+/g, ' ')
            let exp = $(entries[i]).find('.examp.dexamp')
            let explanations = []
            for (let i =0; i< exp.length; i++){
                let result = $(exp[i]).find('.eg.deg').text().split('\n').join('').replace(/\s+/g, ' ')
                explanations.push(`-${result}`)
            }
            dictionary[`${level?level+' ':''}${key}`]=explanations.join('\n')
        }
        let type_dict = $(dictionaries[i]).find('.c_hh').text().split('|')
        type_dict = type_dict.length > 1 ? `${type_dict[1]}`.trim():` `
        arr[type_dict]={
            word:wres,
            pron_us:p_usf,
            pron_uk:p_ukf,
            pairs:dictionary
        }
    }
    return arr
}

module.exports = getData


