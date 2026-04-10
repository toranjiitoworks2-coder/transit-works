# トランジットWorks ホームページ

就労継続支援B型事業所「トランジットWorks」の公式ウェブサイトです。

## 施設情報

| 項目 | 内容 |
|------|------|
| 事業所名 | トランジットWorks |
| 種別 | 就労継続支援B型 |
| 運営 | 合同会社ウェルフェア |
| 所在地 | 大阪府交野市私部西1丁目1-11 ウシオビル3階 |
| 営業時間 | 月曜〜土曜 8:30〜15:30 |
| 定休日 | 日曜・祝日 |
| 電話 | 072-XXX-XXXX（公開時に差し替え） |

## ファイル構成

```
transit-works-split/
├── index.html          ... メインページ
├── style.css           ... スタイルシート
├── script.js           ... ローディング飛行機アニメーション
├── plane.png           ... ヒーロー横切り用飛行機画像（透過済み）
├── OIG3.jpg            ... 複葉機オリジナル画像
├── favicon.svg         ... ファビコン（SVG）
├── apple-touch-icon.png ... Apple用アイコン（180x180）
├── manifest.json       ... PWAマニフェスト
├── 404.html            ... エラーページ
└── README.md           ... このファイル
```

## 公開前に差し替えが必要な箇所

以下の箇所はダミー値になっています。公開前に実際の値に差し替えてください。

### 電話番号（3箇所）
- `index.html` 206行目 アクセスセクション: `072-XXX-XXXX`
- `index.html` 219行目 CTAボタン `tel:` リンク: `072XXXXXXX`
- `index.html` 241行目 フッター: `072-XXX-XXXX`

### OGP画像（2箇所）
- `index.html` 17行目: `og:image` → 実際の画像URLに差し替え
- `index.html` 25行目: `twitter:image` → 同上

### ドメイン（3箇所）
- `index.html` 10行目: `canonical` URL
- `index.html` 16行目: `og:url`
- OGP画像URL（上記2箇所）

### SNSリンク（2箇所）
- `index.html` 245行目: Instagram URL → 実際のアカウントURLに差し替え
- `index.html` 246行目: LINE URL → 実際のURLに差し替え

### 写真
- ヒーローセクションのスライドショー: `hero-strip-img` 内の `<span>` を `<img>` に差し替え
- About usセクション: `about-photo` にイメージを追加
- 作品紹介セクション: 各 `works-thumb` にイメージを追加

### その他
- ニュース記事: ダミーの日付・内容を実際のものに差し替え
- `view more →` リンク: 実際のリンク先を設定
- `favicon.ico`: 必要に応じてICO形式のファビコンを用意

## 更新方法

### お知らせの追加
`index.html` の `<!-- ===== News ===== -->` セクション内の `.news-list` に以下の形式で追加:
```html
<a href="リンク先" class="news-item sa"><time>2024.01.01</time><span class="news-cat">お知らせ</span><span class="news-text">記事タイトル</span><span class="news-arrow">&rarr;</span></a>
```

### 作品の追加
`<!-- ===== Works ===== -->` セクション内の `.works-grid` に以下の形式で追加:
```html
<div class="works-card sa"><div class="works-thumb"><img src="画像パス" alt="作品名"></div><h3>作品名</h3><p>説明文</p></div>
```

### 写真の差し替え
ヒーローのスライドショーに写真を入れる場合:
```html
<!-- before -->
<div class="hero-strip-img"><span>01</span></div>
<!-- after -->
<div class="hero-strip-img"><img src="photo01.jpg" alt="説明" width="300" height="200" loading="lazy"></div>
```

## 技術仕様

- HTML5 / CSS3 / Vanilla JavaScript
- フォント: Noto Sans JP (Google Fonts)
- レスポンシブ対応: 1024px / 768px / 480px ブレイクポイント
- アニメーション: CSS transitions + IntersectionObserver + Canvas particles
- ローディング: Canvas飛行機アニメーション (script.js)
