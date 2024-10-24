/*
 *   mengyun_exec.js SDK的主要包含文件
 *   版权所有©2024 梦云OpenSource 团队。保留所有权利。
 *   由核心开发成员 奶元清~萌小狸（nyqmxl） 进行维护。
 *   开源地址：https://github.com/nyqmxl/Android_Automated_Management
 *   这个库是免费软件；但是要注意附带通用公共此库附带的许可证；
 *   默认使用表示同意附带通用公共此库附带的许可证；
*/

importClass(java.io.File);
importClass(android.net.Uri);
importClass(android.content.Intent);
importClass(android.content.ComponentName);

device.keepScreenOn();

function 分享数据(数据)                                 // 分享数据
{
    // let 数据 = {
    //	 "应用": "小红书",
    //	 "包名": "com.xingin.xhs",
    //	 "类名": "com.tencent.mobileqq.activity.JumpActivity",
    //	 "类型": ["类型三选一（字符串型）", "text/*", "image/*", "video/*"],
    //	 "数据": ["/sdcard/小红书/1.png"],
    //	 "启动": false
    // };
    if (数据["数据"] == null || !数据["数据"].length)   // 停止
    {
        delete 数据;
        return false;
    }
    if (数据["启动"]) launchPackage(数据["包名"]);
    if (typeof (数据["数据"]) == String)	            // 字符串类型
    {
        intent = new Intent("android.intent.action.SEND");
        intent.setType(数据["类型"]);
        intent.putExtra(Intent.EXTRA_TEXT, 数据["数据"]);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.setComponent(new android.content.ComponentName(数据["包名"], 数据["类名"]));
        context.startActivity(intent);
        delete intent;
    }
    else	// 其他类型
    {
        for (let f1 in 数据["数据"])                    // 生成路径
        {
            let 临时 = new File(数据["数据"][f1]);
            数据["数据"][f1] = new Uri.fromFile(临时);
            delete 临时;
        }
        intent = new Intent();
        intent.setAction(Intent.ACTION_SEND_MULTIPLE);
        intent.setPackage(数据["包名"]);
        intent.setType(数据["类型"]);
        intent.putExtra(Intent.EXTRA_STREAM, 数据["数据"]);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        context.startActivity(intent);
        delete intent;
        for (let f1 in 数据["数据"]) delete 数据["数据"][f1];
    }
    delete 数据;
    return true;
}

function 文件管理(数据)                                 // 文件管理
{
    // let 数据 = [
    //	 ["命令", "ls /sdcard"],
    //	 ["路径"],
    //	 ["新建", "/sdcard/新文件夹/"],
    //	 ["目录", "/sdcard/新文件夹"],
    //	 ["删除", "/sdcard/新文件夹"],
    //	 ["复制", "/sdcard/test.json", "/sdcard/小红书-复制/test.json"],
    //	 ["移动", "/sdcard/小红书-复制/test.json", "/sdcard/小红书-复制/test1.json"],
    //	 ["写入", "/sdcard/小红书/2.png", files.readBytes("/sdcard/小红书/1.png")]
    //	 ["读取", "/sdcard/小红书-复制/test1.json"]
    // ];
    for (let f1 in 数据)                                // 循环读取
    {
        switch (数据[f1][0])                            // 读取类型
        {
            case "路径": 数据[f1] = [数据[f1][0], files.cwd()]; break;
            case "新建": 数据[f1] = [数据[f1][0], 数据[f1][1], files.createWithDirs(数据[f1][1])]; break;
            case "目录": 数据[f1] = [数据[f1][0], 数据[f1][1], files.listDir(数据[f1][1])]; break;
            case "删除": 数据[f1] = [数据[f1][0], 数据[f1][1], files.removeDir(数据[f1][1])]; break;
            case "移动": 数据[f1] = [数据[f1][0], 数据[f1][1], 数据[f1][2], (files.isFile(数据[f1][1])) ? files.move(数据[f1][1], 数据[f1][2]) : null]; break;
            case "复制": 数据[f1] = [数据[f1][0], 数据[f1][1], 数据[f1][2], (files.isFile(数据[f1][1])) ? files.copy(数据[f1][1], 数据[f1][2]) : null]; break;
            case "写入": 数据[f1] = [数据[f1][0], 数据[f1][1], 数据[f1][2].length, files.writeBytes(数据[f1][1], 数据[f1][2]) == null]; break;
            case "读取": {
                if (files.isFile(数据[f1][1])) {
                    数据[f1] = [数据[f1][0], 数据[f1][1], files.readBytes(数据[f1][1])];
                }
                else
                    数据[f1] = [数据[f1][0], 数据[f1][1], null];
                break;
            }
            default:
        }
    }
    return 数据;
}

function 调用命令(数据)                                 // 调用系统命令
{
    数据 = shell(数据);
    数据 = {
        "代码": 数据.code,
        "错误": 数据.error,
        "回调": 数据.result
    }
    return 数据;
}

function 访问数据(数据)                                 // 访问数据
{
    // let 数据 = {
    //		// "地址": "http://www.baidu.com",
    //	 "地址": "https://gitee.com/mxlbb/config-file/raw/master/1720000000.json",
    //	 "访问": {
    //		 "headers": {},
    //		 "method": "GET",
    //			// "contentType": "text/plain",
    //			// "body": JSON.stringify({})
    //	 }
    // };
    try                                                 // 尝试访问数据
    {
        数据["数据"] = http.request(数据["地址"], 数据["访问"])
        files.writeBytes("/sdcard/Download/temp.db", 数据.数据.body.bytes())
        数据["数据"] = files.read("/sdcard/Download/temp.db")
        try { 数据["数据"] = JSON.parse(数据["数据"]); }
        catch (error) { }
        files.remove("/sdcard/Download/temp.db");
    }
    catch (error) { 数据["数据"] = null }
    return 数据;
}

function 下载文件(数据)                                 // 下载文件
{
    // let 数据 = {
    //     "文件目录": ["二选一或者手动输入路径，末尾用 / 结束", "/sdcard/小红书/", "/sdcard/今日头条/"],
    //     "文件路径": [
    //         "http://192.168.0.106:8000/file/download?name=aba0066749042acee5dd1099d42f9977.jpeg"
    //     ]
    // };
    files.createWithDirs(数据["文件目录"])
    for (let f1 in 数据["文件路径"]) {
        let 临时 = http.get(数据["文件路径"][f1]);
        let 名称 = 数据["文件路径"][f1].split("=");
        名称 = `${数据["文件目录"]}${名称[1]}`
        files.writeBytes(名称, 临时.body.bytes())
    }
    return 数据;
}

function 设备状态(数据)                                 // 设备状态
{
    // let 数据 = { "名称": null, "地址": ["http://jsonip.com/", "https://myip.ipip.net/"] }; 
    if (数据 == undefined || 数据 == null || 数据 == []) // 数据为空不执行
        数据 = { "名称": null, "地址": ["http://jsonip.com/", "https://myip.ipip.net/"] };
    if (数据["名称"]) 设备配置["名称"] = 数据["名称"];
    if (数据["地址"]) 数据 = 数据["地址"];
    try                                                 // http访问异常捕捉
    {
        for (let f1 in 数据)
            try { 数据[f1] = http.get(数据[f1]).body.json(); }
            catch (error) { 数据[f1] = http.get(数据[f1]).body.string().replace("\n", "") }
    }
    catch (error) { 数据 = null; }                      // 打印异常
    数据 = {
        "设备时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
        "设备名称": device.getMacAddress(),
        "设备品牌": device.brand,
        "设备型号": device.model,
        "设备标识": device.getMacAddress(),
        "设备电量": device.getBattery(),
        "设备充电": device.isCharging(),
        "屏幕常量": device.isScreenOn(),
        "物理内存": shell("free -h | grep Mem").result.match(/[^\s]+/g).slice(1, 7),
        "交换内存": shell("free -h | grep Swap").result.match(/[^\s]+/g).slice(1, 4),
        "存储信息": shell("df -h | grep /storage/emulated").result.match(/[^\s]+/g).slice(1, 6),
        "设备地址": 数据,
    };
    return 数据;
}

function 函数调用(数据)                                 // 获取执行函数
{
    let 功能 = {
        "运行": true,
        "函数": null
    };
    try                                                 // 检测运行异常
    {

        for (let f1 = 0; f1 < 数据[0].length; f1++)
            if (f1)  // 判断第一次运行
            {
                if (数据[1][f1]) // 判断参数
                {
                    switch (数据[0][f1])    // 解析函数
                    {
                        case "desc":/**********/功能["函数"] = 功能["函数"].desc(数据[1][f1][0]); break;
                        case "text":/**********/功能["函数"] = 功能["函数"].text(数据[1][f1][0]); break;
                        case "depth":/*********/功能["函数"] = 功能["函数"].depth(数据[1][f1][0]); break;
                        case "find":/**********/功能["函数"] = 功能["函数"].find()[数据[1][f1][0]]; break;
                        case "findOne":/*******/功能["函数"] = 功能["函数"].findOne(数据[1][f1][0]); break;
                        case "setText":/*******/功能["函数"] = 功能["函数"].setText(数据[1][f1][0]); break;
                        case "setClip":/*******/功能["函数"] = 功能["函数"].setClip(数据[1][f1][0]); break;
                        case "className":/*****/功能["函数"] = 功能["函数"].className(数据[1][f1][0]); break;
                        case "textContains":/**/功能["函数"] = 功能["函数"].textContains(数据[1][f1][0]); break;
                        case "drawingOrder":/**/功能["函数"] = 功能["函数"].drawingOrder(数据[1][f1][0]); break;
                        case "parent":/********/功能["函数"] = 功能["函数"].parent(); break;
                        case "bounds":/********/功能["函数"] = 功能["函数"].bounds(); break;
                        case "setClip": {
                            app.launchPackage(context.getPackageName());
                            sleep(1000);
                            功能["函数"] = setClip(数据[1][f1][0]);
                            break;
                        }
                        case "getClip": {
                            app.launchPackage(context.getPackageName());
                            sleep(1000);
                            功能["函数"] = getClip();
                            break;
                        }
                        default: break;
                    }
                }
                else // 不存在参数
                {
                    switch (数据[0][f1])    //  解析函数
                    {
                        case "id":/************/功能["函数"] = 功能["函数"].id(); break;
                        case "text":/**********/功能["函数"] = 功能["函数"].text(); break;
                        case "desc":/**********/功能["函数"] = 功能["函数"].desc(); break;
                        case "click":/*********/功能["函数"] = 功能["函数"].click(); break;
                        case "depth":/*********/功能["函数"] = 功能["函数"].depth(); break;
                        case "exists":/********/功能["函数"] = 功能["函数"].exists(); break;
                        case "parent":/********/功能["函数"] = 功能["函数"].parent(); break;
                        case "bounds":/********/功能["函数"] = 功能["函数"].bounds(); break;
                        case "find":/**********/功能["函数"] = 功能["函数"].find()[0]; break;
                        case "findOne":/*******/功能["函数"] = 功能["函数"].findOne(10); break;
                        case "className":/*****/功能["函数"] = 功能["函数"].className(); break;
                        case "drawingOrder":/**/功能["函数"] = 功能["函数"].drawingOrder(); break;
                        case "textContains":/**/功能["函数"] = 功能["函数"].textContains(); break;
                        case "getClip": {
                            app.launchPackage(context.getPackageName());
                            sleep(1000);
                            功能["函数"] = getClip();
                            break;
                        }
                        default: break;
                    }
                }
            }
            else
                switch (数据[0][f1])    //  解析函数
                {
                    case "text":/**********/功能["函数"] = text(数据[1][f1][0]); break;
                    case "textContains":/**/功能["函数"] = textContains(数据[1][f1][0]); break;
                    case "desc":/**********/功能["函数"] = desc(数据[1][f1][0]); break;
                    case "className":/*****/功能["函数"] = className(数据[1][f1][0]); break;
                    case "depth":/*********/功能["函数"] = depth(数据[1][f1][0]); break;
                    case "drawingOrder":/**/功能["函数"] = drawingOrder(数据[1][f1][0]); break;
                    default: break;
                }
    }
    catch (error)                                       // 捕获异常
    {
        功能["运行"] = false;
        功能["函数"] = error;
        if (typeof (功能["函数"]) == "object") 功能["函数"] = 功能["函数"].toString();
    }
    return 功能;
}

/*************************************** 二次开发代码开始 ***************************************/



/*************************************** 二次开发代码结束 ***************************************/

function 参数数据(数据)                                 // 数据结构
{
    数据 = {
        "参数数据": "调用测示例数据，无需传参。",
        "设备状态": { "名称": null, "地址": ["http://jsonip.com/", "https://myip.ipip.net/"] },
        "文件管理": [
            ["路径"],
            ["新建", "/sdcard/新文件夹/"],
            ["目录", "/sdcard/新文件夹"],
            ["删除", "/sdcard/新文件夹"],
            ["复制", "/sdcard/test.json", "/sdcard/小红书-复制/test.json"],
            ["移动", "/sdcard/小红书-复制/test.json", "/sdcard/小红书-复制/test1.json"],
            ["写入", "/sdcard/小红书/2.png", "二进制文件"],
            ["读取", "/sdcard/小红书-复制/test1.json"]
        ]
        ,
        "调用命令": "Android for Linux Shell Text",
        "访问数据": {
            "地址": "http://www.baidu.com",
            "访问": {
                "headers": {},
                "method": "GET",
                "contentType": "text/plain",
                "body": "{}"
            }

        },

        "下载文件": {
            "文件目录": ["二选一或者手动输入路径，末尾用 / 结束", "/sdcard/小红书/", "/sdcard/今日头条/"],
            "文件路径": [
                "http://192.168.0.106:8000/file/download?name=aba0066749042acee5dd1099d42f9977.jpeg"
            ]
        },
        "分享数据": {
            "应用": ["小红书", "今日头条"],
            "包名": ["com.xingin.xhs", "com.ss.android.article.news"],
            "类名": "",
            "类型": ["类型三选一（字符串型）", "text/*", "image/*", "video/*"],
            "数据": ["/sdcard/小红书/1.png", "/sdcard/今日头条/1.png"],
            "启动": false

        }
    };
    return 数据;
}

function 函数列表(数据)                                 // 调用执行函数
{
    数据["时间"] = shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19);
    数据["名称"] = device.getMacAddress();
    数据["标识"] = device.getMacAddress();
    const 函数 = {
        "分享数据": 分享数据,
        "文件管理": 文件管理,
        "调用命令": 调用命令,
        "访问数据": 访问数据,
        "下载文件": 下载文件,
        "设备状态": 设备状态,
        "函数调用": 函数调用,
        /******** 二次开发代码开始 ********/
        /******** 二次开发代码结束 ********/
        "参数数据": 参数数据
    };
    for (let f1 in 数据["数据"])
        for (let f2 in 数据["数据"][f1])                // 遍历函数
        {
            log(`${shell("date +'%m-%d %H:%M:%S'").result.replace("\n", "")} -> 开始：${f2}`);
            try { 数据["数据"][f1][f2] = 函数[f2](数据["数据"][f1][f2]); }
            catch (error) { 数据["数据"][f1][f2] = null; }
            log(`${shell("date +'%m-%d %H:%M:%S'").result.replace("\n", "")} -> 完成：${f2}`);
        }
    return 数据;
}

function 调试列表(数据)                                 // 解析数据
{
    数据["时间"] = shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19);
    数据["名称"] = device.getMacAddress();
    数据["标识"] = device.getMacAddress();
    for (let f1 in 数据["数据"])
        for (let f2 in 数据["数据"][f1])    // 遍历函数
        {
            log(`${shell("date +'%m-%d %H:%M:%S'").result.replace("\n", "")} -> 开始：${f2}`);
            数据["数据"][f1][f2] = 参数数据()[f2];
            log(`${shell("date +'%m-%d %H:%M:%S'").result.replace("\n", "")} -> 完成：${f2}`);
        }
    return 数据;
}

function websocket(数据)                                // 启动通信
{
    let websocket_exec = true
    setInterval(() => {
        if (websocket_exec)                             // 启动websocket
        {
            try                                         // websocket异常捕获
            {
                websocket_exec = false;
                let ws = web.newWebSocket(数据, { eventThread: 'this' });
                ws.on("open", (res, ws) => {
                    let send_data = { "时间": null, "名称": null, "标识": null, "数据": [{ "参数数据": null }] };
                    ws.send(JSON.stringify(函数列表(send_data), null, 4));
                    console.log("\n-------------------------------------------------");
                })
                    .on("failure", (err, res, ws) => { websocket_exec = true; })
                    .on("closing", (code, reason, ws) => { websocket_exec = true; })
                    .on("text", (text, ws) => {
                        try                             // 报错
                        {
                            text = JSON.parse(text);
                            text = (Object.keys(text).length < 5) ? 函数列表(text) : 调试列表(text);
                            ws.send(JSON.stringify(text, null, 4));
                            console.log("\n-------------------------------------------------");
                        }
                        catch (error)                   // 发送普通消息
                        {
                            ws.send(`错误原因：JSON不能被读取，错误消息：${error}。\n这是您发送的数据：${text}`);
                        }
                    });
            }
            catch (error) { websocket_exec = true; log(error) }
        }
    }, 1 * 1000);
}

function main()                                     // 程序运行的入口点
{
    websocket("ws://192.168.0.106:8000/ws");
}

main();
