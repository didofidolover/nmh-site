var STYLES = [
  {id:'all', en:'All', ar:'الكل'}, {id:'evening', en:'Evening', ar:'السهرة'}, {id:'everyday', en:'Everyday', ar:'يومي'},
  {id:'abaya', en:'Under-abaya', ar:'تحت العباية'}, {id:'jumpsuit', en:'Jumpsuits', ar:'جمبسوت'}
];
var STYLE_INFO = {
  all:{title:{en:'All pieces',ar:'جميع المنتجات'}, intro:{en:'Every piece we make, across every collection. Each one is cut to order in your size and length.',ar:'جميع قطعنا من كل المجموعات. تُفصَّل كل قطعة حسب الطلب وفق مقاسك وطولك.'}, imgs:['img/bloom-1.jpg','img/front-olive.webp','img/n04.jpg']},
  evening:{title:{en:'Evening',ar:'السهرة'}, intro:{en:'Full skirts, long sleeves and prints that hold the light. Dresses for weddings, Eid and the evenings you plan for.',ar:'تنانير واسعة، وأكمام طويلة، وطبعات تلتقط الضوء. فساتين للأعراس والأعياد والأمسيات المنتظرة.'}, imgs:['img/desert-1.jpg','img/front-dew.webp','img/rose-wall.jpg']},
  everyday:{title:{en:'Everyday',ar:'يومي'}, intro:{en:'Easy shapes in calm colours, for work, errands and long days out.',ar:'قصّات مريحة بألوان هادئة، للعمل والمشاوير والأيام الطويلة.'}, imgs:['img/n07.jpg','img/front-azure.webp','img/n01.jpg']},
  abaya:{title:{en:'Under-abaya',ar:'تحت العباية'}, intro:{en:'Simple, light layers cut to sit cleanly under your abaya.',ar:'طبقات بسيطة وخفيفة، مفصّلة لتنسدل بانسيابية تحت العباية.'}, imgs:['img/navy.jpg','img/n04.jpg','img/n09.jpg']},
  jumpsuit:{title:{en:'Jumpsuits',ar:'جمبسوت'}, intro:{en:'One piece, belted and ready. Modest cover with the ease of trousers.',ar:'قطعة واحدة بحزام. محتشمة ومريحة كالبنطال.'}, imgs:['img/n06.jpg','img/n07.jpg','img/n01.jpg']}
};
var SHADES = [
  {c:'#8A4A47', en:'Rosewood', ar:'خشب الورد'}, {c:'#24304F', en:'Midnight', ar:'كحلي ليلي'}, {c:'#C9A98A', en:'Sand', ar:'رملي'},
  {c:'#8FA594', en:'Sage', ar:'مريمية'}, {c:'#E3C2BC', en:'Blush', ar:'وردي فاتح'}, {c:'#EEE6D8', en:'Ivory', ar:'عاجي'},
  {c:'#5E2D4F', en:'Plum', ar:'برقوقي'}, {c:'#2F2A2C', en:'Onyx', ar:'أونيكس'}
];
var DYES = {
  olive:{code:'S02', en:'Olive Drape Gown', ar:'فستان أوليف درايب'},
  azure:{code:'S01', en:'Azure Cascade Midi', ar:'فستان أزور'}
};
var COLLECTIONS = [];

var PRODUCTS = [];

var ONE = [];
COLLECTIONS.unshift({id:'the-one', season:{en:'Signature · One of one',ar:'توقيع الدار · قطعة واحدة'}, cover:'img/bloom-3.jpg', small:'img/desert-4.jpg', tone:'#1C1B1B',
  name:{en:'The One',ar:'القطعة الواحدة'},
  story:{en:'One piece. Made once. Never again. Each dress in this line exists as a single piece; when it finds its owner, it is gone for good.',ar:'قطعة واحدة. تُصنع مرة واحدة. ولا تتكرر. كل فستان في هذا الخط قطعة فريدة، وحين يجد صاحبته يختفي إلى الأبد.'}});

/* ---- The Courtyard: autumn/winter 2026 campaign (prices are placeholders, editable in the control room) ---- */
STYLES.splice(1, 0, {id:'abayas', en:'Abayas', ar:'عبايات'});
STYLES.splice(2, 0, {id:'kaftans', en:'Kaftans', ar:'قفاطين'}, {id:'jalabiyas', en:'Jalabiyas', ar:'جلابيات'}, {id:'girls', en:'Girls', ar:'البنات'});
STYLE_INFO.kaftans = {title:{en:'Kaftans',ar:'قفاطين'}, intro:{en:'Flowing kaftans in soft fabrics, made for gatherings, Ramadan evenings and easy days at home.',ar:'قفاطين انسيابية بأقمشة ناعمة، للتجمعات وأمسيات رمضان والأيام الهادئة في المنزل.'}, imgs:['img/e/e7_01.jpg']};
STYLE_INFO.jalabiyas = {title:{en:'Jalabiyas',ar:'جلابيات'}, intro:{en:'Traditional jalabiyas with a modern cut and quiet detail, for Eid, Ramadan and family occasions.',ar:'جلابيات تقليدية بقصّة عصرية وتفاصيل هادئة، للعيد ورمضان والمناسبات العائلية.'}, imgs:['img/e/e4_01.jpg']};
STYLE_INFO.girls = {title:{en:'Girls',ar:'البنات'}, intro:{en:'Modest dresses and abayas for girls, cut to order in her size so mother and daughter can match.',ar:'فساتين وعبايات محتشمة للبنات، تُفصَّل حسب مقاسها لتتناسق الأم مع ابنتها.'}, imgs:['img/e/e5_01.jpg']};
STYLE_INFO.abayas = {title:{en:'Abayas',ar:'عبايات'}, intro:{en:'Open and closed abayas with quiet detail: satin lapels, fine piping and hand-placed embroidery.',ar:'عبايات مفتوحة ومغلقة بتفاصيل هادئة: ياقات من الساتان، وحواف رفيعة، وتطريز يدوي.'}};
COLLECTIONS.splice(1, 0, {id:'courtyard', season:{en:'Autumn/Winter 2026',ar:'خريف وشتاء ٢٠٢٦'}, cover:'img/c/c06-w.jpg', small:'img/c/c13.jpg', tone:'#D9B8A6',
  name:{en:'The Courtyard',ar:'الفناء'},
  story:{en:'Shot between terracotta walls in the last hour of light. Abayas with quiet, considered detail: satin lapels, copper piping and black-on-black embroidery.',ar:'صُوّرت بين جدران التيراكوتا في آخر ساعات الضوء. عبايات بتفاصيل هادئة ومدروسة: ياقات من الساتان، وحواف نحاسية، وتطريز أسود على أسود.'},
  specs:[]});
var COURTYARD = [
  {code:'C01', col:'courtyard', style:'abayas', isNew:false, tone:'#2A2523', price:780, name:{en:'Noor Satin Lapel Abaya',ar:'عباية نور بياقة ساتان'}, imgs:['img/c/c04.jpg','img/c/c05.jpg','img/c/c02.jpg'],
    desc:{en:'An open black abaya with a wide satin shawl lapel and layered cuffs.',ar:'عباية سوداء مفتوحة بياقة ساتان عريضة وأساور بطبقتين.'},
    story:{en:'One line of satin, from collar to hem, catches the light as you move. Everything else is kept quiet.',ar:'خط واحد من الساتان، من الياقة إلى الأطراف، يلتقط الضوء مع حركتك. وكل ما عداه هادئ.'}},
  {code:'C02', col:'courtyard', style:'abayas', isNew:false, tone:'#2A2523', price:850, name:{en:'Sahar Embroidered Abaya',ar:'عباية سحر المطرّزة'}, imgs:['img/c/c13.jpg','img/c/c11.jpg','img/c/c07.jpg'],
    desc:{en:'A black abaya with a tonal embroidered panel down the front and embroidered cuffs.',ar:'عباية سوداء بشريط تطريز بنفس اللون في الأمام وأساور مطرّزة.'},
    story:{en:'The embroidery is black on black, so it only shows up close. A detail for you, not for the room.',ar:'التطريز أسود على أسود، فلا يظهر إلا عن قرب. تفصيلة لكِ أنتِ، لا للآخرين.'}},
  {code:'C03', col:'courtyard', style:'abayas', isNew:false, tone:'#2A2523', price:820, name:{en:'Maghrib Piped Abaya',ar:'عباية مغرب'}, imgs:['img/c/c06.jpg','img/c/c08.jpg'],
    desc:{en:'A flowing black abaya edged with fine copper piping along the front and sleeves.',ar:'عباية سوداء واسعة بحواف نحاسية رفيعة في الأمام وعلى الأكمام.'},
    story:{en:'Named for the hour the courtyard turns copper. The piping picks up that light and keeps it.',ar:'سُمّيت على الساعة التي يتحوّل فيها الفناء إلى النحاسي. تلتقط الحواف ذلك الضوء وتحتفظ به.'}},
  {code:'C04', col:'courtyard', style:'abayas', isNew:false, tone:'#2A2523', price:690, name:{en:'Fina Open Abaya',ar:'عباية فناء المفتوحة'}, imgs:['img/c/c12.jpg','img/c/c03.jpg'],
    desc:{en:'A clean, open abaya with wide sleeves and a soft drape. The everyday essential.',ar:'عباية مفتوحة بسيطة بأكمام واسعة وانسدالة ناعمة. أساسية لكل يوم.'},
    story:{en:'The abaya you reach for every morning: light, easy and cut to fall straight from the shoulder.',ar:'العباية التي ترتدينها كل صباح: خفيفة، ومريحة، ومفصّلة لتنسدل مستقيمة من الكتف.'}},
  {code:'C06', col:'courtyard', style:'abayas', isNew:false, tone:'#4A3A4E', price:760, name:{en:'Lavender Panel Abaya',ar:'عباية اللافندر'}, imgs:['img/c/c01.jpg'],
    desc:{en:'A closed abaya in two shades of violet, with patterned panels on the sleeves.',ar:'عباية مغلقة بدرجتين من البنفسجي، ونقوش منسوجة على الأكمام.'},
    story:{en:'Colour, kept soft. Two violets meet at the sleeve, where a woven pattern sits like a quiet signature.',ar:'لون، لكن بهدوء. درجتان من البنفسجي تلتقيان عند الكم، حيث نقشة منسوجة كتوقيع هادئ.'}},
  {code:'C07', col:'courtyard', style:'abayas', isNew:false, tone:'#D9D2C2', price:740, name:{en:'Zeitoun Abaya',ar:'عباية زيتون'}, imgs:['img/c/c09.jpg'],
    desc:{en:'An olive abaya with a matching sheer shayla and fine tonal embroidery.',ar:'عباية زيتونية بشيلة شفافة من نفس اللون وتطريز رفيع بنفس الدرجة.'},
    story:{en:'The green of olive leaves in a white courtyard. Light, layered and made to be worn all day.',ar:'أخضر ورق الزيتون في فناء أبيض. خفيفة، بطبقات، ومصمّمة لتُلبس طوال اليوم.'}}
];
/* ---- The Editorial: N°1 to N°8 (prices are placeholders, edit them in the control room) ---- */
COLLECTIONS.splice(1, 0, {id:'editorial', season:{en:'Winter 2026',ar:'شتاء ٢٠٢٦'}, cover:'img/e/e8_03-w.jpg', small:'img/e/e1_01.jpg', tone:'#ECE7E1',
  name:{en:'The Editorial',ar:'The Editorial'},
  story:{en:'Eight pieces, shot in a quiet white atelier of arches and light. Deep colour, soft texture and clean lines, from the abaya you live in to the dress you save for later.',ar:'ثماني قطع صُوّرت في مشغل أبيض هادئ من الأقواس والضوء. ألوان عميقة، وملمس ناعم، وخطوط نظيفة، من العباية التي ترافقك كل يوم إلى الفستان الذي تحتفظين به للمناسبات.'},
  specs:[]});
var EDITORIAL = [
  {code:'E01', col:'editorial', style:'abayas', isNew:true, no:'01', tone:'#ECE7E1', price:890, name:{en:'Quiet Majesty',ar:'Quiet Majesty'}, imgs:['img/e/e1_01.jpg','img/e/e1_02.jpg','img/e/e1_03.jpg','img/e/e1_04.jpg','img/e/e1_05.jpg','img/e/e1_06.jpg'],
    desc:{en:'An open plum abaya with long straight sleeves, worn over a soft ivory inner dress.',ar:'عباية مفتوحة بلون البرقوق بأكمام طويلة مستقيمة، تُلبس فوق فستان داخلي بلون العاج.'},
    story:{en:'Rich in colour, effortless in form. A deep plum that feels regal without trying, cut to fall in one clean line from the shoulder.',ar:'غنية باللون، سهلة في القصّة. لون برقوقي عميق يمنحك حضورًا ملكيًا بلا تكلّف، ومفصّلة لتنسدل في خط واحد نظيف من الكتف.'}},
  {code:'E02', col:'editorial', style:'abayas', isNew:true, no:'02', tone:'#ECE7E1', price:850, name:{en:'Midnight Line',ar:'Midnight Line'}, imgs:['img/e/e2_01.jpg','img/e/e2_02.jpg','img/e/e2_03.jpg','img/e/e2_04.jpg'],
    desc:{en:'A midnight navy open abaya with a collarless neckline, layered over an ivory inner dress.',ar:'عباية مفتوحة بلون الكحلي الليلي بدون ياقة، تُلبس فوق فستان داخلي بلون العاج.'},
    story:{en:'Clean lines, lasting presence. The contrast of navy and ivory does all the work, so nothing else has to.',ar:'خطوط نظيفة وحضور يدوم. التباين بين الكحلي والعاجي يقول كل شيء، فلا حاجة لأي إضافة.'}},
  {code:'E03', col:'editorial', style:'abayas', isNew:true, no:'03', tone:'#ECE7E1', price:980, name:{en:'Lace & Shadow',ar:'Lace & Shadow'}, imgs:['img/e/e3_01.jpg','img/e/e3_02.jpg','img/e/e3_03.jpg','img/e/e3_04.jpg'],
    desc:{en:'A black abaya with ivory floral lace at the neckline, the cuffs and the hem.',ar:'عباية سوداء بدانتيل زهري بلون العاج عند الرقبة والأساور والأطراف.'},
    story:{en:'Timeless black, delicately adorned. The lace frames the face and the hands, and finishes the hem like a quiet signature.',ar:'أسود خالد بزينة رقيقة. يحيط الدانتيل بالوجه واليدين، ويُكمل الأطراف كتوقيع هادئ.'}},
  {code:'E04', col:'editorial', style:'abayas', isNew:true, no:'04', tone:'#ECE7E1', price:820, name:{en:'Sage Serenity',ar:'Sage Serenity'}, imgs:['img/e/e4_01.jpg','img/e/e4_02p.jpg','img/e/e4_03.jpg','img/e/e4_04.jpg','img/e/e4_05.jpg'],
    desc:{en:'A textured sage abaya with long sleeves, worn open over a matching inner dress.',ar:'عباية بلون المريمية بملمس ناعم وأكمام طويلة، تُلبس مفتوحة فوق فستان داخلي من نفس اللون.'},
    story:{en:'Soft texture, natural calm. A muted green that sits easily with every day, and a fabric you want to touch.',ar:'ملمس ناعم وهدوء طبيعي. أخضر هادئ يناسب كل يوم، وقماش تحبين لمسه.'}},
  {code:'E05', col:'editorial', style:'everyday', isNew:true, no:'05', tone:'#ECE7E1', price:590, name:{en:'Linen Breeze',ar:'Linen Breeze'}, imgs:['img/e/e5_01.jpg','img/e/e5_03.jpg','img/e/e5_02.jpg','img/e/e5_04.jpg','img/e/e5_05.jpg','img/e/e5_06.jpg','img/e/e5_07.jpg'],
    desc:{en:'A light aqua linen-look midi dress with short sleeves, a gathered waist and a tie belt.',ar:'فستان ميدي بلون الأكوا بملمس الكتان، بأكمام قصيرة وخصر مجمّع وحزام للربط.'},
    story:{en:'Light linen, easy grace. Made for warm days: it breathes, it moves, and it ties in at the waist exactly where you want it.',ar:'كتان خفيف وأناقة سهلة. صُنع للأيام الدافئة: يتنفس، ويتحرك، ويُربط عند الخصر حيث تريدين تمامًا.'}},
  {code:'E06', col:'editorial', style:'everyday', isNew:true, no:'06', tone:'#ECE7E1', price:650, name:{en:'Indigo Wrap',ar:'Indigo Wrap'}, imgs:['img/e/e6_01.jpg','img/e/e6_02.jpg'],
    desc:{en:'An indigo wrap dress with a V neckline, full sleeves gathered at the cuff and a side tie.',ar:'فستان ملفوف بلون النيلي برقبة على شكل V، وأكمام واسعة مجمّعة عند الرسغ، ورباط جانبي.'},
    story:{en:'Wrapped in quiet confidence. A deep indigo that works from a morning meeting to a dinner out.',ar:'ملفوف بثقة هادئة. نيلي عميق يناسبك من اجتماع الصباح إلى عشاء المساء.'}},
  {code:'E07', col:'editorial', style:'evening', isNew:true, no:'07', tone:'#ECE7E1', price:690, name:{en:'Pleated Mist',ar:'Pleated Mist'}, imgs:['img/e/e7_01.jpg','img/e/e7_02.jpg','img/e/e7_03.jpg'],
    desc:{en:'A misty lilac pleated dress with flutter sleeves, a tie waist and an asymmetric hem.',ar:'فستان بلون الليلكي الضبابي بطيّات، وأكمام متطايرة، وخصر للربط، وأطراف غير متماثلة.'},
    story:{en:'Soft pleats, graceful movement. The hem dips and lifts as you walk, so the dress never stands still.',ar:'طيّات ناعمة وحركة رشيقة. ترتفع الأطراف وتنخفض مع خطواتك، فلا يبقى الفستان ساكنًا أبدًا.'}},
  {code:'E08', col:'editorial', style:'everyday', isNew:true, no:'08', tone:'#ECE7E1', price:720, name:{en:'Blush Texture',ar:'Blush Texture'}, imgs:['img/e/e8_01.jpg','img/e/e8_03p.jpg','img/e/e8_04p.jpg','img/e/e8_05p.jpg','img/e/e8_02p.jpg','img/e/e8_06.jpg'],
    desc:{en:'A blush two-piece in a crinkled texture: a high-neck blouse with full sleeves and a long straight skirt with a wide waistband.',ar:'طقم من قطعتين بلون الوردي الفاتح وملمس مجعّد: بلوزة برقبة عالية وأكمام واسعة، وتنورة طويلة مستقيمة بحزام عريض.'},
    story:{en:'Soft texture, refined lines. Wear it as a set, or split it and pair each piece with what you already love.',ar:'ملمس ناعم وخطوط راقية. ارتديه طقمًا كاملًا، أو افصلي القطعتين ونسّقي كلًا منهما مع ما تحبينه.'}}
];
PRODUCTS = EDITORIAL.concat(COURTYARD, PRODUCTS);
/* old pieces taken off the site: anything still saved for these codes in the database is ignored */
var RETIRED = ['B01','B02','B03','D01','D02','D03','S01','S02','N01','N04','N06','N07','N08','N09','C05','C08','C09','C10','C11','O01','O02','O03','O04'];

/* home hero (default). The control room can replace it: settings/site.slides */
var SLIDES = [
  {d:'img/e/e8_03-w.jpg', m:'img/e/e8_01.jpg', pos:'50% 40%', sub:{en:'Winter 2026',ar:'شتاء ٢٠٢٦'}, big:{en:'The Editorial',ar:'The Editorial'}, href:'#editorial', cta:{en:'Discover the collection',ar:'اكتشفي المجموعة'}},
  {d:'img/e/e4_02-w.jpg', m:'img/e/e4_01.jpg', pos:'50% 35%', sub:{en:'N°04',ar:'N°04'}, big:{en:'Sage Serenity',ar:'Sage Serenity'}, href:'#p-E04', cta:{en:'Shop the abaya',ar:'تسوّقي العباية'}},
  {type:'video', v:'video/behind-the-scenes.mp4', d:'video/behind-the-scenes.jpg', m:'video/behind-the-scenes.jpg', pos:'50% 50%', sub:{en:'Behind the scenes',ar:'خلف الكواليس'}, big:{en:'The making of The Courtyard',ar:'كيف صُنعت The Courtyard'}, href:'#courtyard', cta:{en:'Discover the collection',ar:'اكتشفي المجموعة'}},
  {d:'img/e/e8_04-w.jpg', m:'img/e/e8_04p.jpg', pos:'50% 30%', sub:{en:'N°08',ar:'N°08'}, big:{en:'Blush Texture',ar:'Blush Texture'}, href:'#p-E08', cta:{en:'Shop the set',ar:'تسوّقي الطقم'}},
  {d:'img/c/c06-w.jpg', m:'img/c/c06.jpg', pos:'50% 35%', sub:{en:'The abaya edit',ar:'مختارات العبايات'}, big:{en:'The Courtyard',ar:'The Courtyard'}, href:'#courtyard', cta:{en:'Shop abayas',ar:'تسوّقي العبايات'}}
];