import re,sys,os,json,html as H
P=os.path.join(os.path.dirname(os.path.abspath(__file__)),'parts')+'/'
rd=lambda f: open(P+f).read()
css=rd('style.css'); body=rd('body.html'); app=rd('app.js'); data=rd('data.js')
app=app.replace('/*@@DATA@@*/',data)
page=rd('head.html')+css+'</style>\n</head>\n<body>\n'+body+'<script src="firebase-config.js"></script>\n<script>\n'+app+'</script>\n</body>\n</html>\n'
open(sys.argv[1],'w').write(page); print(len(page))
# texts for the control room "Site texts" page
G={'homeSections':'Home page','viewHome':'Home page','viewProduct':'Product page','sizeChartHTML':'Product page','variant':'Product page','paintPP':'Product page','shadeName':'Product page','sizeName':'Product page','addToCart':'Cart','renderDrawer':'Cart','drwOpen':'Cart','pruneSold':'Cart','updateCount':'Cart',
 'viewCheckout':'Checkout','checkField':'Checkout','summaryHTML':'Checkout','coTotals':'Checkout','placeOrder':'Checkout','regionField':'Checkout','coShell':'Checkout','viewOrder':'Order confirmation',
 'viewOne':'The One page','viewStyle':'Shop and collections','sortSel':'Shop and collections','card':'Shop and collections','soldText':'Shop and collections','runSearch':'Menu, search and footer','renderSide':'Menu, search and footer','applyLang':'Menu, search and footer','applyThemeLabel':'Menu, search and footer','titleFor':'Menu, search and footer','viewPage':'Menu, search and footer'}
rx=re.compile(r"tr\('((?:[^'\\]|\\.)*)',\s*'((?:[^'\\]|\\.)*)'\)")
fns=[(m.start(),m.group(1)) for m in re.finditer(r"function (\w+)\(",app)]
seen={}; TX=[]
un=lambda s: s.replace("\\'","'")
for m in rx.finditer(app):
    en,ar=un(m.group(1)),un(m.group(2))
    if len(en.strip())<2 or en in seen: continue
    f=[n for p,n in fns if p<m.start()]; seen[en]=1; TX.append([en,ar,G.get(f[-1] if f else '','Messages')])
for m in re.finditer(r'<(\w+)([^>]*?)data-ar="([^"]*)"([^>]*)>(.*?)</\1>',body):
    if 'id="ann"' in m.group(2)+m.group(4): continue
    en=H.unescape(re.sub(r'\s+',' ',re.sub('<[^>]+>','',m.group(5))).strip()); ar=H.unescape(m.group(3))
    if len(en)<2 or en in seen: continue
    seen[en]=1; TX.append([en,ar,'Menu, search and footer'])
for m in re.finditer(r'placeholder="([^"]+)" data-ph-ar="([^"]+)"',body):
    if m.group(1) not in seen: seen[m.group(1)]=1; TX.append([m.group(1),m.group(2),'Menu, search and footer'])
PG=re.search(r"var PAGES = \{.*?\n\};",app,re.S).group(0)
textsjs='var TEXTS = '+json.dumps(TX,ensure_ascii=False)+';\n'+PG.replace('var PAGES','var SITE_PAGES')
cj=rd('control.js').replace('/*@@DATA@@*/', data+'\n'+textsjs)
ctl=rd('control-head.html')+rd('control.css')+'</style>\n</head>\n<body>\n'+rd('control-body.html')+'<script src="firebase-config.js"></script>\n<script>\n'+cj+'</script>\n</body>\n</html>\n'
open(os.path.join(os.path.dirname(sys.argv[1]),'control.html'),'w').write(ctl)
