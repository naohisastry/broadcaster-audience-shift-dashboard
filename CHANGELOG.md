# Changelog

All notable changes to the Broadcaster Audience Shift Evidence Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-09-19
### Added
- **日米英3カ国CTV比較カード（Card 4）の完全幾何学ピクセル同期**:
  - Chart.js の `afterFit` フックにより、3カードすべてのY軸レイアウト幅を強制的に `140px` に固定。
  - カード幅（347px）からY軸幅（140px）を引いた有効バー描画エリアを **「207px」** で全カード共通の1:1物理同期化。
  - 横軸の最大値を「40%」に完全統一し、グラフを跨いでもバーの長さが直接ミリ単位で比較可能に。
  - 12文字以上の事業者名ラベルに対する動的フォントサイズ縮小（9.5〜10.5px）を導入し、ラベル欠けを根絶。
- **リポジトリ標準仕様の完全整備**:
  - `METHODOLOGY.md`: 視聴行動転換、広告市場サチレーション数理モデル、欧州4局財務補完率、CTV画面シェア正規化手法を体系化。
  - `DATA_SOURCES.md`: 全5タブにわたる公的統計・IR資料の完全出典・URLリンク集を改訂。
  - `sitemap.xml`, `LICENSE` (MIT), `.gitignore` を追加配備。

### Changed
- **タブナビゲーションの視認性最適化**:
  - 各タブタイトルの括弧内補足を削除（「① 視聴行動の10年推移」「② 広告市場の逆転と配信の飽和限界」「③ 欧州主要4局 財務スコアカード」「④ コネクテッドTVの視聴動態」「⑤ 一次データ出典・根拠」）。
  - 金融端末基準（Bloomberg / FactSet）のフォント・パディング設定により、1280px以上のデスクトップ環境で全タブが美しい1行配置に収まるように最適化。画面縮小時は2段構成で綺麗に折り返すレスポンシブ対応を実装。
- **ヘッダータイトルの洗練**:
  - 公式タイトルを「放送事業者の視聴者接点再編：日米欧10年データで読み解く構造転換」へ更新。

---

## [2.0.0] - 2026-09-18
### Added
- **Tab ④ コネクテッドTV（CTV）とYouTubeの台頭モジュールを全面新設**:
  - 米国Nielsen『The Gauge』、英国BARB、日本REVISIOの3カ国受像機シェア比較カード。
  - 「配信内シェア (100%換算)」と「全テレビ画面シェア」のインタラクティブ切替トグルボタンを実装。
  - 日本のCTV普及率74.2%および大画面YouTube利用時間シェア（38.5%）のエビデンスデータを統合。
- **Tab ③ 欧州主要4局（TF1, ITV, ProSiebenSat.1, M6）財務スコアカードを新設**:
  - リニア放送広告減収 vs デジタル配信増収のデジタル補完率（$R_{\text{comp}}$）数理モデルを実装。
  - 4局全社のNet Impact（純インパクト）がマイナスである実態をウォーターフォール比較として可視化。

---

## [1.1.0] - 2026-09-16
### Added
- **第1タブ（テレビ視聴の構造変容）の日仏直接対比化**:
  - 世代別同質セグメント（若年層・現役層・シニア層）の直接突き合わせチャート。
  - 若年層におけるテレビ vs ネット動画の歴史的逆転年次のタイムライン可視化。

---

## [1.0.0] - 2026-09-16
### Added
- **Initial Release of Broadcaster Audience Shift Evidence Dashboard**:
  - 単体完結型SPAアーキテクチャの確立。
  - Chart.js による対話型チャート描画機能。
