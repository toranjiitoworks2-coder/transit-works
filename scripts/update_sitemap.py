"""sitemap.xml の最終更新日（lastmod）を、サイトの内容が最後に更新された日にそろえる。

GitHub Actions（.github/workflows/update-sitemap.yml）から実行する。手元でも
`python scripts/update_sitemap.py` で同じ処理を実行できる（リポジトリのルートで実行）。

- 「サイトの内容」は index.html と _data/ のファイル（CMSで保存されるデータ）
- 日付は、それらを最後に変更したコミットの日付（日本時間）
- lastmod が古いときだけ書き換える（日付が戻ることはない。2回実行しても同じ結果）
"""
import os
import re
import subprocess
import sys

SITEMAP = 'sitemap.xml'
CONTENT_PATHS = ['index.html', '_data']
SITE_URL = 'https://transit-works.pages.dev/'


def last_content_date():
    """index.html と _data/ を最後に変更したコミットの日付（日本時間、YYYY-MM-DD）"""
    env = dict(os.environ, TZ='Asia/Tokyo')
    out = subprocess.run(
        ['git', 'log', '-1', '--format=%cd', '--date=format-local:%Y-%m-%d', '--', *CONTENT_PATHS],
        capture_output=True, text=True, check=True, env=env,
    ).stdout.strip()
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', out):
        sys.exit('サイトの内容を変更したコミットが見つかりません')
    return out


def main():
    date = last_content_date()
    with open(SITEMAP, encoding='utf-8', newline='') as f:
        xml = f.read()
    # トップページ（SITE_URL）の <url> の中の <lastmod> を書き換える
    pattern = re.compile(r'(<loc>' + re.escape(SITE_URL) + r'</loc>\s*<lastmod>)(\d{4}-\d{2}-\d{2})(</lastmod>)')
    m = pattern.search(xml)
    if not m:
        sys.exit('sitemap.xml にトップページの lastmod が見つかりません')
    if m.group(2) >= date:
        print(f'変更なし（lastmod {m.group(2)} / サイトの最終更新 {date}）')
        return
    xml = pattern.sub(lambda x: x.group(1) + date + x.group(3), xml, count=1)
    with open(SITEMAP, 'w', encoding='utf-8', newline='') as f:
        f.write(xml)
    print(f'lastmod を {m.group(2)} → {date} に更新')


if __name__ == '__main__':
    main()
