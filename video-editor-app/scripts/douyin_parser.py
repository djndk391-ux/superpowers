#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
抖音短视频无水印解析工具
支持功能:
1. 短链还原 - 自动处理 https://v.douyin.com/xxxxxx/ 短链接
2. 数据获取 - 通过API获取视频详情
3. 去水印 - 自动获取无水印视频直链
4. 信息提取 - 标题、封面图、音频链接

使用方法:
1. 修改下面的 INPUT_URL 为你的抖音分享链接
2. 运行脚本: python douyin_parser.py
3. 查看解析结果

依赖安装:
pip install requests
"""

import requests
import re
import json
import time
from urllib.parse import urlparse, parse_qs

# ================== 配置区域 ==================
# 在这里填入你的抖音分享链接
INPUT_URL = "https://v.douyin.com/iEx4mple/"  # 示例链接，请替换为真实链接

# 请求配置
TIMEOUT = 10  # 超时时间(秒)
MAX_RETRIES = 3  # 最大重试次数
# ===============================================


class DouyinParser:
    """抖音视频解析器"""
    
    def __init__(self):
        self.session = requests.Session()
        # 模拟iPhone Safari浏览器，防止被拦截
        self.headers = {
            "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
        }

    def log_info(self, message):
        """打印信息日志"""
        print(f"[INFO] {message}")

    def log_error(self, message):
        """打印错误日志"""
        print(f"[ERROR] {message}")

    def log_success(self, message):
        """打印成功日志"""
        print(f"[SUCCESS] {message}")

    def expand_short_url(self, url):
        """
        步骤1: 短链还原
        不跟随重定向，直接获取301/302的Location头
        """
        self.log_info("开始还原短链接...")
        
        for attempt in range(MAX_RETRIES):
            try:
                # 使用 allow_redirects=False 不跟随重定向
                response = self.session.head(
                    url,
                    headers=self.headers,
                    timeout=TIMEOUT,
                    allow_redirects=False
                )
                
                # 获取Location头
                if response.status_code in [301, 302]:
                    real_url = response.headers.get('Location', '')
                    if real_url:
                        self.log_info(f"成功还原短链接: {real_url}")
                        return real_url
                elif response.status_code == 200:
                    # 如果直接返回200，可能是已经是长链接
                    self.log_info("链接已是完整形式")
                    return url
                
                self.log_error(f"状态码: {response.status_code}, 重试 {attempt + 1}/{MAX_RETRIES}")
                
            except Exception as e:
                self.log_error(f"短链还原失败: {str(e)}, 重试 {attempt + 1}/{MAX_RETRIES}")
            
            time.sleep(1)  # 重试前等待1秒
        
        return None

    def extract_aweme_id(self, url):
        """从链接中提取视频ID (Aweme ID)"""
        self.log_info("开始提取视频ID...")
        
        # 尝试多种正则匹配模式
        patterns = [
            r'/video/(\d+)',  # 标准视频页面
            r'/note/(\d+)',   # 图文笔记页面
            r'aweme_id=(\d+)', # URL参数
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                aweme_id = match.group(1)
                self.log_success(f"成功提取视频ID: {aweme_id}")
                return aweme_id
        
        self.log_error("无法从链接中提取视频ID")
        return None

    def get_video_detail(self, aweme_id):
        """
        步骤2: 获取视频详情数据
        """
        self.log_info(f"开始获取视频详情 (ID: {aweme_id})...")
        
        # 使用稳定的API接口
        api_url = f"https://www.iesdouyin.com/aweme/v1/web/aweme/detail/"
        
        params = {
            "aweme_id": aweme_id,
            "aid": 6383,
        }
        
        for attempt in range(MAX_RETRIES):
            try:
                response = self.session.get(
                    api_url,
                    headers=self.headers,
                    params=params,
                    timeout=TIMEOUT
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status_code") == 0:
                        self.log_success("成功获取视频详情数据")
                        return data
                    else:
                        self.log_error(f"API返回错误: {data.get('status_msg', '未知错误')}")
                else:
                    self.log_error(f"请求失败，状态码: {response.status_code}")
                
            except Exception as e:
                self.log_error(f"获取详情失败: {str(e)}, 重试 {attempt + 1}/{MAX_RETRIES}")
            
            time.sleep(1)
        
        return None

    def remove_watermark(self, url):
        """
        步骤3: 去水印处理
        替换 playwm 为 play，或设置 wm=0
        """
        if not url:
            return None
        
        # 方法1: 替换 playwm -> play
        if 'playwm' in url:
            return url.replace('playwm', 'play')
        
        # 方法2: 修改参数 wm=0
        if 'wm=1' in url:
            return url.replace('wm=1', 'wm=0')
        
        return url

    def parse_data(self, data):
        """解析返回的数据，提取需要的字段"""
        self.log_info("开始解析视频数据...")
        
        try:
            aweme_data = data.get("aweme_detail", {})
            
            # 提取标题
            title = aweme_data.get("desc", "无标题")
            
            # 提取封面图
            cover_url = ""
            video_data = aweme_data.get("video", {})
            if video_data:
                # 获取高清封面
                cover_list = video_data.get("cover", {}).get("url_list", [])
                if cover_list:
                    cover_url = cover_list[0]
            
            # 提取无水印视频
            video_url = ""
            play_data = video_data.get("play_addr", {})
            if play_data:
                url_list = play_data.get("url_list", [])
                if url_list:
                    video_url = self.remove_watermark(url_list[0])
            
            # 提取背景音乐
            music_url = ""
            music_data = aweme_data.get("music", {})
            if music_data:
                music_play = music_data.get("play_url", {}).get("url_list", [])
                if music_play:
                    music_url = music_play[0]
            
            # 提取作者信息
            author_name = ""
            author_data = aweme_data.get("author", {})
            if author_data:
                author_name = author_data.get("nickname", "未知作者")
            
            self.log_success("数据解析完成！")
            
            return {
                "title": title,
                "video_url": video_url,
                "cover_url": cover_url,
                "music_url": music_url,
                "author": author_name,
                "aweme_id": aweme_data.get("aweme_id", ""),
            }
            
        except Exception as e:
            self.log_error(f"解析数据失败: {str(e)}")
            return None

    def parse(self, url):
        """完整解析流程"""
        print("="*50)
        print("  抖音视频无水印解析工具")
        print("="*50)
        
        # 1. 验证URL
        if not url or not url.startswith("http"):
            self.log_error("无效的URL链接")
            return None
        
        self.log_info(f"开始解析: {url}")
        
        # 2. 短链还原
        real_url = self.expand_short_url(url)
        if not real_url:
            self.log_error("短链还原失败")
            return None
        
        # 3. 提取视频ID
        aweme_id = self.extract_aweme_id(real_url)
        if not aweme_id:
            self.log_error("无法提取视频ID")
            return None
        
        # 4. 获取视频详情
        data = self.get_video_detail(aweme_id)
        if not data:
            self.log_error("获取视频详情失败")
            return None
        
        # 5. 解析数据
        result = self.parse_data(data)
        
        # 6. 输出结果
        print("\n" + "="*50)
        print("  解析结果")
        print("="*50)
        if result:
            print(f"📱 标题: {result['title']}")
            print(f"👤 作者: {result['author']}")
            print(f"🎬 无水印视频: {result['video_url']}")
            print(f"🖼️  封面图: {result['cover_url']}")
            print(f"🎵 背景音乐: {result['music_url']}")
            print(f"🆔 视频ID: {result['aweme_id']}")
            print("="*50)
            
            # 保存结果到文件
            self.save_result(result)
        
        return result

    def save_result(self, result):
        """保存解析结果到JSON文件"""
        try:
            filename = f"douyin_result_{result['aweme_id']}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2)
            self.log_success(f"结果已保存到: {filename}")
        except Exception as e:
            self.log_error(f"保存结果失败: {str(e)}")


def main():
    """主函数"""
    # 创建解析器
    parser = DouyinParser()
    
    # 使用配置的URL进行解析
    if INPUT_URL and INPUT_URL != "https://v.douyin.com/iEx4mple/":
        parser.parse(INPUT_URL)
    else:
        print("请修改脚本中的 INPUT_URL 变量，填入真实的抖音分享链接！")
        print("示例链接: https://v.douyin.com/.../")


if __name__ == "__main__":
    main()
