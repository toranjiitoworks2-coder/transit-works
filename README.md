# トランジットWorks ホームページ

就労継続支援B型事業所「トランジットWorks」の公式ウェブサイトです。

- 公開URL: https://transit-works.pages.dev/
- 更新画面（CMS）: https://transit-works.pages.dev/admin/

## 施設情報

| 項目 | 内容 |
|------|------|
| 事業所名 | トランジットWorks |
| 種別 | 就労継続支援B型 |
| 運営 | 合同会社ウェルフェア |
| 所在地 | 〒576-0066 大阪府交野市青山3丁目17-2 |
| 利用時間（平日） | 9:30〜15:30（月〜金）昼食あり |
| 利用時間（土曜・祝日） | 9:30〜12:00 ※昼食の提供はありません |
| 休業日 | 日曜・年末年始（12/30〜1/3） |
| 電話 | 072-860-7737 |
| お電話受付 | 8:30〜17:30（日曜・年末年始を除く） |
| Instagram | [@toranjittoworks](https://www.instagram.com/toranjittoworks) |

サイトに表示する施設情報は、CMSの「基本情報」（`_data/settings.json`）で管理しています。
変更するときはCMSを直してください。この表は説明用の控えなので、あわせて直しておくと安心です。

## ファイル構成

```
transit-works/
├── index.html          ... メインページ（_data/ のJSONを読み込んで表示）
├── style.css           ... スタイルシート
├── script.js           ... ローディング画面の飛行機アニメーション
├── 404.html            ... エラーページ
├── _data/              ... CMSで編集するデータ（お知らせ・基本情報・FAQなど）
├── admin/              ... CMS（Decap CMS）の画面と設定（config.yml）
├── functions/oauth/    ... CMSにGitHubでログインするための処理（Cloudflare Pages Functions）
├── images/             ... 画像（images/uploads/ はCMSでアップロードした画像）
├── music/              ... 音楽作品の音声・ジャケット画像
├── scripts/            ... 自動処理用のスクリプト（画像の圧縮・サイトマップ更新）
├── .github/workflows/  ... GitHub Actions の設定
├── sitemap.xml / robots.txt ... 検索サイト向けのファイル
├── manifest.json       ... PWAマニフェスト
├── favicon.svg / favicon.ico / apple-touch-icon.png ... アイコン
├── ogp.jpg             ... SNSで共有されたときの画像
└── README.md           ... このファイル
```

## 更新方法

ふだんの更新は、CMS（https://transit-works.pages.dev/admin/）から行います。
保存すると GitHub に記録され、サイトに自動で反映されます。

| CMSのメニュー | 内容 | データのファイル |
|------|------|------|
| お知らせ | お知らせ・イベント情報 | `_data/news.json` |
| 施設紹介・代表メッセージ | 施設紹介の文章・数字 | `_data/about.json` |
| トップページ | トップのスライドショーなど | `_data/hero.json` |
| 活動内容 | 活動内容 | `_data/activities.json` |
| 作品紹介 | 作品紹介 | `_data/works.json` |
| 作品ギャラリー（Voyage） | 作品ギャラリー | `_data/gallery.json` |
| ご利用条件（Target） | ご利用条件 | `_data/target.json` |
| ご利用案内（Guide） | 送迎・昼食など | `_data/guide.json` |
| ご利用の流れ（Flow） | ご利用の流れ | `_data/flow.json` |
| よくある質問 | FAQ | `_data/faq.json` |
| 基本情報 | 所在地・利用時間・休業日など | `_data/settings.json` |

- 検索サイト向けの情報（構造化データ）の営業時間・電話番号・住所は、「基本情報」の内容から自動で作られます。
  利用時間は「9:30〜15:30（月〜金）」のように、時刻と曜日を「〜」でつないで書いてください。
- `index.html` に直接書かれている文字は、データを読み込む前に一瞬だけ表示される初期表示です。
  CMSの内容を大きく変えたときは、こちらもそろえておくと安心です。

## 自動で行われる処理（GitHub Actions）

- **アップロード画像の自動圧縮**（`optimize-images.yml`）: CMSでアップロードした画像を縮小・圧縮し、WebP版を作ります。
- **サイトマップの最終更新日の自動更新**（`update-sitemap.yml`）: `index.html` や `_data/` が更新されると、`sitemap.xml` の日付を更新します。

これらは GitHub 上で自動的にコミットされるため、手元からプッシュする前に `git pull` で最新を取り込んでください。

## 技術仕様

- HTML5 / CSS3 / Vanilla JavaScript
- 公開: Cloudflare Pages
- CMS: Decap CMS（GitHub ログイン）
- フォント: Noto Sans JP (Google Fonts)
- レスポンシブ対応: 1280px / 1024px / 768px / 600px / 480px ブレイクポイント
- アニメーション: CSS transitions + IntersectionObserver + Canvas
- ローディング: Canvas飛行機アニメーション (script.js)
