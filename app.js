//网上下的某个模版改的，爬虫qq成功，多页面，promise


var express = require('express');
var http = require('http')
var cheerio = require('cheerio')
var basicUrl = 'http://gu.qq.com/'
var Promise = require('bluebird')

var app = express();


    //***扩展变量
var coursesIds = ['sh510050','sz159920','sh513100','sz164906','sh518880']; //要爬取的课程ID
var pagesArr = []
    //***扩展变量完毕
    //***4.单页面扩展至多课程----批量获取页面html
coursesIds.forEach(function(id) {
        pagesArr.push(getPageAsync(basicUrl + id))
    })
    //1.获取界面html并返回准备传入解析函数,利用Promise对象进行Async的页面获取
function getPageAsync(url) {
    return new Promise(function(resolve, reject) {
        http.get(url, function(res) {
            //console.log('正在爬取' + url + '\n')
            var html = ''
            res.on('data', function(data) {
                html += data
            })
            res.on('end', function() {
                //console.log('页面' + url + '爬取完毕')
                resolve(html)
            })

        }).on('error', function(e) {
            reject(e)
            console.log('爬取页面信息失败')
        })

    })
}
//2.解析函数，用于将传入的页面HTML代码解析，提取其中所需要的信息，并保存在courseData对象中

function filterChapters(html) {
    var $ = cheerio.load(html)

    //下面是自定义函数，用于text()函数删除子元素的影响
    $.fn.mytext = function() {
            return $(this).clone()
                .children()
                .remove()
                .end()
                .text()
        }
    //自定义函数完毕

    /*数据信息格式
    var courseData={
        coursesIds:'',
        zheyijia:'',
    }
    */

    var coursesId = $($('.title').find('.col_2')).text()
    var name = $($('.title').find('.col_1')).text()
    //var coursesId = coursesId0.split('(')[1].split(')')[0]
    var zheyijia = $($('.item_right').find('#main8')).text().trim()
    var courseData = {
            coursesId: coursesId,
            zheyijia: zheyijia,
            name:name,
        } //所有信息存储用的数组
    //返回courseData
    return courseData
}

//3.输出函数，按照指定格式输出courseData中保存的信息
// function printInfo(courseData) {
//     console.log(courseData.coursesId +'折溢价：' +courseData.zheyijia )
//     console.log('\n')
// }

// //函数运行主体
// getPageAsync(baseUrl)
//     .then(function(html){
//         var courseData=filterChapters(html)//利用解析函数解析所爬取的页面并返回课程信息对象
//         printInfo(courseData)//输出最终整理完毕的课程信息对象
//     })

//扩展--函数运行主体
app.get('/', function (req, res) {
    var pageContent = "";
    Promise
    .all(pagesArr)
    .then(function(pages) {
        pages.forEach(function(page) {
            courseData = filterChapters(page);
            pageContent += courseData.coursesId+ ' ' +courseData.zheyijia +' ' +courseData.name +  "<br />";
        })
    }).then(function(){
        res.send(pageContent);  
    }); 
});

app.listen(3000,function(){
    console.log('app is listening at port 3000');
});