# موقع NMH: تشغيله أونلاين على Firebase

الفولدر ده فيه الموقع جاهز للرفع، ومعاه:
- الدخول بجوجل أو بالإيميل
- حسابات حقيقية
- طلبات بتتحفظ في قاعدة بيانات

كله على خطة Firebase المجانية (Spark)، ومش محتاج كارت.

```
public/              ← الموقع نفسه (index.html + الصور + الخطوط)
public/firebase-config.js   ← هنا هتحط بيانات مشروعك (خطوة 2)
firebase.json        ← إعدادات الاستضافة
.firebaserc          ← اسم المشروع (nmhdubai)
firestore.rules      ← قواعد الأمان للحسابات والطلبات
```

---

## 1. اعمل المشروع باسم من غير أرقام

1. افتح https://console.firebase.google.com واضغط **Create a project**.
2. اكتب الاسم: `NMH Dubai`.
3. تحت الاسم، Firebase هيقترح Project ID فيه أرقام زي `nmh-dubai-3f9a1`. اضغط على القلم جنبه واكتب **`nmhdubai`**.
   - اللينك هيبقى **https://nmh-dubai.web.app**.
   - الـ ID لازم يكون من 6 لـ 30 حرف: حروف صغيرة وأرقام وشرطة (-) بس. علشان كده `nmh` لوحدها مش هتنفع لأنها 3 حروف.
   - لو `nmhdubai` محجوز جرّب بالترتيب: `bynmh-dubai`، `nmh-atelier`، `nmhdubai-store`.
   - لو اخترت اسم تاني، افتح `.firebaserc` وغيّر `nmhdubai` للاسم الجديد.
4. اقفل Google Analytics، الموقع مش محتاجه.

## 2. اربط الموقع بالمشروع

1. من الترس ⚙️ ادخل **Project settings**، وانزل لـ **Your apps**، واضغط أيقونة الويب `</>`.
2. سمّي التطبيق `NMH site` واضغط **Register app**.
3. هيظهرلك كود فيه `firebaseConfig`. انسخ القيم دي (apiKey، authDomain، projectId، storageBucket، messagingSenderId، appId) وحطها في `public/firebase-config.js` مكان الفاضي بين علامات التنصيص.

## 3. شغّل تسجيل الدخول

1. من القايمة: **Build > Authentication > Get started**.
2. في **Sign-in method**:
   - فعّل **Google** واختار إيميل الدعم، واضغط Save.
   - فعّل **Email/Password**، واضغط Save.
3. في **Settings > Authorized domains** هتلاقي `nmh-dubai.web.app` و`nmh-dubai.firebaseapp.com` موجودين. أي دومين تاني هترفع عليه لازم تضيفه هنا، وإلا زرار جوجل مش هيشتغل عليه.

## 4. اعمل قاعدة البيانات

1. **Build > Firestore Database > Create database**.
2. اختار **Production mode**.
3. اختار أقرب Location: `me-central1 (Doha)` لو موجودة، وإلا `europe-west1`. الاختيار ده مش بيتغير بعدين.

## 5. ارفع الموقع (مرة واحدة بس من الماك)

افتح Terminal واكتب:

```bash
npm install -g firebase-tools        # لو مش متسطّب (محتاج Node من nodejs.org)
firebase login
cd ~/Downloads/nmh-firebase          # مكان الفولدر عندك
firebase deploy
```

لما يخلص هيكتبلك `Hosting URL: https://nmh-dubai.web.app` والموقع يبقى أونلاين. أي تعديل بعد كده ترفعه بـ `firebase deploy` تاني.

---

## الطلبات بتروح فين؟

في **Firestore Database > orders**. كل طلب فيه:
- رقمه (زي `NMH-K3F9A2X`)
- بيانات العميلة
- القطع واللون والمقاس
- المقاسات لو كانت تفصيل
- الإجمالي

العميلة كمان بتشوف طلباتها في حسابها على الموقع.

قواعد الأمان (`firestore.rules`):
- كل عميلة تقرا وتعدّل بياناتها هي بس.
- أي حد يقدر يعمل طلب، حتى من غير حساب.
- محدش يقدر يعدّل أو يمسح طلب من الموقع. إنتو بس من الكونسول.

## بديل Cloudflare (لو حبيت)

1. Cloudflare Dashboard > **Workers & Pages > Create > Pages > Upload assets**.
2. ارفع فولدر `public` بس، واكتب اسم المشروع `nmh-dubai`. اللينك هيبقى `nmh-dubai.pages.dev`.
3. Firebase لسه هو اللي ماسك الحسابات والطلبات، فلازم:
   - تضيف `nmh-dubai.pages.dev` في Authorized domains (خطوة 3).
   - ترفع قواعد الأمان بـ `firebase deploy --only firestore:rules`، أو تنسخ `firestore.rules` في تبويب Rules في Firestore.

## دومين خاص (اختياري)

لو اشتريتوا دومين زي `bynmh.com`:
1. **Hosting > Add custom domain** وحط الـ DNS records اللي هيدّيهالك.
2. ضيف الدومين في Authorized domains.

## الخطة المجانية

خطة Spark كفاية للبداية:
- الاستضافة: حوالي 10GB تخزين و360MB نقل في اليوم.
- Firestore: 50 ألف قراءة و20 ألف كتابة في اليوم.

التفاصيل: https://firebase.google.com/pricing

## مش موجود لسه (خطوات جاية)

- **لوحة تحكم للبراند** تشوف فيها الطلبات وتغيّر حالتها (اتأكد، بيتفصّل، اتشحن). دلوقتي ده من الكونسول.
- **إشعار بطلب جديد** على الإيميل أو واتساب.
- **دفع أونلاين** (Tap / Stripe / Telr). ده محتاج كود على السيرفر، يعني Cloud Functions على خطة Blaze بالدفع حسب الاستخدام، أو Cloudflare Workers المجانية.

## قبل الإطلاق الرسمي

- رخصة ويب للخطوط: Effra وMuna وFieldwork.
- الأسعار الحقيقية بدل المؤقتة، وتفاصيل القماش والعناية بدل الأقواس `[ ]`.
- صفحة سياسة خصوصية، لأن الموقع بيجمع أسماء وأرقام وعناوين.
