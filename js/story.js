/* 劇情資料
   節點種類：
   - 一般節點：lines 播完後前往 next（字串或 s => 字串）
   - 轉折點：tp + prompt + sets（依狀態挑一組，每組固定 3 個選項；選項可用 if/else 依數值替換）
   - 結局：ending + summary
   lines 的每一句可以是：'旁白'、['說話者', '台詞']、{ who, text, scene, theme, sfx }
   文字代換：{name}、{ta}（他/她）、{g:男生用字|女生用字}
   選項 tag：growth 成長、gray 灰色、danger 危險、dawn 回頭 */
(function () {
  const hero = (mood, x) => ({ id: 'hero', mood: mood || 'normal', x: x == null ? 300 : x });
  const npc = (id, mood, x, extra) => Object.assign({ id, mood: mood || 'normal', x: x == null ? 520 : x, flip: true }, extra || {});

  const nodes = {
    /* ======================== 序章 ======================== */
    p1: {
      ch: 0, theme: 'dream',
      scene: { place: 'room', chars: [hero('normal', 400)] },
      lines: [
        '西元 2125 年。棉花糖鎮漂浮在粉紅色的雲海上，屋頂圓圓的，連路燈都軟綿綿的。',
        '{name}今年二十歲。今天早上，{ta}又做了那個夢。',
        { text: '夢裡，一個小孩牽著{ta}的手，穿過沙漠，來到「沙之城」的星之泉旁邊，指著泉水說：「寶藏就在這裡。」', scene: { chars: [hero('shock', 400)] } },
        ['{name}', '……第七次了。同一個夢，做了第七次。']
      ],
      next: 'p2'
    },
    p2: {
      ch: 0, theme: 'dream',
      scene: { place: 'town', chars: [hero('normal', 300), npc('grandma', 'happy', 520)] },
      lines: [
        ['阿嬤', '又夢到星之泉了？我們家{name}的眼睛，每次做完這個夢都亮晶晶的。'],
        ['{name}', '阿嬤，沙之城很遠耶，要坐好久的磁浮商隊，還要穿過沙海。'],
        ['阿嬤', '夢是心在說話。要不要去，阿嬤不幫你決定。但你去公園找撒冷聊聊吧，那台老機器人什麼都知道。']
      ],
      next: 'p3'
    },
    p3: {
      ch: 0, theme: 'dream',
      scene: { place: 'town', chars: [hero('normal', 280), npc('salem', 'happy', 530)] },
      lines: [
        '公園的雲朵樹下，坐著一台圓滾滾、螺絲有點生鏽的機器人。',
        ['撒冷', '嗶嗶。你是來問星之泉的吧，{name}？'],
        { who: '{name}', text: '你、你怎麼知道？', scene: { chars: [hero('shock', 280), npc('salem', 'happy', 530)] } },
        ['撒冷', '每個人心裡都有一個「自己的傳說」，那是你最想完成的事。只是大部分的人長大後，就假裝忘記了。'],
        ['撒冷', '當你真心想去一個地方，路上的風景都會替你指路。不過啊——路上也會有很多「看起來像捷徑」的東西。']
      ],
      next: 'p4'
    },
    p4: {
      ch: 0, theme: 'dream',
      scene: { place: 'town', chars: [hero('happy', 280), npc('salem', 'happy', 530)], props: [{ id: 'stones', x: 405, y: 300 }] },
      lines: [
        ['撒冷', '送你兩顆徵兆石：白色的叫烏陵，黑色的叫土明。'],
        ['撒冷', '當你看不懂眼前的徵兆，就握著它們，指向一個選擇——它們會告訴你那條路背後藏著什麼。'],
        ['撒冷', '但只有兩次喔。剩下的，要靠你自己的心。'],
        '（🔮 遊戲提示：遇到選擇時，按右上角的徵兆石，再點一個選項，就能看到它的隱藏風險。整趟旅程只能用 2 次。）'
      ],
      next: 'tp0'
    },
    tp0: {
      ch: 0, tp: 'tp0', theme: 'dream',
      scene: { place: 'town', chars: [hero('normal', 400)] },
      prompt: '夢、阿嬤的話、撒冷的石頭……{name}握緊拳頭。接下來，要怎麼做？',
      sets: [{
        options: [
          { id: 'tp0_dream', tag: 'growth', text: '相信這個夢。告訴阿嬤：我要去沙之城！',
            omen: '烏陵微微發亮：這條路不會比較輕鬆，但每一步都是你自己的。',
            effects: { heart: 1, bond: 1 }, flags: { dream: true }, next: 'c1_intro' },
          { id: 'tp0_fast', tag: 'gray', text: '先上網搜尋「最快賺到旅費的方法」，越快越好。',
            omen: '土明變得冰冰的：急著要錢的人，最容易被「快錢」盯上。',
            effects: { shadow: 1 }, flags: { fast: true }, next: 'c1_intro' },
          { id: 'tp0_drift', tag: 'gray', text: '夢只是夢啦……不過，離開小鎮出去看看好像也不錯。',
            omen: '兩顆石頭都很安靜：沒想清楚要去哪裡的人，很容易被別人帶著走。',
            effects: { alert: 1 }, flags: { drift: true }, next: 'c1_intro' }
        ]
      }]
    },

    /* ======================== 第一章 啟程的旅費 ======================== */
    c1_intro: {
      ch: 1, theme: 'dream',
      scene: { place: 'room', chars: [hero('worried', 300)], props: [{ id: 'phone', x: 470, y: 260 }] },
      lines: [
        '去沙之城的磁浮商隊票要 3000 星幣。{name}的存款，只有 500。',
        '{ta}打開腕環，求職版跳出一大堆訊息：',
        '「水晶商店徵店員，時薪普通，可學習。」\n「💰日領 5000！免經驗！只要幫公司收包裹、到 ATM 領錢！」\n「帳戶出租，每月輕鬆領 2 萬，寄出提款卡即可。」',
        ['{name}', '一百年前的人也是這樣找工作的嗎……'],
        { text: '（一百年過去了，騙術換了新衣服，骨子裡卻一模一樣。）', sfx: 'danger' }
      ],
      next: 'tp1'
    },
    tp1: {
      ch: 1, tp: 'tp1', theme: 'dream',
      scene: { place: 'room', chars: [hero('normal', 300)], props: [{ id: 'phone', x: 470, y: 260 }] },
      prompt: '要怎麼湊到旅費？',
      sets: [
        { when: s => s.flags.fast, options: [
          { id: 'tp1_mule', tag: 'danger', text: '傳訊息給「日領 5000」的 Max 哥：我可以馬上開始！',
            omen: '土明燙得發痛：收包裹、領別人的錢——這是詐騙集團在找「車手」。',
            effects: { coin: 3, shadow: 2 }, flags: { mule: true }, next: 'c1_mule' },
          { id: 'tp1_account', tag: 'danger', text: '把用不到的帳戶「租」出去，寄提款卡就能每月領 2 萬。',
            omen: '土明變黑了：你的帳戶會變成詐騙集團收贓款的「人頭帳戶」。',
            effects: { coin: 2, shadow: 1 }, flags: { account: true }, next: 'c1_account' },
          { id: 'tp1_shop', tag: 'growth', text: '等等，這些也太好賺了吧……還是去水晶商店應徵好了。',
            omen: '烏陵亮起來：慢，但是穩。你會在那裡學到很多。',
            effects: { heart: 1, alert: 1 }, flags: { shop: true }, next: 'c1_shop' }
        ] },
        { when: s => s.flags.dream, options: [
          { id: 'tp1_shop', tag: 'growth', text: '去水晶商店打工，一邊存錢一邊準備。',
            omen: '烏陵亮起來：慢，但是穩。你會在那裡學到很多。',
            effects: { heart: 1, alert: 1 }, flags: { shop: true }, next: 'c1_shop' },
          { id: 'tp1_mule', tag: 'danger', text: '學長說他朋友 Max 哥在找人「收包裹、去 ATM 領錢」，一趟 3000，問問看。',
            omen: '土明燙得發痛：熟人介紹也一樣——這是在找「車手」。',
            effects: { coin: 3, shadow: 2 }, flags: { mule: true }, next: 'c1_mule' },
          { id: 'tp1_go', tag: 'gray', text: '帶著 500 星幣和阿嬤給的紅包先出發，路上再想辦法！',
            omen: '兩顆石頭一起晃動：勇敢很好，但陌生的地方，也有陌生的陷阱。',
            effects: { heart: 1 }, flags: { robbed: true }, next: 'c1_robbed' }
        ] },
        { options: [
          { id: 'tp1_shop', tag: 'growth', text: '去水晶商店打工，薪水普通但很踏實。',
            omen: '烏陵亮起來：慢，但是穩。你會在那裡學到很多。',
            effects: { heart: 1, alert: 1 }, flags: { shop: true }, next: 'c1_shop' },
          { id: 'tp1_account', tag: 'danger', text: '帳戶放著也是放著，「租」出去每月領 2 萬好像不錯。',
            omen: '土明變黑了：你的帳戶會變成詐騙集團收贓款的「人頭帳戶」。',
            effects: { coin: 2, shadow: 1 }, flags: { account: true }, next: 'c1_account' },
          { id: 'tp1_go', tag: 'gray', text: '先帶著存款出發，到了霓虹港再找工作。',
            omen: '兩顆石頭一起晃動：勇敢很好，但陌生的地方，也有陌生的陷阱。',
            effects: { heart: 1 }, flags: { robbed: true }, next: 'c1_robbed' }
        ] }
      ]
    },

    c1_robbed: {
      ch: 1, theme: 'danger',
      scene: { place: 'city', chars: [hero('happy', 300), npc('stranger', 'smirk', 520)] },
      lines: [
        '{name}搭了一整晚的雲朵巴士，來到第一站——霓虹港。高樓尖尖的，招牌一閃一閃。',
        ['陌生人', '第一次來？我知道哪裡有便宜的商隊票，你把錢給我，我幫你去買，保證半價！'],
        ['{name}', '真的嗎！太好了，謝謝你！'],
        { text: '那個人拿著錢走進人群……再也沒有回來。', sfx: 'gloom', scene: { chars: [hero('sad', 400)] } },
        ['{name}', '……我怎麼這麼笨。'],
        '{ta}坐在路邊，看見對街有一家小小的水晶商店，門口貼著「徵店員」。'
      ],
      effects: { coin: -1, alert: 1 },
      next: 'c1_shop'
    },

    c1_shop: {
      ch: 1, theme: 'growth',
      scene: { place: 'shop', chars: [hero('normal', 300), npc('owner', 'normal', 540)] },
      lines: [
        ['歐伯', '要來打工？我這店生意普普通通，水晶擺了三十年，也沒什麼人買。'],
        '{name}每天擦水晶、整理貨架。一個月後，{ta}有了點子：',
        { who: '{name}', text: '歐伯，霓虹港的人走路都好累，如果我們在門口賣熱熱的「雲朵茶」，用水晶杯裝呢？', scene: { chars: [hero('happy', 300), npc('owner', 'normal', 540)] } },
        ['歐伯', '……用水晶杯？客人進來喝茶，就會看到水晶。你這孩子！'],
        { text: '店裡的客人越來越多。{name}的存款，一點一點長大。', scene: { chars: [hero('happy', 300), npc('owner', 'happy', 540)] } },
        ['歐伯', '慢慢賺的錢，花起來最安心。記住這種感覺。']
      ],
      effects: { bond: 1, coin: 2 },
      next: 'c2_shop_intro'
    },

    c1_mule: {
      ch: 1, theme: 'danger',
      scene: { place: 'street', chars: [hero('happy', 260), npc('max', 'smirk', 430)], props: [{ id: 'card', x: 520, y: 330 }] },
      lines: [
        ['Max哥', '很簡單啦，去超商收包裹，裡面有幾張卡，到 ATM 把錢領出來交給我。現領現給。'],
        ['{name}', '這樣就……5000？'],
        '第一天，{name}的口袋裡多了 5000 星幣。好輕鬆，輕鬆得有點不真實。',
        { text: '第二天晚上，腕環跳出新聞：一位老奶奶被假檢察官騙光了養老金，存款被人從好幾台 ATM 領走。', sfx: 'danger', scene: { chars: [hero('worried', 260), npc('max', 'smirk', 430)] } },
        ['{name}', '……那些提款卡，是誰的？'],
        ['Max哥', '別想那麼多。你不領，也會有別人領。']
      ],
      next: 'tp2_mule'
    },

    c1_account: {
      ch: 1, theme: 'danger',
      scene: { place: 'room', chars: [hero('happy', 300)], props: [{ id: 'card', x: 470, y: 300 }, { id: 'money', x: 560, y: 380 }] },
      lines: [
        '{name}把提款卡和密碼寄了出去。三天後，帳戶裡真的多了 2 萬星幣「租金」。',
        ['{name}', '什麼都不用做就有錢！早知道就多開幾個帳戶。'],
        { text: '一個月後，銀行傳來通知：「您的帳戶已列為警示帳戶，全面凍結。」', sfx: 'danger', scene: { chars: [hero('shock', 300)] } },
        '接著是警察局的通知書：有十幾個人被詐騙，錢都匯進了{name}的帳戶。',
        '「老闆」也傳訊息來了：「帳戶被凍，害我損失很大。你要嘛再交兩個帳戶，要嘛幫我出國帶個貨抵債。」'
      ],
      next: 'tp2_acct'
    },

    /* ======================== 第二章 霓虹港的相遇 ======================== */
    c2_shop_intro: {
      ch: 2, theme: 'dream',
      scene: { place: 'room', chars: [hero('happy', 300), npc('ash', 'happy', 540)], props: [{ id: 'heart', x: 420, y: 160 }] },
      lines: [
        '休假的晚上，{name}在交友 App「星緣」上，配對到一個叫艾許的人。',
        ['艾許', '你今天也辛苦了。我好喜歡聽你說水晶店的事，感覺你是個很認真的人。'],
        '艾許的照片完美得像明星，每天早安晚安，記得{name}說過的每一句話。',
        '可是每次{name}說要視訊，艾許都說「鏡頭壞了」「在開會」。',
        { who: '艾許', text: '對了，我最近用一個內部投資平台，一個月賺了 38%。我只告訴你喔，因為我想跟你一起規劃未來。', scene: { props: [{ id: 'phone', x: 420, y: 250, icon: 'chart', screen: '#eafff2' }] } }
      ],
      next: 'tp2_shop'
    },
    tp2_shop: {
      ch: 2, tp: 'tp2', theme: 'dream',
      scene: { place: 'room', chars: [hero('normal', 300), npc('ash', 'happy', 540)], props: [{ id: 'phone', x: 420, y: 250, icon: 'chart', screen: '#eafff2' }] },
      prompt: '艾許傳來平台連結，還附上一個愛心。{name}要怎麼回應？',
      sets: [{
        options: [
          { id: 'tp2_verify', tag: 'growth',
            if: s => s.stats.alert >= 3, reqLabel: '🛡️ 警覺 ≥ 3：你學會了查證',
            text: '要求今晚一定要視訊，再用以圖搜圖查艾許的照片，打 165 問問看。',
            omen: '烏陵亮起來：真心的人，不怕被你確認。',
            effects: { heart: 1, alert: 1 }, flags: { scamSafe: true }, next: 'c2_verify',
            else: { id: 'tp2_tell', tag: 'growth', text: '先不回覆。把艾許的事告訴歐伯和阿嬤，聽聽他們怎麼說。',
              omen: '烏陵亮起來：當局者迷，身邊的人常常看得比你清楚。',
              effects: { heart: 1, bond: 1, alert: 1 }, flags: { scamSafe: true }, next: 'c2_verify' } },
          { id: 'tp2_small', tag: 'gray', text: '先投 5000 試試看，賺了就收手。',
            omen: '土明有點冰：詐騙平台最愛先讓你小賺一筆。',
            effects: { coin: -1, shadow: 1 }, flags: { ash: true }, next: 'c2_small' },
          { id: 'tp2_allin', tag: 'danger', text: '把存下來的旅費全部投進去——艾許說這是「我們的未來」。',
            omen: '土明燙得發痛：你會失去的，不只是錢。',
            effects: { coin: -3, shadow: 2 }, flags: { allin: true }, next: 'c2_allin' }
        ]
      }]
    },
    c2_verify: {
      ch: 2, theme: 'growth',
      scene: { place: 'shop', chars: [hero('shock', 300), npc('owner', 'worried', 540)], props: [{ id: 'phone', x: 420, y: 250 }] },
      lines: [
        '以圖搜圖的結果跳出來：艾許的照片，是盜用另一個國家網紅的。那個「投資平台」，網址才剛註冊兩個星期。',
        ['165 客服', '這是很典型的假交友投資詐騙。先培養感情，再引導投資，一開始還會讓你小額出金。你做得很好，請直接封鎖，我們會處理這個帳號。'],
        { who: '{name}', text: '……原來每天的早安晚安，都是劇本。', scene: { chars: [hero('sad', 300), npc('owner', 'normal', 540)] } },
        ['歐伯', '難過一下沒關係。會痛，是因為你是真心對人的。這不丟臉，丟臉的是騙子。'],
        { text: '{name}擦乾眼淚。存款一毛都沒少，商隊票的錢，也快存夠了。', scene: { chars: [hero('happy', 300), npc('owner', 'happy', 540)] } }
      ],
      effects: { heart: 1 },
      next: 'c3_intro'
    },
    c2_small: {
      ch: 2, theme: 'danger',
      scene: { place: 'room', chars: [hero('happy', 300), npc('ash', 'happy', 540)], props: [{ id: 'phone', x: 420, y: 250, icon: 'chart', screen: '#eafff2' }] },
      lines: [
        '投了 5000，一週後竟然真的領回 5500！',
        ['艾許', '看吧～我沒騙你。這次放五萬，下個月我們就能一起去旅行了。'],
        '{name}沒有再加碼。但當{ta}想把剩下的獲利領出來時——',
        { text: '「出金需先繳納 20% 稅金與保證金。」', sfx: 'danger', scene: { chars: [hero('shock', 300), npc('ash', 'smirk', 540)] } },
        ['{name}', '……錢領不出來了。'],
        ['艾許', '寶貝，那只是系統問題啦。你不相信我嗎？']
      ],
      next: 'c3_intro'
    },
    c2_allin: {
      ch: 2, theme: 'danger',
      scene: { place: 'room', chars: [hero('happy', 300), npc('ash', 'happy', 540)], props: [{ id: 'phone', x: 420, y: 250, icon: 'chart', screen: '#eafff2' }] },
      lines: [
        '{name}把所有存款都匯進平台。帳面上的數字每天往上跳。',
        { text: '直到{ta}想領錢買商隊票的那天：「帳戶異常，請繳交 30% 解凍金。」', sfx: 'danger', scene: { chars: [hero('shock', 300), npc('ash', 'smirk', 540)] } },
        ['{name}', '我已經沒有錢了……'],
        ['艾許', '別哭。我在海外有朋友在招人，客服工作，月薪 15 萬，包機票包住宿。你去做三個月，錢就全部賺回來了，我們還能在那裡見面。']
      ],
      next: 'tp3_overseas'
    },

    tp2_mule: {
      ch: 2, tp: 'tp2', theme: 'danger',
      scene: { place: 'street', chars: [hero('worried', 280), npc('che', 'normal', 520)] },
      lines: [
        '在 Max 哥的群組裡，有一個叫澈的人。話不多，會在{name}領完錢後遞一杯熱飲，說「辛苦了」。',
        '兩個人越聊越多。澈說，等存夠錢，就要一起離開這裡。',
        '這陣子，警察開始在提款機附近埋伏。群組裡每天都有人「失聯」。',
        ['澈', '我跟上面說好了，讓你升級。不用再去 ATM，只要幫忙帶一個行李箱出國，回來就有 20 萬。之後我們就自由了。']
      ],
      prompt: '{name}的手在發抖。要怎麼辦？',
      sets: [{
        options: [
          { id: 'tp2_surrender', tag: 'dawn', text: '去警察局自首，把知道的一切都說出來。',
            omen: '烏陵發出溫暖的光：這很可怕，但這是唯一能讓你重新開始的路。',
            effects: { heart: 2, shadow: -2, bond: 1 }, flags: { record: true, redeem: true }, next: 'c2_surrender' },
          { id: 'tp2_continue', tag: 'danger', text: '再做一個月就好，存夠旅費就收手。',
            omen: '土明碎了一角：「再一次就好」的那一次，往往就是被抓的那一次。',
            effects: { shadow: 2 }, next: 'e_jail_mule' },
          { id: 'tp2_upgrade', tag: 'danger', text: '聽澈的：升級，幫忙帶一趟行李箱出國。',
            omen: '土明燙得發痛：你以為在往上爬，其實是被推到最前面。',
            effects: { coin: 2, shadow: 1 }, flags: { courier: true }, next: 'tp3_courier' }
        ]
      }]
    },
    tp2_acct: {
      ch: 2, tp: 'tp2', theme: 'danger',
      scene: { place: 'room', chars: [hero('worried', 300)], props: [{ id: 'phone', x: 470, y: 260, screen: '#2c3038' }] },
      prompt: '警察的通知書和「老闆」的訊息並排放在桌上。{name}要怎麼做？',
      sets: [{
        options: [
          { id: 'tp2_report', tag: 'dawn', text: '馬上報警，到銀行說明，配合調查。',
            omen: '烏陵發出溫暖的光：越早面對，越有機會把傷害降到最低。',
            effects: { heart: 1, shadow: -1, alert: 1 }, flags: { record: true, redeem: true }, next: 'c2_report' },
          { id: 'tp2_more', tag: 'danger', text: '再交兩個帳戶，把損失賺回來。',
            omen: '土明碎了一角：一次交出好幾個帳戶，刑責只會更重。',
            effects: { shadow: 2 }, next: 'e_jail_acct' },
          { id: 'tp2_courier', tag: 'danger', text: '答應老闆：出國帶一次貨，債就一筆勾銷。',
            omen: '土明燙得發痛：「帶個貨」三個字，可能讓你一輩子回不了家。',
            effects: { shadow: 1 }, flags: { courier: true }, next: 'tp3_courier' }
        ]
      }]
    },
    c2_surrender: {
      ch: 2, theme: 'dawn',
      scene: { place: 'station', chars: [hero('sad', 300), npc('officer', 'normal', 520)] },
      lines: [
        '警察局的燈很亮。{name}把群組、提款紀錄、Max 哥的帳號，全部交了出來。',
        ['警察', '你願意自首、配合調查，法院會考慮減輕刑度。但你領走的錢，是別人的血汗錢，這個責任還是要扛。'],
        { text: '接下來的幾個月，{name}開庭、道歉、做義務勞動，一點一點賠償被害的老奶奶。', scene: { chars: [hero('sad', 300), npc('grandma', 'sad', 520)] } },
        ['阿嬤', '跌倒了，就站起來。阿嬤陪你。'],
        { text: '這段路很難走。但{name}知道，從今天開始，{ta}不用再害怕手機響起。', scene: { chars: [hero('normal', 300), npc('grandma', 'happy', 520)] } },
        '後來，{ta}在霓虹港一家水晶商店找到工作，從頭開始存旅費。'
      ],
      effects: { bond: 1, coin: 1 },
      next: 'c3_intro'
    },
    c2_report: {
      ch: 2, theme: 'dawn',
      scene: { place: 'station', chars: [hero('sad', 300), npc('officer', 'normal', 520)] },
      lines: [
        ['警察', '你收了租金，把帳戶交給不認識的人，這已經觸犯洗錢防制法。但你主動說明、配合調查，這對你會有幫助。'],
        '{name}交出了和「老闆」的所有對話紀錄。',
        { text: '最後，檢察官給了{name}緩起訴，條件是做義務勞務、賠償被害人。{ta}的帳戶，未來好幾年都會被限制。', scene: { chars: [hero('normal', 300), npc('officer', 'normal', 520)] } },
        ['{name}', '「借一下帳戶」，原來代價這麼大。'],
        '{ta}在霓虹港一家水晶商店找到工作，從頭開始存旅費。'
      ],
      effects: { bond: 1, coin: 1 },
      next: 'c3_intro'
    },

    /* ======================== 第三章 一只行李箱 ======================== */
    c3_intro: {
      ch: 3, theme: 'desert',
      scene: { place: 'airport', chars: [hero('happy', 300)], props: [{ id: 'ticket', x: 450, y: 330 }] },
      lines: [
        '終於，{name}買到了去沙之城的商隊票。出發前一晚，{ta}的腕環亮了一下。'
      ],
      next: s => (s.flags.ash ? 'c3_ash' : 'c3_normal')
    },
    c3_normal: {
      ch: 3, theme: 'desert',
      scene: { place: 'airport', chars: [hero('normal', 300), npc('stranger', 'happy', 520)], props: [{ id: 'suitcase', x: 420, y: 395 }] },
      lines: [
        '在「沙之城旅人互助群」裡，一位自稱同鄉的姊姊私訊{name}：',
        ['同鄉姊姊', '{g:弟弟|妹妹}，聽說你明天要去沙之城？可以幫我帶一盒茶葉和保健品給我阿姨嗎？她在那邊買不到。'],
        ['同鄉姊姊', '我請你 5000 星幣當謝禮，到機場會有人接你拿。包裝都封好了，很輕的。']
      ],
      next: 'tp3_normal'
    },
    tp3_normal: {
      ch: 3, tp: 'tp3', theme: 'desert',
      scene: { place: 'airport', chars: [hero('normal', 300), npc('stranger', 'happy', 520)], props: [{ id: 'suitcase', x: 420, y: 395 }] },
      prompt: '只是幫忙帶個東西，還有 5000 星幣。要答應嗎？',
      sets: [{
        options: [
          { id: 'tp3_refuse', tag: 'growth', text: '婉拒。在群組提醒大家，並把對方帳號檢舉給警方。',
            omen: '烏陵亮起來：你的一句提醒，也許救了下一個人。',
            effects: { heart: 1, alert: 1, bond: 1 }, next: 'c3_safe' },
          { id: 'tp3_check', tag: 'gray', text: '答應，但要求當面打開，自己檢查過再帶。',
            omen: '兩顆石頭一起晃動：打開看是好習慣，但毒品常藏在你看不出來的地方。',
            effects: { alert: 1 }, next: 'c3_check' },
          { id: 'tp3_carry', tag: 'danger', text: '收下 5000 謝禮。只是茶葉嘛，沒什麼。',
            omen: '土明燙得發痛：行李在誰手上，刑責就在誰身上。',
            effects: { coin: 1, shadow: 3 }, next: 'e_suitcase' }
        ]
      }]
    },
    c3_ash: {
      ch: 3, theme: 'dream',
      scene: { place: 'airport', chars: [hero('normal', 300), npc('ash', 'happy', 540)], props: [{ id: 'suitcase', x: 420, y: 395, dark: true }] },
      lines: [
        ['艾許', '聽說你要去沙之城？好巧，我現在就在那裡出差！'],
        ['艾許', '我請朋友拿一個小行李箱給你，裡面是我送媽媽的生日禮物。你幫我帶過來，我們終於可以見面了♡'],
        '{name}想起那筆領不出來的錢。艾許說那是「系統問題」，已經說了一個月。'
      ],
      next: 'tp3_ash'
    },
    tp3_ash: {
      ch: 3, tp: 'tp3', theme: 'dream',
      scene: { place: 'airport', chars: [hero('worried', 300), npc('ash', 'happy', 540)], props: [{ id: 'suitcase', x: 420, y: 395, dark: true }] },
      prompt: '終於可以見面了。可是，這個行李箱……',
      sets: [{
        options: [
          { id: 'tp3_block', tag: 'dawn', text: '我看清楚了。封鎖艾許，把所有對話截圖交給 165。',
            omen: '烏陵發出溫暖的光：停損，永遠不嫌晚。',
            effects: { heart: 1, alert: 1, shadow: -1 }, flags: { ash: false }, next: 'c3_safe' },
          { id: 'tp3_ask', tag: 'gray', text: '先問艾許：「箱子裡到底是什麼？我可以打開看嗎？」',
            omen: '土明有點冰：真正的禮物，不會怕你打開。',
            effects: { alert: 1 }, next: 'c3_ash_ask' },
          { id: 'tp3_love', tag: 'danger', text: '為了見到艾許，帶著行李箱上飛機。',
            omen: '土明燙得發痛：在對方的劇本裡，你從來不是戀人，是「運毒者」。',
            effects: { shadow: 3 }, next: 'e_suitcase' }
        ]
      }]
    },
    c3_ash_ask: {
      ch: 3, theme: 'danger',
      scene: { place: 'airport', chars: [hero('shock', 300), npc('ash', 'smirk', 540)] },
      lines: [
        ['艾許', '你這是什麼意思？你不信任我？我對你這麼好，你竟然懷疑我？'],
        ['{name}', '我只是想看一下……'],
        { text: '下一秒，艾許的帳號消失了。頭像、對話、那些早安晚安，全部變成一片空白。', sfx: 'gloom' },
        { text: '{name}在機場坐了很久。最後，{ta}把剩下的截圖交給了 165，獨自上了商隊。', theme: 'desert', scene: { chars: [hero('sad', 400)] } }
      ],
      effects: { heart: 1 },
      next: 'c4_intro'
    },
    c3_check: {
      ch: 3, theme: 'desert',
      scene: { place: 'airport', chars: [hero('worried', 300), npc('stranger', 'smirk', 520)], props: [{ id: 'suitcase', x: 420, y: 395 }] },
      lines: [
        '{name}堅持當面打開。茶葉罐看起來很正常……但有一罐特別重。',
        { text: '{ta}把罐子翻過來，底部有一層不自然的夾層。', sfx: 'danger', scene: { chars: [hero('shock', 300), npc('stranger', 'smirk', 520)] } },
        ['同鄉姊姊', '哎呀，那是防潮層啦，你想太多了。'],
        ['{name}', '對不起，這個我不能帶。'],
        { text: '{name}頭也不回地離開。後來{ta}才知道，那個帳號已經找過好多人了。', scene: { chars: [hero('normal', 400)] } },
        '（如果罐子做得更精巧，{ta}根本不會發現。最安全的做法，是一開始就不要幫陌生人帶東西。）'
      ],
      next: 'c4_intro'
    },
    c3_safe: {
      ch: 3, theme: 'growth',
      scene: { place: 'airport', chars: [hero('happy', 400)], props: [{ id: 'ticket', x: 540, y: 330 }] },
      lines: [
        '{name}把對方的帳號和對話交給了警方，也在群組裡提醒大家。',
        '好幾個人回覆：「我也收過一樣的私訊！」「謝謝提醒，差點就答應了。」',
        { text: '隔天早上，{name}只背著自己的背包，輕輕鬆鬆地登上了商隊。', theme: 'desert' }
      ],
      next: 'c4_intro'
    },
    tp3_overseas: {
      ch: 3, tp: 'tp3', theme: 'danger',
      scene: { place: 'airport', chars: [hero('worried', 300), npc('ash', 'happy', 540)], props: [{ id: 'ticket', x: 430, y: 330 }] },
      lines: [
        '艾許的朋友傳來一張機票：「海外客服，免經驗，包吃包住。護照到了公司會幫你保管。」'
      ],
      prompt: '月薪 15 萬，三個月就能把錢賺回來。{name}要去嗎？',
      sets: [{
        options: [
          { id: 'tp3_call', tag: 'dawn', text: '打給阿嬤，再查外交部的旅外警示——放棄這份工作。',
            omen: '烏陵發出溫暖的光：錢沒了可以再賺，人回不來就什麼都沒了。',
            effects: { heart: 1, bond: 1, shadow: -1 }, next: 'c3_home' },
          { id: 'tp3_hesitate', tag: 'gray', text: '先去機場再說……但在航警的關懷詢問下猶豫了。',
            omen: '兩顆石頭一起晃動：有人問你，就是一個回頭的機會。',
            effects: { alert: 1, shadow: -1 }, next: 'c3_police_ask' },
          { id: 'tp3_board', tag: 'danger', text: '登機。去賺回來，順便見艾許。',
            omen: '土明碎成兩半：「包機票、保管護照」——這是詐騙園區的招募話術。',
            effects: { shadow: 3 }, next: 'e_lost' }
        ]
      }]
    },
    c3_home: {
      ch: 3, theme: 'dawn',
      scene: { place: 'town', chars: [hero('sad', 300), npc('grandma', 'normal', 520)] },
      lines: [
        ['阿嬤', '傻孩子，錢沒了可以再賺。你人好好的，比什麼都重要。'],
        '外交部的網頁上，寫滿了「海外高薪工作」受困的案例：沒收護照、軍事化管理、業績沒達標就被打。',
        { text: '{name}到警察局報了案，也把艾許的帳號交給 165。', scene: { chars: [hero('normal', 300), npc('grandma', 'happy', 520)] } },
        '{ta}回到水晶商店，又花了好幾個月，重新存到旅費。這次，{ta}一個人出發。'
      ],
      next: 'c4_intro'
    },
    c3_police_ask: {
      ch: 3, theme: 'dawn',
      scene: { place: 'airport', chars: [hero('worried', 300), npc('officer', 'normal', 520)] },
      lines: [
        ['航警', '你好，請問這趟出國是去做什麼工作呢？公司名稱是？有簽合約嗎？'],
        ['{name}', '是……客服。公司名字，我不太清楚。護照說到了會幫我保管……'],
        ['航警', '這幾年好多年輕人都是這樣被騙到海外詐騙園區的。要不要先打給家人？'],
        { text: '{name}撥通阿嬤的電話，一開口就哭了。{ta}沒有登機。', scene: { chars: [hero('sad', 300), npc('officer', 'happy', 520)] } },
        '後來，{ta}回到水晶商店重新存錢，好幾個月後，才再次出發。'
      ],
      next: 'c4_intro'
    },
    tp3_courier: {
      ch: 3, tp: 'tp3', theme: 'danger',
      scene: { place: 'airport', chars: [hero('worried', 300), npc('che', 'normal', 520)], props: [{ id: 'suitcase', x: 420, y: 395, dark: true }] },
      lines: [
        '機場。一個深紫色的行李箱，靜靜地立在{name}腳邊。',
        ['澈', '到了沙之城，會有人跟你拿。什麼都不要問，什麼都不要打開。']
      ],
      prompt: '登機廣播響了。{name}要怎麼做？',
      sets: [{
        options: [
          { id: 'tp3_turn', tag: 'dawn', text: '打給阿嬤，然後走進航警局，把一切說出來。',
            omen: '烏陵發出溫暖的光：說出來的那一刻，你就從棋子變回了人。',
            effects: { heart: 2, shadow: -2, bond: 1 }, flags: { record: true, redeem: true }, next: 'c3_turn' },
          { id: 'tp3_flee', tag: 'gray', text: '丟下行李箱，關掉手機，逃回棉花糖鎮。',
            omen: '土明有點冰：逃得掉今天，逃不掉一直找上門的人。',
            effects: { shadow: 1 }, next: 'c3_flee' },
          { id: 'tp3_drag', tag: 'danger', text: '拖著行李箱，走向登機門。',
            omen: '土明碎成兩半：這個箱子，比你想像的重太多了。',
            effects: { shadow: 3 }, next: 'e_suitcase' }
        ]
      }]
    },
    c3_turn: {
      ch: 3, theme: 'dawn',
      scene: { place: 'station', chars: [hero('sad', 300), npc('officer', 'normal', 520)], props: [{ id: 'suitcase', x: 420, y: 395, dark: true }] },
      lines: [
        '航警打開行李箱。夾層裡，是一包包白色的粉末。',
        ['航警', '如果你帶上飛機，在國外被查到，可能是無期徒刑，甚至死刑。你現在說出來，是救了你自己。'],
        { text: '{name}配合調查，交出所有聯絡紀錄。之後的日子，有開庭、有後悔，也有阿嬤每天送來的便當。', scene: { chars: [hero('normal', 300), npc('grandma', 'normal', 520)] } },
        '一年後，{name}重新回到水晶商店，存下了乾淨的旅費。'
      ],
      next: 'c4_intro'
    },
    c3_flee: {
      ch: 3, theme: 'danger',
      scene: { place: 'room', chars: [hero('worried', 300)], props: [{ id: 'phone', x: 470, y: 260, screen: '#2c3038' }] },
      lines: [
        '{name}逃回棉花糖鎮，躲在房間裡好幾個禮拜。',
        { text: '陌生號碼一直打來。門口出現奇怪的紙條：「欠的，總要還。」', sfx: 'danger' },
        { text: '阿嬤發現了。她什麼都沒罵，只是牽著{name}的手，一起走進警察局報案。', theme: 'dawn', scene: { chars: [hero('sad', 300), npc('grandma', 'normal', 520)] } },
        '事情沒有一下子結束，但{name}不再是一個人面對。幾個月後，{ta}重新踏上旅程——心裡還壓著一塊石頭。'
      ],
      next: 'c4_intro'
    },

    /* ======================== 第四章 沙漠部落的衝突 ======================== */
    c4_intro: {
      ch: 4, theme: 'desert',
      scene: { place: 'desert', chars: [hero('happy', 300), npc('hao', 'happy', 470)] },
      lines: [
        '商隊在沙海上滑行，白天熱得發燙，晚上星星多得像撒了糖。',
        ['阿豪', '我叫阿豪！你也要去沙之城？以後就是{g:兄弟|姊妹}了，有事我罩你！'],
        '阿豪講話很大聲，笑起來也很大聲。一路上，他總是把最大塊的麵包分給{name}。',
        { text: '商隊在綠洲停了下來。井邊，一個戴綠帽子的女孩正在幫駱駝打水。', theme: 'growth', scene: { place: 'oasis', chars: [hero('normal', 300), npc('tima', 'happy', 520)] } },
        ['緹瑪', '你也是追夢的旅人吧？你的眼睛跟沙漠的星星一樣。'],
        '{name}和緹瑪聊了一整個下午。不必隱藏、不用討好，安安靜靜的，很舒服。',
        ['緹瑪', '去完成你的旅程吧。真正的喜歡，不會叫你停下來。']
      ],
      next: 'c4_night'
    },
    c4_night: {
      ch: 4, theme: 'desert',
      scene: { place: 'plaza', chars: [hero('shock', 300), npc('hao', 'sad', 500)] },
      lines: [
        '那天晚上，阿豪鼻青臉腫地回來。',
        ['阿豪', '另一個車隊的人在夜市嗆我，還推我……我咽不下這口氣！'],
        { text: '腕環震動：阿豪在群組發了訊息——「今晚 11 點，綠洲廣場，帶傢伙。挺我的就來！」', sfx: 'danger' }
      ],
      next: s => (s.stats.shadow >= 3 ? 'tp4_heated' : 'tp4_calm')
    },
    tp4_calm: {
      ch: 4, tp: 'tp4', theme: 'desert',
      scene: { place: 'plaza', chars: [hero('worried', 300), npc('hao', 'sad', 500)] },
      prompt: '群組裡已經有好幾個人回「+1」。阿豪看著{name}。',
      sets: [{
        options: [
          { id: 'tp4_help', tag: 'growth', text: '「我挺你——陪你去驗傷、報警，把影片交給警察。」',
            omen: '烏陵亮起來：真正的挺，是讓朋友不要毀掉自己。',
            effects: { heart: 1, bond: 1 }, next: 'c4_good' },
          { id: 'tp4_silent', tag: 'gray', text: '不去。但也沒在群組說什麼。',
            omen: '兩顆石頭一起晃動：你沒做錯，但也許你可以做得更多。',
            effects: { heart: -1 }, next: 'c4_silent' },
          { id: 'tp4_stand', tag: 'danger', text: '去。「我只是站在旁邊撐場面，不會動手。」',
            omen: '土明燙得發痛：在場助勢，也觸犯妨害秩序罪。',
            effects: { shadow: 2 }, next: 'e_fight' }
        ]
      }]
    },
    tp4_heated: {
      ch: 4, tp: 'tp4', theme: 'danger',
      scene: { place: 'plaza', chars: [hero('worried', 300), npc('hao', 'smirk', 500)], props: [{ id: 'stick', x: 410, y: 340 }] },
      lines: [
        '阿豪塞了一支甩棍到{name}手裡。',
        ['阿豪', '你上次不是說你什麼都不怕？今天就看你了。']
      ],
      prompt: '{name}心裡那塊石頭，又沉了一點。要怎麼做？',
      sets: [{
        options: [
          { id: 'tp4_stop', tag: 'dawn', text: '把甩棍丟掉，報警說有人要在廣場聚眾鬥毆。',
            omen: '烏陵發出溫暖的光：你終於選了一次，讓自己不再後悔的事。',
            effects: { heart: 1, bond: 1, shadow: -1 }, next: 'c4_good' },
          { id: 'tp4_sneak', tag: 'gray', text: '先跟去，半路再找藉口溜走。',
            omen: '土明有點冰：你逃開了現場，卻沒有阻止任何事。',
            effects: { shadow: 1 }, next: 'c4_silent' },
          { id: 'tp4_charge', tag: 'danger', text: '衝第一個，替兄弟出這口氣！',
            omen: '土明碎成兩半：一時的義氣，可能換來好幾年的後悔。',
            effects: { shadow: 3 }, next: 'e_fight' }
        ]
      }]
    },
    c4_good: {
      ch: 4, theme: 'growth',
      scene: { place: 'oasis', chars: [hero('normal', 300), npc('hao', 'sad', 500)] },
      lines: [
        ['阿豪', '……報警？你是不是不挺我？'],
        ['{name}', '我就是挺你，才不要你為了那些人去坐牢。你臉上的傷，是證據；你被推的影片，也是證據。'],
        { text: '{name}陪阿豪去綠洲診所驗傷，把影片交給警察。群組裡的「+1」，一個一個收回去了。', scene: { chars: [hero('happy', 300), npc('hao', 'happy', 500)] } },
        ['阿豪', '……謝啦。剛剛要是真的去了，我現在大概在警察局，不是在這裡吃宵夜。'],
        { who: '緹瑪', text: '你是個會照顧別人的旅人。沙之城就在前面了。', scene: { chars: [hero('happy', 300), npc('tima', 'happy', 500)] } }
      ],
      effects: { heart: 1 },
      next: 'c5_intro'
    },
    c4_silent: {
      ch: 4, theme: 'desert',
      scene: { place: 'oasis', chars: [hero('sad', 400)] },
      lines: [
        '那天晚上，{name}一個人坐在帳篷裡，聽見遠處傳來尖叫和警笛聲。',
        { text: '隔天才知道：廣場上打成一團，有人頭破血流。阿豪和群組裡的五個人，全部被帶回警局。', sfx: 'gloom' },
        '如果那時候，{ta}在群組說一句「不要去」，會不會不一樣？',
        '{name}帶著這個問題，繼續往沙之城走。'
      ],
      next: 'c5_intro'
    },

    /* ======================== 第五章 煉金術士的試煉 ======================== */
    c5_intro: {
      ch: 5, theme: 'desert',
      scene: { place: 'spring', chars: [hero('happy', 280), npc('alchemist', 'normal', 520)] },
      lines: [
        '沙之城到了。城中央，星之泉閃閃發亮。',
        '泉邊站著一個穿紫色斗篷的人，手上的燒瓶冒著小星星。',
        ['艾爾', '我是煉金師艾爾。我等你很久了，{name}。撒冷說，你是一個願意聽自己心跳的人。'],
        ['艾爾', '煉金術最難的，不是把鉛變成金，而是在誘惑面前，聽見自己真正的聲音。'],
        ['艾爾', '今晚城裡有慶典。去吧，那是你最後一個試煉。']
      ],
      next: s => (s.stats.shadow >= 3 ? 'c5_party_dark' : 'c5_party')
    },
    c5_party: {
      ch: 5, theme: 'danger',
      scene: { place: 'party', chars: [hero('happy', 260), npc('stranger', 'happy', 520), npc('lulu', 'happy', 650, { scale: .9 })], props: [{ id: 'coffee', x: 400, y: 330 }] },
      lines: [
        '慶典的音樂震得地板發抖。燈光變成尖尖的紫色碎片。',
        '{name}遇到一群也來追夢的年輕人，其中一個戴鹿角髮箍的女孩叫小鹿，很快就跟{ta}混熟了。',
        ['陌生人', '來來來，沙漠限定「星星咖啡包」！喝了整晚都很嗨，大家都在喝～'],
        { text: '包裝印著可愛的笑臉。小鹿已經喝了一包，正搖搖晃晃地坐下來，臉色有點白。', sfx: 'danger', scene: { chars: [hero('worried', 260), npc('stranger', 'smirk', 520), npc('lulu', 'sad', 650, { scale: .9 })] } }
      ],
      next: 'tp5_clean'
    },
    tp5_clean: {
      ch: 5, tp: 'tp5', theme: 'danger',
      scene: { place: 'party', chars: [hero('worried', 260), npc('stranger', 'smirk', 520), npc('lulu', 'sad', 650, { scale: .9 })], props: [{ id: 'coffee', x: 400, y: 330 }] },
      prompt: '一包咖啡包被塞到{name}手裡。',
      sets: [{
        options: [
          { id: 'tp5_save', tag: 'growth', text: '拒絕。大聲提醒大家這可能是毒咖啡包，立刻幫小鹿叫 119。',
            omen: '烏陵亮起來：你的冷靜，可能救了一條命。',
            effects: { heart: 1, bond: 1 }, next: 'c5_good' },
          { id: 'tp5_leave', tag: 'gray', text: '笑笑地婉拒，自己先離開。',
            omen: '兩顆石頭一起晃動：你保護了自己，但小鹿還在裡面。',
            next: 'c5_leave' },
          { id: 'tp5_try', tag: 'danger', text: '只試一次，應該沒關係吧。',
            omen: '土明碎成兩半：成分不明、劑量不明——「一次」也可能是最後一次。',
            effects: { shadow: 3 }, next: 'e_abyss' }
        ]
      }]
    },
    c5_party_dark: {
      ch: 5, theme: 'danger',
      scene: { place: 'party', chars: [hero('sad', 260), npc('stranger', 'smirk', 520)], props: [{ id: 'coffee', x: 400, y: 330 }] },
      lines: [
        '慶典的音樂很吵，{name}卻覺得好安靜。',
        '這一路上發生的事，像沙子一樣塞滿胸口：那些錢、那些人、那些晚上睡不著的時候。',
        ['陌生人', '你看起來好累。試試這個「星星咖啡包」，喝了就什麼煩惱都忘了。'],
        { text: '包裝上的笑臉，好像在對{ta}笑。', sfx: 'danger' }
      ],
      next: 'tp5_dark'
    },
    tp5_dark: {
      ch: 5, tp: 'tp5', theme: 'danger',
      scene: { place: 'party', chars: [hero('sad', 260), npc('stranger', 'smirk', 520)], props: [{ id: 'coffee', x: 400, y: 330 }] },
      prompt: '「忘掉一切」……聽起來好誘人。',
      sets: [{
        options: [
          { id: 'tp5_help', tag: 'dawn', text: '把咖啡包推回去。去找艾爾，說出「我撐不住了」，撥打 1925。',
            omen: '烏陵發出溫暖的光：說出「我需要幫忙」，是最勇敢的煉金術。',
            effects: { heart: 2, shadow: -2 }, next: 'c5_good' },
          { id: 'tp5_pocket', tag: 'gray', text: '收進口袋。「先留著，不喝。」',
            omen: '土明有點冰：「先留著」的東西，總有一天會被打開。',
            effects: { shadow: 1 }, next: 'c5_pocket' },
          { id: 'tp5_drink', tag: 'danger', text: '喝下去。今晚，什麼都不想了。',
            omen: '土明碎成兩半：它不會讓痛苦消失，只會讓你也跟著消失。',
            effects: { shadow: 3 }, next: 'e_abyss' }
        ]
      }]
    },
    c5_good: {
      ch: 5, theme: 'dawn',
      scene: { place: 'spring', chars: [hero('normal', 280), npc('alchemist', 'happy', 520)] },
      lines: [
        { text: '救護車的燈在廣場上閃爍。醫生說，再晚一點送來，後果不堪設想。' },
        ['艾爾', '你通過了試煉。拒絕誘惑，不是因為害怕，而是因為你清楚自己要去哪裡。'],
        ['艾爾', '而且你沒有只顧著自己。這就是煉金術的祕密——當你變得更好，身邊的一切也會跟著變好。']
      ],
      next: 'f_dig'
    },
    c5_leave: {
      ch: 5, theme: 'desert',
      scene: { place: 'spring', chars: [hero('worried', 280), npc('alchemist', 'normal', 520)] },
      lines: [
        '{name}走出慶典。身後的音樂越來越遠。',
        { text: '半夜，救護車的聲音劃過沙之城。{ta}不知道，被抬上車的是不是小鹿。', sfx: 'gloom' },
        ['艾爾', '你守住了自己，這很重要。但下一次，也許你可以多守住一個人。']
      ],
      next: 'f_dig'
    },
    c5_pocket: {
      ch: 5, theme: 'danger',
      scene: { place: 'spring', chars: [hero('worried', 280), npc('alchemist', 'worried', 520)], props: [{ id: 'coffee', x: 400, y: 330 }] },
      lines: [
        '回到泉邊，艾爾看了一眼{name}鼓鼓的口袋。',
        ['艾爾', '持有毒品本身就是違法的。而且你留著它，是因為心裡還有一個角落，想逃。'],
        { text: '{name}把咖啡包丟進焚化箱。火光一閃，{ta}突然好想哭。', theme: 'desert', scene: { chars: [hero('sad', 280), npc('alchemist', 'normal', 520)] } },
        ['艾爾', '想逃不丟臉。累了就說，安心專線 1925，24 小時都有人在。']
      ],
      next: 'f_dig'
    },

    /* ======================== 終章 回到起點 ======================== */
    f_dig: {
      ch: 6, theme: 'desert',
      scene: { place: 'spring', chars: [hero('normal', 300)] },
      lines: [
        '天亮前，{name}在星之泉旁邊挖了好久好久。',
        { text: '什麼都沒有。只有沙子。', scene: { chars: [hero('sad', 300)] } },
        { text: '一個巡夜的老人走過來，看了看{ta}挖的洞，笑了。', scene: { chars: [hero('sad', 300), npc('stranger', 'happy', 520)] } },
        ['老人', '我年輕的時候也做過一個傻夢，夢見寶藏埋在一個叫棉花糖鎮的地方，在一棵雲朵樹底下。哈哈，我才不會為了一個夢跑那麼遠呢。'],
        { who: '{name}', text: '……雲朵樹？', scene: { chars: [hero('shock', 300), npc('stranger', 'happy', 520)] } }
      ],
      next: 'f_home'
    },
    f_home: {
      ch: 6, theme: 'dream',
      scene: { place: 'tree', chars: [hero('happy', 300), npc('salem', 'happy', 540, { scale: .8 })], props: [{ id: 'box', x: 420, y: 400 }] },
      lines: [
        '{name}回到棉花糖鎮，在公園的雲朵樹下挖呀挖——',
        { text: '「叩」。一個舊舊的小木盒。', sfx: 'sparkle' },
        '盒子裡有一封阿嬤的信，還有一張{name}小時候畫的圖：一個小孩牽著另一個小孩的手，走向閃亮的泉水。',
        ['撒冷', '嗶嗶。歡迎回來，{name}。你找到寶藏了嗎？']
      ],
      next: s => (s.stats.heart >= 5 && s.stats.shadow <= 2 ? 'e_legend' : s.stats.shadow >= 5 ? 'e_safe_heavy' : 'e_safe')
    },

    /* ======================== 結局 ======================== */
    e_legend: {
      ch: 6, theme: 'dawn', ending: 'legend',
      scene: { place: 'tree', chars: [hero('happy', 300), npc('grandma', 'happy', 520)], props: [{ id: 'letter', x: 420, y: 330 }] },
      lines: [
        ['阿嬤', '（信）「{name}，當你讀到這封信，你應該已經走了很遠的路。」'],
        ['阿嬤', '「寶藏從來不在泉水底下。它是你在每一個路口，選擇了自己的那一刻。」'],
        ['{name}', '……我找到了。']
      ],
      summary: [
        '{name}一路上遇過快錢、甜言蜜語、來路不明的行李、兄弟的義氣、可愛包裝的毒品。每一次，{ta}都聽見了自己的心跳。',
        '寶藏就埋在出發的地方——是一路上沒有弄丟的自己，還有那些在旁邊陪著{ta}的人。',
        '在現實世界裡，這些誘惑每天都在發生。你不需要每次都選得完美，但請記得：覺得不對勁時，停下來、問問人、撥 165 或 110，永遠不嫌晚。'
      ],
      endScene: { place: 'tree', chars: [hero('happy', 260), npc('grandma', 'happy', 420), npc('salem', 'happy', 580, { scale: .8 })], props: [{ id: 'box', x: 680, y: 400 }] }
    },
    e_safe: {
      ch: 6, theme: 'dream', ending: 'safe',
      scene: { place: 'tree', chars: [hero('normal', 300), npc('salem', 'normal', 540, { scale: .8 })], props: [{ id: 'letter', x: 420, y: 330 }] },
      lines: [
        ['阿嬤', '（信）「{name}，不管你這一路走得怎麼樣，能平安回家，阿嬤就很高興了。」'],
        ['{name}', '平安回家了……可是，好像還少了什麼。'],
        ['撒冷', '有些路口，你保護了自己，卻沒有伸手拉別人一把；有些時候，你差一點點就走錯了。下一次，再勇敢一點點吧。']
      ],
      summary: [
        '{name}平安回到棉花糖鎮。沒有被抓、沒有被騙光，這已經很不容易。',
        '但旅途中有些時候，{ta}選擇了沉默，或是差一點點就踏進陷阱。真正的「自己的傳說」，除了避開危險，也包括在朋友需要的時候站出來。',
        '想看看不一樣的結局嗎？試著回到某個轉折點，選一條更勇敢的路。'
      ]
    },
    e_safe_heavy: {
      ch: 6, theme: 'dream', ending: 'safe',
      scene: { place: 'tree', chars: [hero('sad', 300), npc('salem', 'worried', 540, { scale: .8 })], props: [{ id: 'letter', x: 420, y: 330 }] },
      lines: [
        ['阿嬤', '（信）「{name}，不管你這一路走得怎麼樣，能平安回家，阿嬤就很高興了。」'],
        ['{name}', '我回來了。可是……晚上還是會夢到那些陌生號碼、那個行李箱。'],
        ['撒冷', '嗶。你差一點點就回不來了。心裡的石頭，不用一個人扛——說出來，找人幫忙，它會慢慢變輕的。']
      ],
      summary: [
        '{name}平安回到棉花糖鎮，但這趟旅程留下了很深的影子：曾經靠近的人、做過的事，還有好幾次差點踏進去的陷阱。',
        '從危險裡走出來，比一開始就避開難得多，也需要更多人的幫忙。如果你也覺得壓力大到撐不住，可以打 1925 安心專線聊聊。',
        '想看看不一樣的結局嗎？試著回到某個轉折點，選一條回頭的路——回頭，永遠不嫌晚。'
      ]
    },
    e_jail_mule: {
      ch: 2, theme: 'gray', ending: 'jail', cases: ['mule'],
      scene: { place: 'street', chars: [hero('shock', 300), npc('officer', 'normal', 520)], props: [{ id: 'card', x: 420, y: 330 }] },
      lines: [
        '「再一個月就好。」這句話，{name}說了三次。',
        { text: '第四次站在 ATM 前，背後傳來一句：「警察，不要動。」', sfx: 'gloom' },
        { text: '手銬很冰。新聞裡那位老奶奶的臉，一直在{name}腦海裡出現。', scene: { place: 'cell', chars: [hero('sad', 400)] } }
      ],
      summary: [
        '{name}以加重詐欺和洗錢罪被起訴。賺到的「日薪」，全部要吐出來，還得賠償被害人。',
        '詐騙集團的老闆從來不會出現在提款機前。被抓的，永遠是站在最前面的年輕人。',
        '「我只是打工」「我不知道」——在法庭上，這些話很難救你。'
      ],
      endScene: { place: 'cell', chars: [hero('sad', 400)] }
    },
    e_jail_acct: {
      ch: 2, theme: 'gray', ending: 'jail', cases: ['account'],
      scene: { place: 'room', chars: [hero('worried', 300)], props: [{ id: 'card', x: 470, y: 300 }, { id: 'card', x: 520, y: 320 }] },
      lines: [
        '{name}又辦了兩個帳戶交出去。',
        { text: '兩個月後，三個帳戶加起來，有上百個被害人的錢流過。', sfx: 'gloom' },
        { text: '這一次，警察直接來到了家門口。', scene: { place: 'cell', chars: [hero('sad', 400)] } }
      ],
      summary: [
        '收錢出租帳戶、一次交出好幾個帳戶，都直接觸犯洗錢防制法，還可能被依幫助詐欺起訴，並面對被害人的民事求償。',
        '{name}以為自己「什麼都沒做」，但每一筆被騙的錢，都是從{ta}的名字底下流走的。',
        '帳戶是你的身分，不是可以出租的東西。'
      ],
      endScene: { place: 'cell', chars: [hero('sad', 400)] }
    },
    e_suitcase: {
      ch: 3, theme: 'gray', ending: 'suitcase',
      scene: { place: 'airport', chars: [hero('happy', 300)], props: [{ id: 'suitcase', x: 420, y: 395, dark: true }] },
      lines: [
        '飛機降落在遠方的國家。{name}拖著行李走向海關。',
        { text: '緝毒犬停在{ta}的行李箱前面，不肯走。', sfx: 'gloom', scene: { chars: [hero('shock', 300), npc('officer', 'normal', 520)] } },
        '箱子的夾層被割開。裡面不是茶葉，不是禮物，是毒品。',
        { text: '{name}一直說「我不知道」。但聽不懂的語言、陌生的法庭，沒有人在乎{ta}知不知道。', scene: { place: 'cell', chars: [hero('sad', 400)] } }
      ],
      summary: [
        '{name}因運輸毒品在國外被捕。在許多國家，運毒是重罪，可能面臨數十年徒刑，甚至死刑。',
        '請{ta}幫忙的人——不管是網友、戀人、同鄉，還是「老闆」——一個都聯絡不上了。',
        '行李在誰手上，刑責就在誰身上。不要幫任何人攜帶或託運你不清楚的東西。'
      ],
      endScene: { place: 'cell', chars: [hero('sad', 400)], props: [{ id: 'suitcase', x: 250, y: 395, dark: true }] }
    },
    e_lost: {
      ch: 3, theme: 'gray', ending: 'lost',
      scene: { place: 'airport', chars: [hero('happy', 300)], props: [{ id: 'ticket', x: 450, y: 330 }] },
      lines: [
        '飛機降落後，一台廂型車來接{name}。車上還有好幾個跟{ta}一樣年輕的人。',
        { text: '到了「公司」，護照被收走，手機被沒收。高高的圍牆上，有一圈鐵絲網。', sfx: 'gloom', scene: { place: 'cell', chars: [hero('shock', 400)] } },
        ['管理員', '從今天起，你負責打電話騙人。業績沒達標，就沒飯吃。'],
        { text: '艾許，從來就不存在。', scene: { place: 'cell', chars: [hero('sad', 400)] } }
      ],
      summary: [
        '{name}先被愛情詐騙騙光了錢，又被「海外高薪工作」騙進了詐騙園區。這是真實發生過的連環騙局。',
        '在園區裡，被騙去的人被迫去騙更多人；想離開，要付一大筆「贖身費」，或被轉賣到另一個園區。',
        '「免經驗、包機票、保管護照、月薪十幾萬」——看到這些字，請立刻停下來，打給家人或 165。'
      ],
      endScene: { place: 'cell', chars: [hero('sad', 400)] }
    },
    e_fight: {
      ch: 4, theme: 'gray', ending: 'fight',
      scene: { place: 'plaza', chars: [hero('worried', 260), npc('hao', 'smirk', 400), npc('crowd', 'normal', 600)] },
      lines: [
        '晚上 11 點，綠洲廣場。兩邊加起來快二十個人。',
        { text: '不知道是誰先動手的。尖叫、碰撞、有人倒在地上。', sfx: 'gloom', scene: { chars: [hero('shock', 260), npc('hao', 'sad', 400), npc('crowd', 'normal', 600)] } },
        '警笛聲從四面八方響起。{name}根本來不及跑。',
        { text: '「我只是站在旁邊而已……」{name}在警局裡，一遍又一遍地說。', scene: { place: 'cell', chars: [hero('sad', 400)] } }
      ],
      summary: [
        '{name}和阿豪等人一起，以妨害秩序罪被起訴。有人被打成重傷，傷害罪和民事賠償也接踵而來。',
        '一時的義氣，換來的是前科、賠償，還有一輩子忘不了的那個晚上。',
        '朋友被欺負時，陪他報警、驗傷、保存證據，才是真正的「挺」。'
      ],
      endScene: { place: 'cell', chars: [hero('sad', 400)] }
    },
    e_abyss: {
      ch: 5, theme: 'gray', ending: 'abyss',
      scene: { place: 'party', chars: [hero('happy', 300)], props: [{ id: 'coffee', x: 420, y: 330 }] },
      lines: [
        '甜甜的，一點都不像毒品。{name}覺得整個人輕飄飄的，燈光變得好漂亮。',
        { text: '然後，心臟開始狂跳。呼吸越來越急。地板在旋轉。', sfx: 'gloom', scene: { chars: [hero('shock', 300)] } },
        { text: '醒來時，{name}躺在醫院。醫生說，{ta}差一點就沒有醒來。', scene: { place: 'void', chars: [hero('sad', 400)] } },
        '而最可怕的是：出院後，{ta}竟然還想再喝一次。'
      ],
      summary: [
        '毒咖啡包裡常混了好幾種毒品，成分和劑量沒有人說得準。{name}撿回一條命，卻開始了漫長的戒癮之路。',
        '沙之城就在眼前，{name}卻再也聽不見自己的心跳——毒品最可怕的，不只是傷身體，而是讓你忘了自己想去哪裡。',
        '如果你或身邊的人已經碰了毒品，不要一個人撐：戒毒成功專線 0800-770-885，24 小時都有人接。'
      ],
      endScene: { place: 'void', chars: [hero('sad', 400)] }
    }
  };

  const endings = {
    legend: { icon: '🌟', name: '自己的傳說', good: true, hint: '一路聽從心之聲，並在別人需要時伸出手。', cases: [], hotlines: ['165', '110', '1925'] },
    safe: { icon: '🌤️', name: '平凡的安全', good: true, hint: '平安回家，但總覺得少了什麼。', cases: [], hotlines: ['165', '1925'] },
    jail: { icon: '⛓️', name: '鐵窗裡的旅費', hint: '想用最快的方法賺到旅費……', cases: ['mule', 'account'], hotlines: ['165', '110'] },
    suitcase: { icon: '🧳', name: '回不了家的行李箱', hint: '只是幫忙帶個東西而已。', cases: ['suitcase'], hotlines: ['110', '165', '800-0885-0885'] },
    lost: { icon: '💔', name: '人財兩失', hint: '為了愛，也為了把錢賺回來。', cases: ['romance', 'overseas'], hotlines: ['165', '800-0885-0885'] },
    fight: { icon: '🗡️', name: '一時義氣', hint: '兄弟有難，怎麼能不挺？', cases: ['fight'], hotlines: ['110', '1925'] },
    abyss: { icon: '🌀', name: '深淵', hint: '只試一次，應該沒關係吧？', cases: ['drug'], hotlines: ['0800-770-885', '119', '1925'] }
  };

  const chapters = ['序章　粉紅雲朵鎮', '第一章　啟程的旅費', '第二章　霓虹港的相遇', '第三章　一只行李箱', '第四章　沙漠部落的衝突', '第五章　煉金術士的試煉', '終章　回到起點'];
  const tpNames = { tp0: '出發', tp1: '旅費', tp2: '霓虹港', tp3: '行李箱', tp4: '挺朋友', tp5: '慶典' };

  /* 依目前狀態挑出這個轉折點要顯示的 3 個選項 */
  function resolveOptions(node, s) {
    const set = node.sets.find(st => !st.when || st.when(s));
    return set.options.map(o => (o.if && !o.if(s) ? o.else : o));
  }
  function resolveNext(node, s) {
    return typeof node.next === 'function' ? node.next(s) : node.next;
  }

  window.STORY = { start: 'p1', nodes, endings, chapters, tpNames, resolveOptions, resolveNext };
})();
