-- ============================================================
-- 新産地・銘柄 INSERT
-- 対象: シェリー（ヘレス）・焼酎4産地（薩摩/球磨/壱岐/沖縄）
-- 実行前に Supabase SQL Editor に貼り付けて確認してから実行
-- ============================================================

-- ────────────────────────────────────────
-- 1. regions
-- ────────────────────────────────────────
INSERT INTO regions
  (name, region_level, country, latitude, longitude,
   climate, food_culture, avg_temperature, water_hardness, photo_url)
VALUES
  (
    'ヘレス・デ・ラ・フロンテーラ', 'city', 'スペイン', 36.69, -6.14,
    '地中海性気候。夏は長く乾燥し、冬は温暖で降水量が多い。アルバリサ土壌（白亜質）が太陽光を反射しブドウの成熟を助ける。大西洋からのポネンテ（西風）が塩分と湿度をもたらし、フロール（産膜酵母）の生育を促す独特の環境。',
    'イベリコ豚の生ハム（ハモン・イベリコ）、マグロの赤身（アトゥン・ロホ）、ガスパチョ、揚げ魚（ペスカイート・フリート）など。シェリーとのペアリングを前提にした食文化が発達している。',
    '17.5°C', '軟水（硬度 40）',
    'https://upload.wikimedia.org/wikipedia/commons/5/53/CatedralJerezArriba.jpg'
  ),
  (
    '薩摩', 'region', '日本', 31.56, 130.56,
    '温暖湿潤気候。年間平均気温は約19℃と高く、さつまいもの栽培に適した黒ボク土壌が広がる。台風の通過が多く夏の降雨量が多い。この豊かな土壌がいも焼酎の原料・さつまいもを育む。',
    '黒豚（バークシャー種）のしゃぶしゃぶや豚骨スープ、鶏刺し、さつまいも料理。芋焼酎文化と密接に結びついた食の伝統がある。',
    '19.0°C', NULL, NULL
  ),
  (
    '球磨', 'region', '日本', 32.21, 130.91,
    '盆地特有の寒暖差が大きい内陸性気候。球磨川流域の清冽な水と、朝霧が立ち込める盆地の環境が米焼酎造りに最適な条件を作り出している。',
    '球磨川のアユ料理、山菜料理、高菜漬けが郷土の味。球磨焼酎は食中酒として地元の食文化に根付いている。',
    '14.5°C', '軟水（硬度 20）', NULL
  ),
  (
    '壱岐', 'region', '日本', 33.75, 129.70,
    '玄界灘に浮かぶ島の海洋性気候。対馬暖流の影響で温暖で年間を通じて風が強い。大麦と米を原料とするGI「壱岐焼酎」は麦焼酎発祥の地として知られる。',
    '新鮮な魚介類（ウニ・アワビ）や壱岐牛が豊富。壱岐焼酎は江戸時代から地元の食卓を彩ってきた。',
    '16.5°C', '軟水（硬度 25）', NULL
  ),
  (
    '沖縄', 'prefecture', '日本', 26.21, 127.68,
    '亜熱帯海洋性気候。年間平均気温23℃以上、降水量2000mm超。インディカ米を黒麹で仕込む泡盛は高温多湿な気候に適した蒸留酒。古酒（クース）として長期熟成される文化がある。',
    'チャンプルー（野菜炒め）、ラフテー（豚角煮）、ゴーヤー料理が中心。泡盛は水割りで食事と共に楽しまれる。',
    '23.1°C', '軟水（硬度 15）', NULL
  )
;

-- ────────────────────────────────────────
-- 2. drinks（region_id はサブクエリで解決）
-- ────────────────────────────────────────

-- シェリー
INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT 'ティオ ペペ', 'ティオペペ', 'フィノ・シェリー', 'wine', id,
  '世界で最も有名なフィノ・シェリー。ゴンザレス・ビアス社のフラッグシップ。フロール（産膜酵母）の下でゆっくりと熟成し、辛口・軽やか・塩気のある独特の風味を持つ。アペリティフとして世界中で親しまれる。',
  15.0
FROM regions WHERE name = 'ヘレス・デ・ラ・フロンテーラ';

INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT 'ルスタウ ロス アルコス', 'るすたうろすあるこす', 'アモンティリャード・シェリー', 'wine', id,
  'ルスタウ社の定番アモンティリャード。フロール消滅後に酸化熟成させた中間スタイルのシェリー。ナッツ・ドライフルーツの香りとほのかな甘みが特徴。食前・食後どちらにも合う万能シェリー。',
  18.5
FROM regions WHERE name = 'ヘレス・デ・ラ・フロンテーラ';

-- 芋焼酎（薩摩）
INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '森伊蔵', 'もりいぞう', '芋焼酎', 'shochu', id,
  '鹿児島県垂水市の森伊蔵酒造が造るプレミアム芋焼酎。黄麹を使った軽やかな口当たりと上品な甘みが特徴で、「幻の焼酎」として知られる入手困難な銘柄の一つ。',
  25.0
FROM regions WHERE name = '薩摩';

INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '魔王', 'まおう', '芋焼酎', 'shochu', id,
  '白玉醸造が造る薩摩の名焼酎。さつまいもの甘い香りが際立ち、クセが少なくなめらかな飲み口。「魔王」「村尾」「森伊蔵」と並ぶ「3M」の一つとして焼酎ブームを牽引した銘柄。',
  25.0
FROM regions WHERE name = '薩摩';

-- 米焼酎（球磨）
INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '繊月', 'せんげつ', '米焼酎', 'shochu', id,
  '球磨川沿いの繊月酒造が造るGI球磨焼酎の代表銘柄。清冽な球磨の水と米を原料に、すっきりとした中にも米の旨みが感じられる。食中酒として地元で長く愛されてきた一本。',
  25.0
FROM regions WHERE name = '球磨';

-- 麦焼酎（壱岐）
INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '壱岐スーパーゴールド22', 'いきすーぱーごーるど', '麦焼酎', 'shochu', id,
  '玄海酒造が造る壱岐の代表的麦焼酎。大麦1/3・米麹2/3という伝統製法を守り続ける。麦の香ばしさとまろやかさが調和した、壱岐焼酎ならではのスタイル。',
  22.0
FROM regions WHERE name = '壱岐';

-- 泡盛（沖縄）
INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '残波ホワイト', 'ざんぱほわいと', '泡盛', 'shochu', id,
  '比嘉酒造が造る沖縄を代表する泡盛。インディカ米を黒麹で仕込み、すっきりとした飲み口が特徴。ロック・水割りどちらでも楽しめるスタンダード銘柄で、沖縄料理との相性が抜群。',
  30.0
FROM regions WHERE name = '沖縄';

INSERT INTO drinks (name, name_kana, genre, genre_category, region_id, description, alcohol)
SELECT '久米仙', 'くめせん', '泡盛', 'shochu', id,
  '久米島酒造が造る長期熟成泡盛（古酒）。久米島の珊瑚礁が濾過した清冽な水を使用。まろやかで深みのある味わいは熟成年数とともに増し、古酒文化を体現する一本。',
  30.0
FROM regions WHERE name = '沖縄';
