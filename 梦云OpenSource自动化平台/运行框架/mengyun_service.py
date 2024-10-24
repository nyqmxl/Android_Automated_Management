#   mengyun_service.py SDK的主要包含文件
#   版权所有©2024 梦云OpenSource 团队。保留所有权利。
#   由核心开发成员 奶元清~萌小狸（nyqmxl） 进行维护。
#   开源地址：https://github.com/nyqmxl/Android_Automated_Management
#   这个库是免费软件；但是要注意附带通用公共此库附带的许可证；
#   默认使用表示同意附带通用公共此库附带的许可证；
#
#   安装命令如下：
#   修改源仓库（可选）：pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
#   安装框架->（必选）：pip3 install pymongo sanic uvicorn streamlit requests
#   启动服务->（可选）：uvicorn mengyun_service:app --host="0.0.0.0" --port="8000" --reload=true


import os
import hashlib
import asyncio
from sanic import Sanic
from gridfs import GridFS
from json import loads, dumps
from pymongo import MongoClient
from sanic.response import json, file_stream
from datetime import datetime as dt, timedelta as td, date as de


mongo = MongoClient("mongodb://127.0.0.1:27017/")
db_file = GridFS(mongo["数据文件"])
db_logs = mongo["数据中心"]["日志记录"]
db_apis = mongo["数据中心"]["设备接口"]
db_task = mongo["数据中心"]["任务队列"]
db_data = mongo["数据中心"]["任务记录"]
db_devs = mongo["数据中心"]["设备状态"]
db_xhs_user = mongo["数据中心"]["小红书_用户资料"]
app = Sanic(__name__)


@app.route("/file/<file>", methods=["GET", "POST"])
async def file(request, file):
    try:
        match (file):
            case "upload":
                exec_data = {
                    "运行": True,
                    "时间": str(dt.now()),
                    "消息": None,
                    "数据": []
                }
                try:
                    for f1 in request.files.values():
                        file_data = hashlib.md5()
                        file_data.update(f1[0].body)
                        file_data = file_data.hexdigest()
                        file_data = F'{file_data}.{f1[0].name.split(".")[1]}'
                        file_uri = [
                            request.scheme,
                            "://",
                            request.server_name,
                            ":",
                            request.server_port,
                            "/file/download?name=",
                            file_data
                        ]
                        file_uri = "".join(str(f2) for f2 in file_uri)
                        exec_data["数据"].append(file_uri)
                        if (not db_file.exists(filename=file_data)):
                            file_data = db_file.put(
                                f1[0].body, filename=file_data)
                except Exception as e:
                    exec_data["运行"] = False
                    exec_data["消息"] = str(e)
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
            case "download":
                file = request.args.get("name")
                if (not os.path.isdir("文件/缓存")):
                    os.makedirs("文件/缓存")
                if (os.path.isfile(F'文件/缓存/{file}')):
                    return await file_stream(F'文件/缓存/{file}', filename=file)
                else:
                    if (db_file.exists(filename=file)):
                        file_data = db_file.get_version(filename=file)
                        with open(F'文件/缓存/{file}', "wb") as fp:
                            fp.write(file_data.read())
                        file_data.close()
                        return await file_stream(F'文件/缓存/{file}', filename=file)
                exec_data = {
                    "运行": False,
                    "时间": str(dt.now()),
                    "消息": "文件不存在！",
                    "数据": {
                        "访问协议": request.scheme,
                        "访问地址": request.ip,
                        "访问端口": request.port,
                        "访问路径": request.path,
                        "访问参数": request.args
                    }
                }
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
            case "list":
                exec_data = {
                    "运行": True,
                    "时间": str(dt.now()),
                    "消息": None,
                    "数据": None
                }
                try:
                    exec_data["数据"] = [
                        file.filename for file in db_file.find()]
                except Exception as e:
                    exec_data["运行"] = False
                    exec_data["消息"] = str(e)
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
            case "remove":
                exec_data = {
                    "运行": True,
                    "时间": str(dt.now()),
                    "消息": None,
                    "数据": []
                }
                try:
                    if (request.json):
                        for f1 in request.json:
                            exec_data["数据"].append(db_file.find_one(
                                {"filename": f1}
                            ))
                        for f1 in exec_data["数据"]:
                            db_file.delete(f1._id)
                        exec_data["数据"] = True
                except Exception as e:
                    exec_data["运行"] = False
                    exec_data["数据"] = False
                    exec_data["消息"] = str("无法找到文件或者文件不存在！")
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
            case "clean":
                exec_data = {
                    "运行": True,
                    "时间": str(dt.now()),
                    "消息": None,
                    "数据": True
                }
                try:
                    for f1 in os.listdir("文件/缓存"):
                        os.remove(F"文件/缓存/{f1}")
                    os.removedirs("文件/缓存")
                except:
                    exec_data["运行"] = False
                    exec_data["消息"] = "文件夹不存在"
                    exec_data["数据"] = False
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
            case _:
                exec_data = {
                    "运行": True,
                    "时间": str(dt.now()),
                    "消息": "暂无该功能",
                    "数据": {
                        "访问协议": request.scheme,
                        "访问地址": request.ip,
                        "访问端口": request.port,
                        "访问路径": request.path,
                        "访问参数": request.args
                    }
                }
                db_logs.insert_one(exec_data.copy())
                return json(exec_data)
    except Exception as e:
        exec_data = {
            "运行": False,
            "时间": str(dt.now()),
            "消息": F"错误原因：版本不支持match-case语句，请升级到3.10+版本。其他原因：{e}",
            "数据": {
                "访问地址": request.ip,
                "访问端口": request.port,
                "访问路径": request.path,
                "访问参数": request.args,
                "应用网址": "https://www.python.org/"
            }
        }
        db_logs.insert_one(exec_data.copy())
        return json(exec_data)


@app.websocket("/ws")
async def ws(request, ws):
    try:
        device_data = loads(await ws.recv())
        db_apis.update_one(
            {"标识": device_data["标识"]},
            {"$set": device_data.copy()},
            upsert=True
        )
        while (True):
            await asyncio.sleep(0.5)
            device_json = db_task.find_one_and_delete(
                {"时间": {"$lte": str(dt.now())}, "标识": device_data["标识"]},
                {"_id": 0}
            )
            if (not device_json):
                continue
            await ws.send(dumps(device_json))
            device_json = await ws.recv()
            device_json = loads(device_json)
            if ("数据" in device_json.keys()):
                db_data.insert_one(device_json.copy())
            else:
                db_apis.update_one(
                    {"标识": device_data["标识"]},
                    {"$set": device_json.copy()},
                    upsert=True
                )
            db_logs.insert_one(device_json)
        await ws.close()
    except Exception as e:
        device_json = {
            "状态": False,
            "时间": str(dt.now()),
            "消息": F"非设备Websocket数据结构请求。{str(e)}",
            "数据": {
                "访问地址": request.ip,
                "访问端口": request.port,
                "访问路径": request.path,
                "访问参数": request.args
            }
        }
        db_logs.insert_one(device_json.copy())
        await ws.send("非设备会话接入，进入聊天模式。")
        while True:
            await ws.send(dumps({"你输入的是": await ws.recv()}, ensure_ascii=False))


@app.route("/api/<api>", methods=["GET", "POST"])
async def api(request, api):
    match (api):
        case "data":
            api = request.json
            if ("时间" in api.keys() and "数量" in api.keys()):

                if (api["时间"] in [None, list()]):
                    api["查询"] = {
                        "时间": {
                            "$gte": str(dt.now().replace(hour=0, minute=0, second=0, microsecond=0) - td(days=1)),
                            "$lte": str(dt.now().replace(hour=0, minute=0, second=0, microsecond=0) + td(days=1))
                        }
                    }
                else:
                    api["查询"] = {
                        "时间": {
                            "$gte": api["时间"][0],
                            "$lte": api["时间"][1]
                        }
                    }
                if (not api["数量"]):
                    api["数量"] = 256
                api = list(db_data.find(
                    api["查询"], {"_id": 0}).limit(api["数量"]))
        case "status":  # <=================== 过滤其他数据模板示例 #
            api = list(db_apis.find({}, {"_id": 0}))
            for f1 in range(len(api)):
                for f2 in api[f1]["数据"]:
                    api[f1]["数据"] = [{"设备状态": f2["参数数据"]["设备状态"]}]
            db_task.insert_many(api.copy())
            await asyncio.sleep(5)
            for f1 in db_data.find({"设备状态": {"$exists": False}}):
                db_data.delete_one({"_id": f1["_id"]})
                del f1["_id"]
                db_devs.update_one({"标识": f1["标识"]}, {"$set": f1}, upsert=True)
            api = list(db_devs.find())
            for f1 in api:
                f1["_id"] = str(f1["_id"])
        ########################### 继承模板示例的接口开始 ###########################
        
        ########################### 继承模板示例的接口结束 ###########################
    return json(api)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app=F'{__file__.split("/")[-1].split("\\")[-1].split(".")[0]}:app',
        host="0.0.0.0",
        port=8000,
        reload=True
    )
