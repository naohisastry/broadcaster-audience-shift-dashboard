/**
 * Series A #1: TF1 x Netflix Partnership & Viewing Shift Evidence Dataset
 * Generated for series-a-01-tf1-netflix-dashboard
 */

const DASHBOARD_DATA = {
  metadata: {
    project: "Series A #1: TF1 x Netflix",
    theme: "Viewing Shift & Carriage Model Evidence",
    version: "v1.5.0",
    lastUpdated: "2026-09-17",
    units: { viewing: "minutes/person/day", adMarket: "local currency million", yen: "JPY 100 million" }
  },

  viewingShift: {
    // 1. 原典別時系列（日本）
    japan: {
      years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
      linearTotal: [168.3, 164.7, 161.4, 159.2, 156.7, 157.9, 163.7, 157.6, 153.2, 153.7, 154.7],
      linearByAge: {
        teens: [91.8, 97.4, 91.0, 73.3, 72.3, 69.0, 73.1, 58.7, 48.0, 39.0, 39.7],
        twenties: [118.9, 126.7, 119.8, 92.5, 107.5, 103.5, 88.0, 71.3, 64.9, 53.6, 52.6],
        thirties: [147.9, 137.9, 145.4, 120.4, 127.3, 122.9, 137.6, 116.8, 113.6, 96.6, 88.8],
        forties: [157.6, 158.4, 156.8, 152.0, 150.1, 149.2, 162.2, 147.2, 143.9, 140.2, 133.0],
        fifties: [204.0, 227.1, 199.1, 214.3, 198.8, 218.4, 213.9, 206.1, 184.2, 187.6, 182.2],
        sixties: [250.7, 250.7, 252.8, 248.8, 245.9, 249.7, 257.6, 247.9, 237.9, 251.7, 227.8]
      },
      internetTotal: [72.2, 79.4, 89.9, 100.2, 112.4, 126.2, 168.4, 176.8, 178.6, 182.3, 188.6],
      netVideoByAge: {
        teens: [19.2, 22.1, 38.6, 36.6, 61.5, 84.9, 161.0, 100.8, 111.4, 138.2, 147.1],
        twenties: [22.8, 30.5, 45.1, 48.9, 78.2, 94.6, 146.8, 120.3, 128.9, 142.1, 149.8],
        thirties: [14.1, 19.3, 27.8, 31.4, 45.2, 58.7, 98.4, 82.5, 89.2, 95.4, 102.3],
        forties: [8.9, 12.4, 16.5, 20.1, 29.8, 38.9, 64.2, 59.8, 65.4, 71.2, 76.5],
        fifties: [5.2, 7.8, 10.2, 12.8, 18.4, 24.5, 42.1, 39.5, 44.8, 48.9, 53.2],
        sixties: [2.1, 3.4, 4.8, 6.2, 9.1, 12.4, 21.3, 20.8, 24.1, 26.5, 29.8]
      },
      crossoverChecks: {
        teens: { year: 2019, netVideo: 84.9, linearTV: 69.0 },
        twenties: { year: 2020, netVideo: 146.8, linearTV: 88.0 }
      },
      composition2025: {
        totalMinutes: 230,
        linearShare: 75,
        onDemandShare: 25,
        linearMinutes: 172,
        onDemandMinutes: 57
      }
    },

    // 2. 原典別時系列（フランス）
    france: {
      deiYears: [2014, 2016, 2018, 2020, 2022, 2023, 2024],
      linearTotal: [220, 232, 216, 238, 206, 199, 192],
      linearByAge: {
        young15_24: [105, 92, 85, 80, 65, 60, 52],
        adults25_49: [180, 170, 160, 155, 135, 130, 120],
        seniors50Plus: [255, 260, 255, 265, 255, 250, 242]
      },
      composition2025: {
        totalMinutes: 254,
        linearShare: 61,
        onDemandShare: 39,
        linearMinutes: 155,
        onDemandMinutes: 99
      }
    },

    // 3. 【日仏年代別直接対比】共通3大セグメント推移
    normalizedAgeComparison: {
      years: [2014, 2016, 2018, 2020, 2022, 2023, 2024],
      young: {
        title: "若年層（仏 15-24歳 vs 日 10-20代）",
        france: [105.0, 92.0, 85.0, 80.0, 65.0, 60.0, 52.0],
        japan: [105.4, 105.4, 89.9, 80.6, 56.5, 46.3, 46.2],
        note: "日仏ともに約105分から46〜52分へ急落（−50〜56%）。若者のテレビ離れの同期性が証明される。"
      },
      middle: {
        title: "現役層（仏 25-49歳 vs 日 30-50代）",
        france: [180.0, 170.0, 160.0, 155.0, 135.0, 130.0, 120.0],
        japan: [169.8, 167.1, 158.7, 171.2, 147.2, 141.5, 134.7],
        note: "現役世代は日仏とも170分前後から120〜135分へ緩やかに減少。"
      },
      senior: {
        title: "シニア層（仏 50歳以上 vs 日 60代）",
        france: [255.0, 260.0, 255.0, 265.0, 255.0, 250.0, 242.0],
        japan: [250.7, 252.8, 245.9, 257.6, 237.9, 251.7, 227.8],
        note: "シニア層は日仏とも230〜260分台の圧倒的視聴量を維持し、リニア放送の最大の支え手となっている。"
      }
    },

    // 4. 【日仏若年逆転対比】テレビ vs ネット動画クロスオーバー
    youngCrossoverComparison: {
      years: [2014, 2016, 2018, 2020, 2022, 2024],
      franceYoung: {
        age: "仏 15–24歳",
        linearTV: [105.0, 92.0, 85.0, 80.0, 65.0, 52.0],
        netVideo: [18.0, 38.0, 92.0, 135.0, 148.0, 158.0],
        crossoverYear: 2018,
        note: "フランス若年層は2018年にネット動画（92分）がテレビ（85分）を逆転。"
      },
      japanTeens: {
        age: "日 10代",
        linearTV: [91.8, 91.0, 72.3, 73.1, 48.0, 39.7],
        netVideo: [19.2, 38.6, 61.5, 161.0, 111.4, 147.1],
        crossoverYear: 2019,
        note: "日本10代は2019年にネット動画（84.9分）がテレビ（69.0分）を逆転。"
      },
      japanTwenties: {
        age: "日 20代",
        linearTV: [118.9, 119.8, 107.5, 88.0, 64.9, 52.6],
        netVideo: [22.8, 45.1, 78.2, 146.8, 128.9, 149.8],
        crossoverYear: 2020,
        note: "日本20代は2020年にネット動画（146.8分）がテレビ（88.0分）を逆転。"
      }
    },

    // 5. 【日仏総動画 10年推移】実時間積み上げ ＆ 100%構成比
    onDemandTimeSeries: {
      years: [2014, 2016, 2018, 2020, 2022, 2024, 2025],
      france: {
        linearMinutes: [220, 232, 216, 238, 206, 156, 155],
        onDemandMinutes: [15, 31, 48, 89, 102, 98, 99],
        totalMinutes: [235, 263, 264, 327, 308, 254, 254],
        onDemandShare: [6.4, 11.8, 18.2, 27.2, 33.1, 38.6, 39.0]
      },
      japan: {
        linearMinutes: [168.3, 161.4, 156.7, 163.7, 153.2, 154.7, 153.0],
        onDemandMinutes: [7.7, 15.1, 23.0, 39.2, 48.3, 57.4, 57.0],
        totalMinutes: [176.0, 176.5, 179.7, 202.9, 201.5, 212.1, 210.0],
        onDemandShare: [4.4, 8.6, 12.8, 19.3, 24.0, 27.1, 27.1]
      },
      annotation: "仏2020年(27.2%) ≒ 日2024年(27.1%)。日本はフランスのオンデマンド普及曲線を4年遅れで追跡。"
    },

    // 6. 【日仏テレビ総量対比】国民1人1日平均視聴時間（全体）推移
    nationalAverageComparison: {
      years: [2014, 2016, 2018, 2020, 2022, 2023, 2024],
      franceDEI: [220.0, 232.0, 216.0, 238.0, 206.0, 199.0, 192.0],
      japanAverage: [168.3, 161.4, 156.7, 163.7, 153.2, 153.7, 154.7],
      franceIndex: [100.0, 105.5, 98.2, 108.2, 93.6, 90.5, 87.3],
      japanIndex: [100.0, 95.9, 93.1, 97.3, 91.0, 91.3, 91.9],
      gapMinutes: [51.7, 70.6, 59.3, 74.3, 52.8, 45.3, 37.3]
    }
  },

  // 4カ国広告費逆転タイムライン
  adMarketCrossover: {
    fx2025: { source: "ECB annual average", jpyPerEur: 169.03, gbpPerEur: 0.85679, usdPerEur: 1.13 },
    countries: [
      {
        id: "UK",
        name: "イギリス",
        flag: "🇬🇧",
        crossoverYear: 2011,
        crossover: { year: 2011, digital: 4784, television: 4159, currency: "GBP million", ratio: 1.15 },
        latest: { year: 2025, digital: 40500, television: 5216.1, currency: "GBP million", ratio: 7.76, digitalJpyOku: 79899.6, televisionJpyOku: 10290.5 }
      },
      {
        id: "FR",
        name: "フランス",
        flag: "🇫🇷",
        crossoverYear: 2016,
        crossover: { year: 2016, digital: 3500, television: null, currency: "EUR million", ratio: null },
        latest: { year: 2025, digital: 12400, television: 3237, currency: "EUR million", ratio: 3.83, digitalJpyOku: 20959.7, televisionJpyOku: 5471.5 }
      },
      {
        id: "US",
        name: "アメリカ",
        flag: "🇺🇸",
        crossoverYear: 2017,
        crossover: { year: 2017, digital: 88.0, television: 69.0, currency: "USD billion", ratio: 1.28 },
        latest: { year: 2025, digital: 294.6, television: null, currency: "USD billion", ratio: 3.80, digitalJpyOku: 440674.7, televisionJpyOku: null }
      },
      {
        id: "JP",
        name: "日本",
        flag: "🇯🇵",
        crossoverYear: 2019,
        crossover: { year: 2019, digital: 21048, television: 18612, currency: "JPY 100 million", ratio: 1.13 },
        latest: { year: 2025, digital: 40459, television: 17556, currency: "JPY 100 million", ratio: 2.30, digitalJpyOku: 40459, televisionJpyOku: 17556 }
      }
    ],
    timeSeriesRatio: {
      years: [2011, 2014, 2016, 2017, 2018, 2019, 2020, 2022, 2024, 2025],
      uk: {
        name: "イギリス",
        flag: "🇬🇧",
        color: "#3b82f6",
        crossoverYear: 2011,
        ratios: [1.15, 1.62, 2.10, 2.45, 2.75, 3.10, 3.60, 5.20, 7.10, 7.76]
      },
      france: {
        name: "フランス",
        flag: "🇫🇷",
        color: "#ef4444",
        crossoverYear: 2016,
        ratios: [0.65, 0.85, 1.05, 1.25, 1.45, 1.70, 2.10, 2.75, 3.55, 3.83]
      },
      usa: {
        name: "アメリカ",
        flag: "🇺🇸",
        color: "#a855f7",
        crossoverYear: 2017,
        ratios: [0.52, 0.74, 0.95, 1.28, 1.55, 1.85, 2.15, 3.10, 3.65, 3.80]
      },
      japan: {
        name: "日本",
        flag: "🇯🇵",
        color: "#10b981",
        crossoverYear: 2019,
        ratios: [0.46, 0.54, 0.67, 0.78, 0.92, 1.13, 1.30, 1.70, 2.18, 2.30]
      }
    },
    japanDigitalBreakdown2025: {
      year: 2025,
      totalInternetAd: 40459,
      tvOriginatedDigitalVideo: 805,
      shareOfTotalInternetAd: 1.99,
      unit: "JPY 100 million"
    },
    bvodMarketComparison: {
      years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
      netAdShare: {
        uk: [2.10, 2.30, 2.42, 2.60, 2.72, 2.80, 2.81, 2.89],
        france: [1.63, 1.78, 1.89, 2.08, 2.35, 2.45, 2.50, 2.58],
        usa: [2.62, 2.82, 3.00, 3.23, 3.38, 3.51, 3.62, 3.70],
        japan: [0.66, 0.81, 0.96, 0.90, 1.16, 1.34, 1.70, 1.99]
      },
      tvRevenueShare: {
        uk: [6.0, 7.7, 9.3, 12.0, 13.9, 15.8, 17.5, 18.3],
        france: [2.5, 3.2, 4.1, 5.4, 6.8, 7.5, 8.4, 9.0],
        usa: [4.0, 5.2, 6.8, 9.0, 10.5, 11.5, 12.8, 13.5],
        japan: [0.60, 0.91, 1.28, 1.31, 1.95, 2.51, 3.51, 4.38]
      },
      saturationCeiling: {
        lower: 2.50,
        upper: 3.80
      },
      timeSinceCrossover: {
        tYears: ["T+0年 (逆転時)", "T+2年", "T+4年", "T+6年 (日本の現在地)", "T+8年", "T+10年", "T+12年", "T+14年"],
        uk: [1.10, 1.50, 1.85, 2.05, 2.30, 2.60, 2.80, 2.89],
        france: [1.35, 1.63, 1.89, 2.35, 2.58, null, null, null],
        franceForecast: [null, null, null, null, 2.58, 2.62, 2.65, 2.68],
        usa: [2.40, 2.82, 3.23, 3.51, 3.70, null, null, null],
        usaForecast: [null, null, null, null, 3.70, 3.74, 3.77, 3.80],
        japan: [0.81, 0.90, 1.34, 1.99, null, null, null, null]
      }
    },
    // 赤の女王パラドックス：CAGR vs 絶対増加額（2019-2024確定値）
    redQueenParadox: {
      period: "2019–2024",
      source: "電通『日本の広告費』公式確定値",
      tvOriginated: {
        val2019: 106,
        val2024: 579,
        growthMultiplier: 5.46,
        cagr: 40.4,
        absoluteIncrease: 473
      },
      internetTotal: {
        val2019: 21048,
        val2024: 36510,
        growthMultiplier: 1.73,
        cagr: 11.6,
        absoluteIncrease: 15462
      },
      absorptionRate: 3.06,
      insight: "TVer等のテレビ由来広告は年率40.4%とネット全体の3.5倍の猛スピードで疾走しているが、ネット市場全体が1.55兆円も膨張したため、増加分のわずか3.06%しか吸収できず、シェアは1%台後半に抑え込まれている（赤の女王レース）。"
    },
    // TVerサチレーション（飽和限界）と地上波広告減収予測（2025–2035年）
    saturationForecast: {
      years: [2025, 2028, 2030, 2035],
      unit: "億円",
      currentBase: {
        linearTvAd: 16334,
        tverAd: 805
      },
      linearDecline: {
        westernRate: {
          name: "欧米並みシナリオ（年率▲2.8%減 / 10年で▲25%減）",
          declineRates: [0, -8.1, -13.3, -25.0],
          lossAmounts: [0, -1323, -2172, -4083]
        },
        moderateRate: {
          name: "保守シナリオ（年率▲1.5%減 / 10年で▲15%減）",
          declineRates: [0, -4.4, -7.3, -15.0],
          lossAmounts: [0, -719, -1192, -2450]
        }
      },
      totalInternetAd: [40459, 45000, 50000, 60000],
      scenarios: {
        baseline: {
          id: "baseline",
          name: "ベースケース（欧州水準収束：シェア2.8%）",
          shortName: "ベースケース (シェア2.8%)",
          description: "英仏並み（2.8%）まで収束・キャッチアップする現実的シナリオ",
          targetShare2035: 2.8,
          tverRevenues: [805, 1080, 1300, 1680],
          tverGains: [0, 275, 495, 875],
          netLossWestern: [0, -1048, -1677, -3208],
          fillRateWestern: [0, 20.8, 22.8, 21.4]
        },
        optimistic: {
          id: "optimistic",
          name: "アップサイド・ケース（米国水準突破：シェア4.0%）",
          shortName: "アップサイド・ケース (シェア4.0%)",
          description: "米国の飽和壁（3.8%）すら突破しシェア4.0%へ倍増する上振れシナリオ",
          targetShare2035: 4.0,
          tverRevenues: [805, 1260, 1650, 2400],
          tverGains: [0, 455, 845, 1595],
          netLossWestern: [0, -868, -1327, -2488],
          fillRateWestern: [0, 34.4, 38.9, 39.1]
        }
      }
    }
  },

  // 実務契約マトリクス
  carriageVsLicensing: {
    comparisonMatrix: [
      {
        parameter: "コンテンツ調達費",
        traditionalLicensing: "Netflixが番組単位で買付費を支払う",
        tf1CarriageModel: "調達費ゼロ（Netflixの支払いは発生しない）",
        businessImplication: "コストフリーで番組獲得 vs 下請けライセンス料に依存しない"
      },
      {
        parameter: "配信形態",
        traditionalLicensing: "VOD（オンデマンド見逃し・アーカイブ）のみ",
        tf1CarriageModel: "地上波5波のリアルタイムサイマル生放送 ＋ VOD",
        businessImplication: "アンテナ線の代替・生活インフラとしての受像機占有"
      },
      {
        parameter: "広告枠の販売権",
        traditionalLicensing: "Netflixが自社で独占販売",
        tf1CarriageModel: "TF1 PUB（放送局広告部門）が100%保持・直販",
        businessImplication: "広告収益・CPM価格決定権を手放さない"
      },
      {
        parameter: "広告配信アドテク",
        traditionalLicensing: "Netflix独自アドサーバー",
        tf1CarriageModel: "TF1外部アドサーバー（FreeWheel SSAI）",
        businessImplication: "自社のアドサーバーから動的広告インジェクション"
      },
      {
        parameter: "視聴ID・データ主権",
        traditionalLicensing: "Netflixが囲い込み（局へは限定レポートのみ）",
        tf1CarriageModel: "TF1独自のGraph:ID / EUIDで自社管理",
        businessImplication: "ファーストパーティデータと顧客接点の死守"
      },
      {
        parameter: "広告なし有料会員への挙動",
        traditionalLicensing: "広告は一切流れない",
        tf1CarriageModel: "プレミアム会員に対してもTF1広告がスキップ不可で強制表示",
        businessImplication: "普段広告を見ない富裕・若年プレミアム層への高単価リーチ"
      }
    ]
  },

  contractArchitecture: [
    {
      parameter: "コンテンツ調達費",
      traditional: "Netflixが番組単位で買付費を支払う",
      carriage: "調達費ゼロ（Netflixの支払いは発生しない）",
      significance: "コストフリーで番組獲得 vs 下請けライセンス料に依存しない"
    },
    {
      parameter: "配信形態",
      traditional: "VOD（オンデマンド見逃し・アーカイブ）のみ",
      carriage: "地上波5波のリアルタイムサイマル生放送 ＋ VOD",
      significance: "アンテナ線の代替・生活インフラとしての受像機占有"
    },
    {
      parameter: "広告枠の販売権",
      traditional: "Netflixが自社で独占販売",
      carriage: "TF1 PUB（放送局広告部門）が100%保持・直販",
      significance: "広告収益・CPM価格決定権を手放さない"
    },
    {
      parameter: "広告配信アドテク",
      traditional: "Netflix独自アドサーバー",
      carriage: "TF1外部アドサーバー（FreeWheel SSAI）",
      significance: "自社のアドサーバーから動的広告インジェクション"
    },
    {
      parameter: "視聴ID・データ主権",
      traditional: "Netflixが囲い込み（局へは限定レポートのみ）",
      carriage: "TF1独自のGraph:ID / EUIDで自社管理",
      significance: "ファーストパーティデータと顧客接点の死守"
    },
    {
      parameter: "広告なし有料会員への挙動",
      traditional: "広告は一切流れない",
      carriage: "プレミアム会員に対してもTF1広告がスキップ不可で強制表示",
      significance: "普段広告を見ない富裕・若年プレミアム層への高単価リーチ"
    }
  ],

  // TF1公式IR確定値
  
  ctvPlatformShare: {
    usTheGauge: {
      source: "Nielsen The Gauge (2024-2025)",
      streamingOnly: {
        labels: ["YouTube", "Netflix", "Prime Video", "Hulu", "Disney+", "Tubi", "Peacock", "Max", "Paramount+", "その他配信"],
        shares: [32.4, 20.5, 9.2, 6.8, 5.1, 5.1, 3.6, 3.4, 2.9, 11.0],
        colors: ["#ef4444", "#e50914", "#38bdf8", "#10b981", "#6366f1", "#f59e0b", "#8b5cf6", "#3b82f6", "#0284c7", "#64748b"]
      },
      totalTvScreen: {
        labels: ["ケーブル放送 (Cable)", "地上波放送 (Broadcast)", "YouTube", "Netflix", "その他ストリーミング", "Amazon Prime Video", "Hulu", "Disney+", "Tubi", "その他 (ゲーム・外部入力)"],
        shares: [26.7, 20.3, 13.4, 8.5, 7.3, 3.8, 2.8, 2.1, 2.1, 11.6],
        colors: ["#94a3b8", "#cbd5e1", "#ef4444", "#e50914", "#64748b", "#38bdf8", "#10b981", "#6366f1", "#f59e0b", "#475569"]
      }
    },
        ukBarb: {
      source: "BARB 'Total Identified Viewing' & Ofcom 'Media Nations' (2024-2025)",
      streamingOnly: {
        labels: ["YouTube", "Netflix", "BBC iPlayer", "ITVX", "Disney+", "Amazon Prime Video"],
        shares: [31.9, 26.6, 17.2, 9.5, 8.0, 6.9],
        colors: ["#ef4444", "#e50914", "#f43f5e", "#06b6d4", "#6366f1", "#38bdf8"]
      },
      totalTvScreen: {
        labels: ["BBC (リニア放送)", "ITV (リニア放送)", "YouTube", "Netflix", "Channel 4 (リニア放送)", "BBC iPlayer", "Channel 5 (リニア放送)", "ITVX", "その他ストリーミング", "その他 (Sky等)"],
        shares: [19.8, 12.5, 8.7, 7.3, 5.2, 4.7, 4.1, 2.6, 10.7, 24.4],
        colors: ["#cbd5e1", "#94a3b8", "#ef4444", "#e50914", "#64748b", "#f43f5e", "#475569", "#06b6d4", "#38bdf8", "#334155"]
      }
    },
japanCtv: {
      source: "REVISIO『コネクテッドTV白書2025』/ ビデオリサーチ『STREAMO』",
      ctvPenetrationRate: 74.2,
      youtubeCtvRatio: 35.0,
      platforms: [
        { name: "YouTube", share: 38.5, color: "#ef4444" },
        { name: "Amazon Prime Video", share: 17.8, color: "#38bdf8" },
        { name: "TVer", share: 16.2, color: "#3b82f6" },
        { name: "Netflix", share: 14.1, color: "#e50914" },
        { name: "U-NEXT", share: 5.2, color: "#10b981" },
        { name: "その他 (ABEMA, Disney+等)", share: 8.2, color: "#64748b" }
      ]
    }
  },
  tf1OfficialKPIs: {
    asOf: "2026-H1",
    cpmEuro: 12.50,
    adLoadMinutesPerHour: 5.7833,
    adLoadDisplay: "5m47s/hour",
    mauMillion: 42.0,
    mauYoYPercent: 20.0,
    juneMonthlyStreamersMillion: 44.0,
    streamHoursMillion: 573.0,
    streamHoursYoYPercent: 6.6,
    digitalAdRevenueMillionEuro: 109.0,
    digitalAdRevenueYoYPercent: 18.6,
    netflixLaunchDate: "2026-06-19",
    dailyStreamerRecord: { date: "2026-06-25", million: 8.3 },
    targetAchievement: { announced: "2026-09", horizonMonths: 18, achievedWithinWeeks: 3 }
  }
};

if (typeof module !== "undefined" && module.exports) module.exports = DASHBOARD_DATA;
if (typeof window !== "undefined") window.DASHBOARD_DATA = DASHBOARD_DATA;
