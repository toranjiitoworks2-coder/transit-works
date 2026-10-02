"""CMSでアップロードされた画像（images/uploads/）を自動で縮小・圧縮し、WebP版を作る。

GitHub Actions（.github/workflows/optimize-images.yml）から実行する。手元でも
`python scripts/optimize_uploads.py` で同じ処理を実行できる（リポジトリのルートで実行）。

- 処理済みかどうかは _data/webp.json に載っているかで判断する（2回実行しても同じ結果）
- スマホで撮った写真の向きを直し、撮影情報（位置情報などのEXIF）を削除する
- 長い辺を2048pxまでに縮小し、JPEGは画質80で圧縮する。透過のあるPNGはPNGのまま
- HEIC／透過のないPNGはJPEGに変換し、_data/*.json の参照を新しいファイル名に書き換える
- WebP版を作り、_data/webp.json に追加する（サイトはWebP対応ブラウザにWebPを出す）
"""
import glob
import io
import json
import os
import sys

from PIL import Image, ImageOps

try:  # iPhoneのHEIC形式（GitHub Actionsでは pillow-heif を入れて使う）
    from pillow_heif import register_heif_opener
    register_heif_opener()
    HEIF = True
except Exception:  # 未インストール、または環境の制限で読み込めない時はHEICだけスキップする
    HEIF = False

UPLOADS = 'images/uploads'
MANIFEST = '_data/webp.json'
DATA_GLOB = '_data/*.json'
MAX_EDGE = 2048
JPEG_QUALITY = 80
WEBP_QUALITY = 78
TARGET_EXT = {'.jpg', '.jpeg', '.png', '.heic', '.heif'}


def public_path(path):
    """リポジトリ内のパス → サイト上のパス（CMSのデータに書かれる形）"""
    return '/' + path.replace(os.sep, '/')


def has_alpha(im):
    if im.mode in ('RGBA', 'LA') or (im.mode == 'P' and 'transparency' in im.info):
        alpha = im.convert('RGBA').getchannel('A')
        return alpha.getextrema()[0] < 255  # 実際に透けている画素があるか
    return False


def save_jpeg(im, icc):
    buf = io.BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=JPEG_QUALITY, optimize=True, progressive=True, icc_profile=icc)
    return buf.getvalue()


def replace_references(old_pub, new_pub):
    """_data/*.json の中の画像の参照を書き換える"""
    changed = []
    for p in glob.glob(DATA_GLOB):
        if p.replace(os.sep, '/') == MANIFEST:
            continue
        with open(p, encoding='utf-8', newline='') as f:
            s = f.read()
        if old_pub in s:
            with open(p, 'w', encoding='utf-8', newline='') as f:
                f.write(s.replace(old_pub, new_pub))
            changed.append(p)
    return changed


def main():
    if not os.path.isdir(UPLOADS):
        print(f'{UPLOADS} がないため、処理する画像はありません')
        return 0
    with open(MANIFEST, encoding='utf-8') as f:
        manifest = json.load(f)
    done = set(manifest.get('files', []))
    results = []
    for root, _, files in os.walk(UPLOADS):
        for name in sorted(files):
            path = os.path.join(root, name)
            stem, ext = os.path.splitext(path)
            ext_l = ext.lower()
            if ext_l not in TARGET_EXT or public_path(path) in done:
                continue
            if ext_l in ('.heic', '.heif') and not HEIF:
                print(f'スキップ（HEICを読むには pillow-heif が必要）: {path}')
                continue
            before = os.path.getsize(path)
            im = Image.open(path)
            icc = im.info.get('icc_profile')
            im = ImageOps.exif_transpose(im)  # 向きを直す（EXIFは保存時に書き出さないので削除される）
            w0, h0 = im.size
            if max(im.size) > MAX_EDGE:
                s = MAX_EDGE / max(im.size)
                im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
            keep_png = ext_l == '.png' and has_alpha(im)
            if keep_png:
                out_path = path
                buf = io.BytesIO()
                im.convert('RGBA').save(buf, 'PNG', optimize=True)
                data = buf.getvalue()
                webp_kw = dict(lossless=True, quality=100)
            else:
                out_path = path if ext_l in ('.jpg', '.jpeg') else stem + '.jpg'
                data = save_jpeg(im, icc)
                webp_kw = dict(quality=WEBP_QUALITY)
            with open(out_path, 'wb') as f:
                f.write(data)
            refs = []
            if out_path != path:  # 形式を変えた時は元のファイルを消して参照を書き換える
                os.remove(path)
                refs = replace_references(public_path(path), public_path(out_path))
            wbuf = io.BytesIO()
            (im.convert('RGBA') if keep_png else im.convert('RGB')).save(wbuf, 'WEBP', method=6, **webp_kw)
            with open(os.path.splitext(out_path)[0] + '.webp', 'wb') as f:
                f.write(wbuf.getvalue())
            done.add(public_path(out_path))
            results.append((path, out_path, before, len(data), len(wbuf.getvalue()), f'{w0}x{h0}', f'{im.width}x{im.height}', refs))
    if not results:
        print('新しい画像はありません')
        return 0
    manifest['files'] = sorted(done)
    with open(MANIFEST, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write('\n')
    for path, out, before, after, webp, d0, d1, refs in results:
        note = f'  （{os.path.basename(out)} に変換、参照を更新: {", ".join(refs) or "なし"}）' if out != path else ''
        print(f'{path}: {d0} → {d1}, {before / 1024:.0f}KB → {after / 1024:.0f}KB（WebP {webp / 1024:.0f}KB）{note}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
