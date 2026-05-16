#!/usr/bin/env python3
import yt_dlp
import sys
import os

os.environ.pop('http_proxy', None)
os.environ.pop('https_proxy', None)
os.environ.pop('HTTP_PROXY', None)
os.environ.pop('HTTPS_PROXY', None)

def download_bilibili_video(url, output_path='.'):
    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'outtmpl': f'{output_path}/%(title)s.%(ext)s',
        'nocheckcertificate': True,
        'source_address': '0.0.0.0',
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com/',
        },
        'verbose': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            print(f"正在解析: {url}")
            info = ydl.extract_info(url, download=True)
            print(f"\n✅ 下载成功！")
            print(f"标题: {info.get('title', '未知')}")
            print(f"时长: {info.get('duration', 0)} 秒")
            print(f"上传者: {info.get('uploader', '未知')}")
            return True
    except Exception as e:
        print(f"\n❌ 下载失败: {str(e)}", file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("用法: python bilibili_downloader.py <视频URL>")
        sys.exit(1)
    
    url = sys.argv[1]
    download_bilibili_video(url)
