let text = [
    "欢迎使用 “梦云代码管理” 软件，默认同意附带协议许可和免责声明。",
    "------------------------------------------",
    "版权所有 ©2024 梦云OpenSource 团队 保留所有权利。",
    "由核心开发成员 奶元清~萌小狸（nyqmxl） 进行维护。",
    "这个库是免费软件，但是要注意附带协议许可和免责声明； ",
    "------------------------------------------",
    `现在时间是：${shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19)}`,
    "使用“梦云代码管理” 软件之前请阅读以下帮助文档！",
    "请在设置运行“使用前台服务使应用保持运行”、“音量上键停止所有脚本”、“无障碍服务”、 “悬浮窗”。",
    "输入框可以输入“菜单”命令，进入菜单后请根据提示操作。",
    "------------------------------------------",
    `${shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19)} 正在运行...`,
    "------------------------------------------"
];

function __code__init__()                                                   // 初始化函数
{
    return {
        "时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
        "标识": device.getMacAddress()
    };
}

function __code__exec__(data)                                               // 执行函数
{
    data = {
        "时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
        "标识": device.getMacAddress(),
        "运行": true,
        "统计": { "总数": 0, "成功": 0, "失败": 0 },
        "数据": (!data["数据"]) ? null : data["数据"]
    };
    for (let f1 in data["数据"])                                            // 解析运行
    {
        let number = `${(parseInt(f1) + 1)}/${data["数据"].length}`;
        f1 = {
            "时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
            "运行": null,
            "调用": data["数据"][f1],
        };
        console.log(`${f1["时间"]} 正在执行第 ${number} 个任务`);
        try                                                                 // 捕捉异常
        {
            f1["运行"] = true;
            f1["回调"] = eval(f1["调用"]);
            data["统计"]["成功"]++;
        }
        catch (error)                                                       //  处理异常
        {
            error = `[Error]: The javascript File line ${error.stack.match(/:(\d+)/)[1]}, ${error.name} ${error.message}`;
            f1["运行"] = false;
            f1["回调"] = error;
            data["统计"]["失败"]++;
        }
        f1["时间"] = shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19);
        console.log(`${f1["时间"]} 完成执行第 ${number} 个任务`);
        console.log("------------------------------------------");
        data["数据"][f1] = f1;
        data["统计"]["总数"]++;
    }

    if (!data["统计"]["总数"])                                              // 数据无法解析
    {
        data["运行"] = false;
        data["统计"] = null;
    }
    return data;
}

function __code__websocket__(uri)                                           // 连接函数
{
    if (__code__ws__exec__) 	                                            // 启动websocket
    {
        try                                                                 // websocket异常捕获
        {
            __code__ws__exec__ = false;
            let ws = web.newWebSocket(uri, { eventThread: 'this' });
            ws.on("open", (res, ws) => { ws.send(JSON.stringify(__code__init__(), null, 4)); })
                .on("failure", (err, res, ws) => { __code__ws__exec__ = true; })
                .on("closing", (code, reason, ws) => { __code__ws__exec__ = true; })
                .on("binary", (bytes, ws) => {
                    let data = null;
                    data = String.fromCharCode.apply(null, bytes.toByteArray())
                    data = JSON.parse(data);
                    data = (data["数据"].length) ? __code__exec__(data) : __code__init__();
                    data = JSON.stringify(data, null, 4);
                    ws.send(data);
                });
        }
        catch (error) { __code__ws__exec__ = true; }
    }
}

function __code__shell__()                                                  // 通过控制台调用
{
    console.show(true);
    console.setSize(device.width, device.height * 0.6);
    console.setTitle("梦云代码管理", "#FFFFFF", 35);
    let cmd = null;
    while (cmd != "关闭") {
        cmd = console.rawInput();
        console.log(`${shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19)} 的任务记录`)
        switch (cmd)                                                        // 获取输入文字
        {
            case "菜单": {
                console.hide();
                while (true) {
                    cmd = dialogs.select("测试工具菜单", "服务器地址", "运行任务", "保存配置", "读取配置", "退出菜单", "关闭");
                    switch (cmd)                                            // 选择功能
                    {
                        case 0: {
                            cmd = rawInput("服务器地址");
                            if (cmd != null && cmd != "")                   // 空不执行
                            {
                                __code__data__["uri"] = cmd;
                                cmd = `设置完成请保存。\n服务器地址：${cmd}`
                                console.log(cmd);
                                toast(cmd);
                            }
                            else
                                toast("服务器地址不能为空，使用上一次配置。");
                            break;
                        }
                        case 1: {
                            cmd = rawInput("运行任务");
                            if (cmd)                                        // 空不执行
                            {
                                try                                         // 捕捉异常
                                {
                                    cmd = {
                                        "时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
                                        "调用": cmd,
                                        "回调": eval(cmd)
                                    }
                                    console.log(JSON.stringify(cmd, null, 4));
                                    toast(JSON.stringify(cmd, null, 4))
                                }
                                catch (error)                               // 处理异常
                                {
                                    error = {
                                        "时间": shell("date +'%Y-%m-%d %H:%M:%S'").result.slice(0, 19),
                                        "调用": cmd,
                                        "回调": `[Error]: The javascript File line ${error.stack.match(/:(\d+)/)[1]}, ${error.name} ${error.message}`
                                    }
                                    console.log(JSON.stringify(error, null, 4));
                                    toast(JSON.stringify(error, null, 4))
                                }
                            }
                            break;
                        }
                        case 2: {
                            files.write("/sdcard/梦云代码管理.json", JSON.stringify(__code__data__, null, 4));
                            cmd = `保存成功重启生效，结果如下：\n${JSON.stringify(__code__data__, null, 0)}`;
                            console.log(cmd);
                            toast(cmd);
                            break;
                        }
                        case 3: {
                            if (files.isFile("/sdcard/梦云代码管理.json"))  // 文件不存在
                            {
                                __code__data__ = JSON.parse(files.read("/sdcard/梦云代码管理.json"));
                                cmd = `读取成功：${JSON.stringify(__code__data__, null, 0)}`
                                console.log(cmd);
                                toast(cmd);
                            }
                            else
                                toast(`读取失败，文件不存在！`);
                            break;
                        }
                        default:
                    }
                    if (cmd == 4) break;
                    if (cmd == 5) {
                        cmd = "关闭";
                        threads.shutDownAll();
                        break;
                    }
                }
                console.setSize(device.width, device.height * 0.6);
                console.show(true);
                break;
            }
            default: {
            }
        }
        console.log("------------------------------------------");
    }
}

function __code__main__(data)                                               // 程序入口点
{
    if (files.isFile(data))                                                 // 启动
    {
        try //  启动服务 
        {
            log(data)
            data = JSON.parse(files.read(data))
            log(data["uri"])
            threads.start(() => { setInterval(() => { __code__websocket__(data["uri"]); }, 100); });
        }
        catch (error) { console.log(error); toast(error); }
    }
    threads.start(() => { __code__shell__(); });
    console.log(text.join("\n"));

}

device.keepScreenOn();
let __code__ws__exec__ = true, __code__data__ = {};
__code__main__("/sdcard/梦云代码管理.json");
