# Changelog

All notable changes to the Broadcaster Audience Shift Evidence Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.10.0] - 2026-09-30
### Changed
- **校了原稿・一次データ検証に基づくダッシュボード全面改訂**:
  - 全4タブ・19図版（グラフ20個：図1-4は2面構成）の確定構成へ移行。
  - #1 TF1×Netflix：逆転の発想（図1-1〜図1-5）
  - #2 TVer：自前配信だけでは埋まらない穴（図2-1〜図2-4）
  - #3 欧州4局：デジタル比率3割でも減収を補えない（図3-1〜図3-4）
  - #4 YouTube・CTV：テレビ局のオープン流通戦略（図4-1〜図4-6）
- **未検証・過大表現の完全排除**:
  - 旧版に含まれていた仮説値・断定的記述（推計値や未検証のシェア比率等）を排除し、公的統計・IR開示資料で検証済みの客観的データセットへ全面的に刷新。
- **アーキテクチャのモジュール化**:
  - `data_v1100.js`（データセット分離）および `app_v1100.js`（描画制御）の分離型クリーンアーキテクチャへ刷新。
  - Chart.js v4.5.1 のローカル配備による安定描画。
  - 旧版（Ver 2.1.0）ファイル群は `archive/v2.1.0/` に保管・退避。
- **ドキュメント類の同期更新**:
  - `README.md`, `METHODOLOGY.md`, `DATA_SOURCES.md` を新構成に合わせて全面更新。
  - SNSプレビュー画像（`social-preview.png`, `thumbnail.png`）を新UIで再生成・更新。

---

## [2.1.0] - 2026-09-19
### Added
- **日米英3カ国CTV比較カード（Card 4）の完全幾何学ピクセル同期**:
  - Chart.js の `afterFit` フックにより、3カードすべてのY軸レイアウト幅を強制的に `140px` に固定。
  - カード幅（347px）からY軸幅（140px）を引いた有効バー描画エリアを **「207px」** で全カード共通の1:1物理同期化。
- **リポジトリ標準仕様の完全整備**:
  - `METHODOLOGY.md`, `DATA_SOURCES.md`, `sitemap.xml`, `LICENSE` (MIT) を配備。

---

## [2.0.0] - 2026-09-18
### Added
- **Tab ④ コネクテッドTV（CTV）とYouTubeの台頭モジュールを全面新設**
- **Tab ③ 欧州主要4局（TF1, ITV, ProSiebenSat.1, M6）財務スコアカードを新設**

---

## [1.1.0] - 2026-09-16
### Added
- **第1タブ（テレビ視聴の構造変容）の日仏直接対比化**

---

## [1.0.0] - 2026-09-16
### Added
- **Initial Release of Broadcaster Audience Shift Evidence Dashboard**
