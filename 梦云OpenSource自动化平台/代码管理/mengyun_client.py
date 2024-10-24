#   mengyun_client.py SDK的主要包含文件
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

from time import sleep
from streamlit import *
from os.path import isfile
from json import dumps, loads
from requests import get, post
from mimetypes import guess_type
from datetime import datetime as dt, timedelta as td
from inspect import currentframe, getmembers, isfunction


uri = None
if (isfile("文件/梦云代码管理.json")):
    with open("文件/梦云代码管理.json", "r", encoding="UTF-8") as fp:
        uri = loads(fp.read())["uri"]


class 函数:
    def 数据提交(uri):
        col_code = list(columns(2))
        code_data = col_code[0].text_area(
            "##### 请键入JavaScript代码",
            height=500,
            key=F"{currentframe().f_code.co_name}{uri}"
        )
        col_code[1].markdown("### 代码预览")
        if (code_data == str()):
            col_code[1].markdown("---\n##### 您还没有键入字符哦。请在右侧键入字符 =>")
        else:
            with col_code[1]:
                col_name = list(columns(3))
                code_name = col_name[0].text_input("请键入名称", key=F"{uri}name")
                code_mac = col_name[1].text_input("请键入MAC", key=F"{uri}mac")
                col_name[2].markdown("\n" * 4)
                if (col_name[2].button("提交", key=F"{uri}button")):
                    code_data = post(F"{uri}/push", json={
                        "时间": str(dt.now()),
                        "标识": code_mac,
                        "名称": code_name,
                        "运行": None,
                        "统计": dict(),
                        "数据": [code_data]
                    }).json()
                    toast("提交成功" if (code_data["运行"])else "提交失败")
                    if (code_data["运行"]):
                        balloons()
                    else:
                        snow()
                    code_data = dumps(
                        {"服务器返回消息": code_data},
                        indent=4,
                        ensure_ascii=False
                    )
            col_code[1].markdown(F"```javascript\n{code_data}\n```")

    def 数据操作(uri):
        data_json = date_input(
            "请选择日期",
            (dt.now().replace(hour=0, minute=0, second=0, microsecond=0) - td(days=1),
                dt.now().replace(hour=0, minute=0, second=0, microsecond=0) + td(days=1)),
            format="YYYY/MM/DD",
            key=F"{currentframe().f_code.co_name}{uri}"
        )
        data_json = post(F"{uri}/pull", json={
            "数量": 1024**3,
            "时间": [f1.strftime("%F %H:%M:%S.%f") for f1 in data_json]
        })
        if (data_json.status_code == 200):
            markdown(F'''##### **{data_json.json()["时间"]}** 在服务器上执行：{
                "成功" if (data_json.json()["运行"]) else "失败"}，以下是执行结果。''')
            col_number = 9
            col_expander = list(columns(col_number))
            for f1 in range(len(data_json.json()["数据"])):
                f1d = data_json.json()["数据"]
                if (not "名称" in f1d[f1].keys()):
                    f1d[f1].update({"名称": f1d[f1]["标识"]})
                with col_expander[f1 % col_number].popover(f1d[f1]["名称"]):
                    col_name_button = list(columns([7, 2]))
                    if ("数据" in f1d[f1].keys()):
                        f1code = f1d[f1]["数据"]
                        if ("运行" in f1d[f1].keys()):
                            match(f1d[f1]["运行"]):
                                case True: f1d[f1]["运行"] = "成功"
                                case False: f1d[f1]["运行"] = "失败"
                                case None: f1d[f1]["运行"] = "未运行"
                        if ("统计" in f1d[f1].keys()):
                            if (f1d[f1]["统计"] != dict()):
                                f1d[f1]["统计"] = "，".join(
                                    [F"{f2k}：{f2v}" for f2k,
                                        f2v in f1d[f1]["统计"].items()]
                                )
                            else:
                                del f1d[f1]["统计"]
                        f1d[f1]["数据"] = "".join(f1d[f1]["数据"])
                        col_name_button[0].markdown(
                            F'''### 代码详情：{f1d[f1]["名称"]}''')
                    else:
                        del f1d[f1]["名称"]
                        col_name_button[0].markdown(
                            F'''### 设备详情：{f1d[f1]["标识"]}''')
                        f1d[f1]["状态"] = dt.strptime(
                            f1d[f1]["时间"],
                            "%Y-%m-%d %H:%M:%S"
                        )
                        f1d[f1]["状态"] = dt.now() - f1d[f1]["状态"]
                        if f1d[f1]["状态"] > td(seconds=10):
                            f1d[f1]["状态"] = "离线"
                        else:
                            f1d[f1]["状态"] = "在线"
                    if (col_name_button[1].button("删除", key=F'button_{f1d[f1]["_id"]}')):
                        if (post(F"{uri}/remove", json=[f1d[f1]["_id"]]).json()["数据"]):
                            warning("删除成功，正在关闭窗口。")
                        else:
                            warning("删除失败，正在关闭窗口。")
                        sleep(1)
                        rerun()
                    markdown("---")
                    table({"数据": f1d[f1]})
                    if ("数据" in f1d[f1].keys()):
                        for f2 in range(len(f1code)):
                            markdown(F"---\n#### 源代码{f2 + 1}/{len(f1code)}")
                            markdown(F"```javascript\n{f1code[f2]}\n```")


class 页面:
    def 文档帮助():
        if (isfile("文件/文档说明.md")):
            with open("文件/文档说明.md", "r", encoding="UTF-8") as fp:
                markdown(fp.read())
        else:
            markdown("## 帮助文档")
            markdown("---")
            markdown("找不到文档说明，请把文档放入 “文件/文档说明.md” 中在试试！")

    def 设备信息():
        markdown("## 设备信息")
        函数.数据操作(F"{uri}/api/device")

    def 任务日志():
        markdown("## 任务信息")
        函数.数据操作(F"{uri}/api/data")

    def 队列任务():
        markdown("## 队列添加")
        函数.数据提交(F"{uri}/api/task")
        markdown("---")
        markdown("## 队列信息")
        函数.数据操作(F"{uri}/api/task")

    def 代码管理():
        markdown("## 源码添加")
        函数.数据提交(F"{uri}/api/code")
        markdown("---")
        markdown("## 源码信息")
        函数.数据操作(F"{uri}/api/code")

    def 文件管理():
        markdown("## 文件管理")
        markdown("---")
        markdown("### 添加文件")
        # col_file = list(columns(2))
        files = file_uploader(
            label="文件上传",
            accept_multiple_files=True,
            label_visibility="hidden"
        )
        files = ((file.name, file.read()) for file in files)
        files = post(F"{uri}/file/upload", files=files).json()
        markdown("### 预览文件（已上传）")
        col_files = list(columns(len(files)))
        for f11, f12 in zip(col_files, files["数据"]):
            f11.image(f12)
        markdown("---")
        markdown("### 文件列表")
        files = get(F"{uri}/file/list").json()
        if (files["运行"]):
            col_files = list(columns(5))
            for f1 in range(len(files["数据"])):
                if ("image" in guess_type(files["数据"][f1])[0]):
                    with col_files[f1 % 10].popover(files["数据"][f1]):
                        image(F"{uri}/file/download?name={files["数据"][f1]}")
                        col_type = list(columns([8, 2]))
                        col_type[0].markdown(F"#### 文件：{files["数据"][f1]}")
                        if (col_type[1].button("删除", key=F'button{files["数据"][f1]}')):
                            if (post(F"{uri}/file/remove", json=[files["数据"][f1]]).json()["数据"]):
                                warning("删除成功，正在关闭窗口。")
                            else:
                                warning("删除失败，正在关闭窗口。")
                            sleep(1)
                            rerun()
                if ("video" in guess_type(files["数据"][f1])[0]):
                    with col_files[f1 % 10].popover(files["数据"][f1]):
                        video(F"{uri}/file/download?name={files["数据"][f1]}")
                        col_type = list(columns([8, 2]))
                        col_type[0].markdown(F"#### 文件：{files["数据"][f1]}")
                        if (col_type[1].button("删除", key=F'button{files["数据"][f1]}')):
                            if (post(F"{uri}/file/remove", json=[files["数据"][f1]]).json()["数据"]):
                                warning("删除成功，正在关闭窗口。")
                            else:
                                warning("删除失败，正在关闭窗口。")
                            sleep(1)
                            rerun()

        else:
            warning(files["消息"])


def 函数解析(pointer_meun):  # 包含菜单布局
    pointer_meun = [
        function[1] for function in getmembers(pointer_meun, predicate=isfunction)
    ]
    pointer_meun = [页面.文档帮助, 页面.设备信息, 页面.任务日志, 页面.队列任务, 页面.代码管理, 页面.文件管理]
    for f1t, f1d in zip(tabs([function.__name__ for function in pointer_meun]), range(len(pointer_meun))):
        pointer_meun[f1d] = [
            pointer_meun[f1d].__name__,
            f1t,
            pointer_meun[f1d]
        ]
    for f1p in pointer_meun:
        with f1p[1]:
            try:
                f1p[2]()
            except Exception as e:
                error(
                    F"函数：“{currentframe().f_code.co_name}” 抛出异常，致命错误：{e}。"
                )


def main():
    if (True):
        set_page_config(
            page_title="梦云OpenSource自动化代码管理平台",
            page_icon="🧊",
            layout="wide",
            initial_sidebar_state="expanded",
            menu_items={
                "Get Help": "https://github.com/nyqmxl/Android_Automated_Management",
                "Report a bug": "https://github.com/nyqmxl/Android_Automated_Management",
                "About": "#### 梦云OpenSource自动化代码管理平台\n\n**帮助您快速搭建平台**"
            }
        )
    if (False):
        with sidebar:
            markdown("你好，我的世界！")
    markdown("# 欢迎访问，梦云OpenSource自动化代码管理平台。")
    if (True):
        函数解析(页面)


if (__name__ == "__main__"):
    main()
