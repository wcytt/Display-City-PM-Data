// 数据来源 http://datacenter.mep.gov.cn:8099/ths-report/report!list.action
// 用爬虫进行爬取数据

// 引入模块
var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs')

// 定义函数
var log = console.log.bind(console, '***debug')

var Data = function() {
    this.name = ''
    this.value = 0
    // echars 的实例不需要下面的数据，但是留着以后可能会用
    // this.pmName = ''
    // this.date = 0
}

// 把数据保存在本地
var writeToFile = function(path, data) {
    fs.writeFile(path, data, function(error) {
        if(error !== null) {
            log(`文件${path}写入失败`)
        } else {
            log(`文件${path}写入成功`)
        }
    })
}

// 从 body 中获取 input 的 value
var valueFromBody = function(body) {
    var e = cheerio.load(body)
    var value = e('#gisDataJson').attr('value')
    return value
}

// 从 value 中获取 city pmName value 得到数据的时间
var dataFromValue = function(value) {
    var s = JSON.parse(value)
    var data = []
    // log('s 的值', s, typeof s)
    // 此时的 s 是一个数组
    for (var i = 0; i < s.length; i++) {
        var va = s[i]
        var object = new Data()
        object.name = va.CITY
        object.value = va.AQI
        // object.pmName = va.MAIN_POLLUTANT
        // object.date = va.OPER_DATE
        data.push(object)
    }
    return data
}

// 下载需要爬取的网页
var cached_url = function(i, url) {
    var path = `cache-${i}.html`
    var formData = {
        'page.pageNo': `${i}`,
        'xmlname': '1462259560614'
    }
    var postData = {
        url: url,
        formData: formData
    }
    request.post(postData, function(error, response, body) {
        if(error === null) {
            var s = valueFromBody(body)
            writeToFile(path, s)
        }
    })
}

// 在下载的文件里读取数据
var dataFromFile = function() {
    var results = []
    for (var i = 1; i < 13; i++) {
        var path = `cache-${i}.html`
        var data = fs.readFileSync(path, 'utf8')
        // log('读取文件的 data ', path, typeof data)
        var res = dataFromValue(data)
        results = results.concat(res)
    }
    // log('读取文件的 results ', results)
    return results
}

// 主函数
var __mainEntrance = function() {
    var path = 'uuju.json'
    // 下载文件
    var url = 'http://datacenter.mep.gov.cn:8099/ths-report/report!list.action'
    for (var i = 1; i < 13; i++) {
        cached_url(i, url)
    }
    // 在下载的文件里读取数据
    var data = dataFromFile()
    var s = JSON.stringify(data, null, 2)
    // log('主函数里面的 s ', s)
    writeToFile(path, s)
}

__mainEntrance()
