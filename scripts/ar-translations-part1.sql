-- =================================================================
-- Arabic (AR) translations — Posts 1-11 of 33
-- Run AFTER scripts/step1-fix-constraint.sql
-- Idempotent via ON CONFLICT (slug, language) DO UPDATE
-- =================================================================

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'welcome-to-calorievision',
'مرحباً بك في CalorieVision',
'اكتشف CalorieVision — أداة الذكاء الاصطناعي التي تحلل صور طعامك وتمنحك قيماً غذائية دقيقة في ثوانٍ ومجاناً.',
'https://calorievision.online/favicon.png',
$content$<div><h2>مرحباً بك في CalorieVision</h2>
<p>يسعدنا ترحيبك في CalorieVision — التطبيق الذكي الذي يُحوّل تتبع التغذية من مهمة مرهقة إلى تجربة سهلة وممتعة. ما عليك سوى التقاط صورة لوجبتك وسيتولى الذكاء الاصطناعي تحليلها فوراً.</p>
<hr>
<h2>ما الذي يقدمه CalorieVision؟</h2>
<p>يستخدم CalorieVision أحدث تقنيات الذكاء الاصطناعي للتعرف على الأطعمة من الصور وحساب قيمها الغذائية في ثوانٍ:</p>
<ul>
<li><strong>السعرات الحرارية</strong> الإجمالية للوجبة</li>
<li><strong>البروتين والكربوهيدرات والدهون</strong> بدقة عالية</li>
<li><strong>الألياف والمعادن والفيتامينات</strong> الأساسية</li>
</ul>
<hr>
<h2>لمن صُمِّم CalorieVision؟</h2>
<p>سواء كنت تسعى لفقدان الوزن أو بناء العضلات أو الحفاظ على صحة جيدة، CalorieVision يناسبك. لا خبرة غذائية مطلوبة — فقط صوّر وجبتك واحصل على إجاباتك.</p>
<hr>
<h2>ابدأ مجاناً اليوم</h2>
<p>انضم إلى مجتمعنا المتنامي واستكشف كيف يمكن لصورة واحدة أن تغير علاقتك بالطعام. <strong>جرّب CalorieVision مجاناً</strong> ولا تدع أي وجبة تمر دون أن تعرف قيمتها الغذائية.</p></div>$content$,
'published',true,'ar','2026-01-01T00:00:00.000+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'5-simple-tips-to-track-your-daily-calories',
'٥ نصائح بسيطة لتتبع سعراتك اليومية',
'تعلّم ٥ أساليب عملية وسهلة لحساب وتتبع سعراتك الحرارية كل يوم وحقّق أهدافك الغذائية بثقة.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1767465138035.webp',
$content$<div><h2>٥ نصائح بسيطة لتتبع سعراتك اليومية</h2>
<p>تتبع السعرات الحرارية لا يجب أن يكون أمراً معقداً. مع الأدوات الصحيحة والمنهج الصحيح يمكنك بناء عادة بسيطة تُساعدك على تحقيق أهدافك الصحية.</p>
<hr>
<h2>١. صوّر وجباتك</h2>
<p>بدلاً من البحث اليدوي عن كل مكوّن، التقط صورة لوجبتك. تطبيقات مثل CalorieVision تحلل الصورة وتعطيك القيم الغذائية فوراً دون جهد.</p>
<hr>
<h2>٢. سجّل كل ما تأكله</h2>
<p>الوجبات الصغيرة والوجبات الخفيفة تتراكم سعراتها بسرعة. سجّل كل ما تأكله بصدق، بما في ذلك القهوة المحلاة والمكسرات والعصائر.</p>
<hr>
<h2>٣. تعلّم حجم الحصة المعيارية</h2>
<p>كثير من الناس يُخطئون في تقدير الكميات. ملعقتان من زيت الزيتون مثلاً تحتويان على ٢٣٨ سعرة — أكثر مما يتوقعه معظم الناس. استخدم ميزاناً رقمياً في البداية حتى تُدرّب عينك.</p>
<hr>
<h2>٤. خطط مسبقاً</h2>
<p>التخطيط لوجباتك مسبقاً يُمكّنك من التحكم في إجمالي سعراتك اليومية. اعرف ما ستأكله قبل أن تُحضّره، وليس بعد أن تنتهي منه.</p>
<hr>
<h2>٥. كن ثابتاً لا مثالياً</h2>
<p>لا بأس بيوم ينحرف عن الهدف. المهم هو الاتساق على مدى الأسابيع والأشهر. التتبع المنتظم — حتى غير الكامل — أفضل بكثير من لا تتبع على الإطلاق.</p>
<hr>
<h2>ابدأ اليوم مع CalorieVision</h2>
<p>اجعل التتبع أسهل ما يكون. <strong>CalorieVision</strong> يحلل صور وجباتك ويعطيك سعراتها في ثوانٍ. <strong>جرّبه مجاناً</strong> وطبّق هذه النصائح من اليوم.</p></div>$content$,
'published',true,'ar','2025-12-29T12:14:22.748146+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'almond-calories-complete-guide',
'دليلك الشامل لسعرات اللوز الحرارية',
'اكتشف عدد السعرات الحرارية في اللوز النيء والمحمص والمُملّح مع نصائح للحصص وفوائد غذائية مهمة.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/featured-1768437810307.webp',
$content$<div><h2>دليلك الشامل لسعرات اللوز الحرارية</h2>
<p>اللوز من أكثر المكسرات شيوعاً واستهلاكاً حول العالم، وهو غني بالعناصر الغذائية المفيدة لكنه يحمل سعرات حرارية يُستحسن معرفتها.</p>
<hr>
<h2>الأرقام الأساسية</h2>
<p><strong>٢٣ حبة لوز (حوالي ٢٨ غراماً)</strong> تحتوي على نحو <strong>١٦٤ سعرة حرارية</strong>، مع ٦ جرامات بروتين و١٤ جراماً دهون و٦ جرامات كربوهيدرات.</p>
<p>مئة غرام من اللوز تحتوي على نحو <strong>٥٧٩ سعرة حرارية</strong> — مما يجعله من الأطعمة العالية الكثافة الكالورية.</p>
<hr>
<h2>أنواع اللوز والفرق في السعرات</h2>
<ul>
<li><strong>اللوز النيء:</strong> ~١٦٤ سعرة / ٢٨ غ</li>
<li><strong>اللوز المحمص بدون زيت:</strong> ~١٦٩ سعرة / ٢٨ غ</li>
<li><strong>اللوز المملّح بالزيت:</strong> ~١٧٢ سعرة / ٢٨ غ</li>
<li><strong>زبدة اللوز:</strong> ~١٩٦ سعرة / ملعقتين كبيرتين</li>
</ul>
<hr>
<h2>القيمة الغذائية</h2>
<ul>
<li><strong>فيتامين E:</strong> ٧.٣ ملغ (٤٩٪ من الاحتياج اليومي)</li>
<li><strong>المغنيسيوم:</strong> ٧٦ ملغ (١٨٪ من الاحتياج)</li>
<li><strong>الألياف:</strong> ٣.٥ غ لكل ٢٨ غ</li>
<li><strong>الدهون الصحية:</strong> ٨٠٪ أحادية وثنائية غير مشبعة</li>
</ul>
<hr>
<h2>هل اللوز مفيد لفقدان الوزن؟</h2>
<p>نعم، عند تناوله بكميات معقولة. الدهون الصحية والبروتين والألياف يُعززان الشعور بالشبع. لكن قِس حصتك دائماً — فمن السهل تناول كميات زائدة.</p>
<hr>
<h2>تتبع سعرات اللوز مع CalorieVision</h2>
<p>صوّر وجبتك من اللوز واحصل على تحليل غذائي دقيق فوراً. <strong>جرّب CalorieVision مجاناً</strong> وتحكّم في حصصك بسهولة.</p></div>$content$,
'published',true,'ar','2026-01-15T00:44:50.332+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'avocado-calories-complete-guide',
'دليلك الشامل لسعرات الأفوكادو الحرارية',
'تعرف على عدد السعرات في نصف أفوكادو وحبة كاملة والأفوكادو المهروس مع فوائده الغذائية الرائعة.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1768046285770.webp',
$content$<div><h2>دليلك الشامل لسعرات الأفوكادو الحرارية</h2>
<p>الأفوكادو فاكهة استثنائية غنية بالدهون الصحية والعناصر الغذائية. لكن حجمه يخدع كثيرين — ففيه سعرات أكثر مما يظن معظم الناس.</p>
<hr>
<h2>كم سعرة في الأفوكادو؟</h2>
<ul>
<li><strong>نصف أفوكادو متوسط (~١٠٠ غ):</strong> ~١٦٠ سعرة</li>
<li><strong>حبة أفوكادو كاملة (~٢٠٠ غ):</strong> ~٣٢٠ سعرة</li>
<li><strong>ملعقة كبيرة مهروس (~١٥ غ):</strong> ~٢٤ سعرة</li>
<li><strong>١٠٠ غرام:</strong> ~١٦٠ سعرة</li>
</ul>
<hr>
<h2>لماذا الأفوكادو غني بالسعرات؟</h2>
<p>يتكون الأفوكادو من نحو ١٥٪ دهون — وهي دهون أحادية غير مشبعة صحية جداً للقلب. الدهون تحتوي على ضعف سعرات البروتين والكربوهيدرات.</p>
<hr>
<h2>القيمة الغذائية لنصف أفوكادو</h2>
<ul>
<li><strong>البوتاسيوم:</strong> ٤٨٧ ملغ — أكثر من الموزة</li>
<li><strong>الألياف:</strong> ٦.٧ غ (٢٧٪ من الاحتياج اليومي)</li>
<li><strong>فيتامين K وفيتامين E والفولات</strong></li>
<li><strong>دهون أحادية غير مشبعة:</strong> مفيدة للقلب والكوليسترول</li>
</ul>
<hr>
<h2>نصائح عملية</h2>
<p>الأفوكادو مثالي لإضافة الدهون الصحية للسلطات والتوست. نصف حبة تكفي كحصة واحدة. تجنّب إضافة كميات كبيرة دون حساب سعراتها.</p>
<hr>
<h2>تتبع الأفوكادو مع CalorieVision</h2>
<p>التقط صورة لطبقك وسيحدد <strong>CalorieVision</strong> كمية الأفوكادو وسعراته تلقائياً. <strong>جرّبه مجاناً</strong> الآن.</p></div>$content$,
'published',true,'ar','2026-01-10T12:01:08.616+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'beet-calories-complete-nutrition-guide',
'دليل شامل للسعرات الحرارية والقيمة الغذائية للشمندر',
'اكتشف سعرات الشمندر الحرارية — الطازج والمطبوخ والعصير — وكيف يدعم الأداء الرياضي وصحة القلب.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1768079073952.webp',
$content$<div><h2>دليل شامل للسعرات الحرارية والقيمة الغذائية للشمندر</h2>
<p>الشمندر (البنجر) خضروات جذرية بلون بنفسجي مميز، منخفضة السعرات وغنية بالمغذيات. يُعتبر من أفضل الخيارات لمن يراقب وزنه.</p>
<hr>
<h2>كم سعرة في الشمندر؟</h2>
<ul>
<li><strong>شمندرة متوسطة طازجة (~٨٢ غ):</strong> ~٣٥ سعرة</li>
<li><strong>١٠٠ غ شمندر نيء:</strong> ~٤٣ سعرة</li>
<li><strong>١٠٠ غ شمندر مطبوخ:</strong> ~٤٤ سعرة</li>
<li><strong>كوب عصير شمندر (٢٤٠ مل):</strong> ~١١٠ سعرة</li>
</ul>
<hr>
<h2>القيمة الغذائية</h2>
<ul>
<li><strong>الفولات:</strong> ١٤٨ مكغ (٣٧٪ من الاحتياج) — مهم لصحة الخلايا</li>
<li><strong>النترات الطبيعية:</strong> تُحسّن تدفق الدم والأداء الرياضي</li>
<li><strong>البوتاسيوم والمغنيسيوم والمنغنيز</strong></li>
<li><strong>الألياف:</strong> ٢.٨ غ لكل ١٠٠ غ</li>
</ul>
<hr>
<h2>الشمندر والأداء الرياضي</h2>
<p>النترات في الشمندر تتحول إلى أكسيد النيتريك الذي يُوسّع الأوعية الدموية ويُحسّن توصيل الأكسجين للعضلات. تشير الدراسات إلى تحسن ملحوظ في الأداء الرياضي عند تناول عصير الشمندر قبل التمرين.</p>
<hr>
<h2>تتبع الشمندر مع CalorieVision</h2>
<p>صوّر طبق الشمندر وسيحلّله <strong>CalorieVision</strong> فوراً. <strong>جرّبه مجاناً</strong> اليوم.</p></div>$content$,
'published',true,'ar','2026-01-10T14:02:19.483+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'broccoli-calories-complete-guide',
'دليلك الشامل لسعرات البروكلي الحرارية',
'اكتشف سعرات البروكلي الحرارية نيئاً ومطبوخاً ومطهواً بالبخار وتعرّف على فوائده الغذائية الهائلة.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1768308409227.webp',
$content$<div><h2>دليلك الشامل لسعرات البروكلي الحرارية</h2>
<p>البروكلي من أكثر الخضروات كثافةً بالمغذيات وأقلها في السعرات. يُعتبر ركيزة أساسية في الأنظمة الغذائية الصحية لقدرته على إشباع الجسم بالمغذيات دون إثقاله بالسعرات.</p>
<hr>
<h2>كم سعرة في البروكلي؟</h2>
<ul>
<li><strong>كوب بروكلي نيء مقطع (~٩١ غ):</strong> ~٣١ سعرة</li>
<li><strong>كوب بروكلي مطهو بالبخار (~١٥٦ غ):</strong> ~٥٥ سعرة</li>
<li><strong>١٠٠ غ نيء:</strong> ~٣٤ سعرة</li>
<li><strong>١٠٠ غ مطبوخ:</strong> ~٣٥ سعرة</li>
</ul>
<hr>
<h2>القيمة الغذائية</h2>
<ul>
<li><strong>فيتامين C:</strong> ٨١ ملغ (١٣٥٪ من الاحتياج اليومي) في كوب واحد</li>
<li><strong>فيتامين K:</strong> ٩٢ مكغ (١١٥٪ من الاحتياج)</li>
<li><strong>الفولات والبوتاسيوم والكروم</strong></li>
<li><strong>السلفورافان:</strong> مضاد أكسدة قوي مرتبط بالوقاية من السرطان</li>
<li><strong>الألياف:</strong> ٢.٦ غ لكل ١٠٠ غ</li>
</ul>
<hr>
<h2>أفضل طرق التحضير للحفاظ على المغذيات</h2>
<p>التبخير هو الأمثل — يحافظ على ٩٠٪ من فيتامين C مقارنة بالغلي الذي يُخسّر حتى ٥٠٪. تجنّب الإفراط في الطهي.</p>
<hr>
<h2>تتبع البروكلي مع CalorieVision</h2>
<p>صوّر طبقك واحصل على تحليل غذائي دقيق. <strong>CalorieVision مجاناً</strong> لكل وجباتك الصحية.</p></div>$content$,
'published',true,'ar','2026-01-13T12:51:00.787+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'building-sustainable-eating-habits-ai-2026',
'بناء عادات أكل مستدامة بمساعدة الذكاء الاصطناعي في ٢٠٢٦',
'تعرّف على كيفية استخدام أدوات الذكاء الاصطناعي لبناء عادات غذائية صحية ومستدامة على المدى الطويل.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1767906287679.webp',
$content$<div><h2>بناء عادات أكل مستدامة بمساعدة الذكاء الاصطناعي في ٢٠٢٦</h2>
<p>الحميات الصارمة تفشل في معظم الأحيان لأنها غير مستدامة. الحل الحقيقي هو بناء عادات غذائية يمكن الالتزام بها طويل الأمد — وهنا يلعب الذكاء الاصطناعي دوراً محورياً.</p>
<hr>
<h2>لماذا تفشل معظم الحميات؟</h2>
<p>الحميات القصيرة المدى تعتمد على الإرادة وهي محدودة. بعد انتهاء الحمية تعود معظم العادات القديمة. الهدف الحقيقي هو تغيير السلوك الغذائي بشكل جذري ومستدام.</p>
<hr>
<h2>كيف يساعد الذكاء الاصطناعي في ٢٠٢٦؟</h2>
<ul>
<li><strong>التتبع اللحظي:</strong> صوّر وجبتك واعرف قيمتها فوراً</li>
<li><strong>التحليل الشخصي:</strong> رؤى مخصصة بناءً على عاداتك</li>
<li><strong>التذكير الذكي:</strong> تنبيهات في الوقت المناسب</li>
<li><strong>التعلم من أنماطك:</strong> يتكيف مع أسلوب حياتك تدريجياً</li>
</ul>
<hr>
<h2>المبادئ الأساسية للعادات المستدامة</h2>
<p><strong>١. التدرج:</strong> ابدأ بتغيير واحد صغير كل أسبوع. <strong>٢. المرونة:</strong> لا يوجد طعام محظور تماماً — التوازن هو المفتاح. <strong>٣. التتبع المنتظم:</strong> ما يُقاس يُحسَّن. <strong>٤. الصبر:</strong> العادات تتشكل خلال ٦٦ يوماً في المتوسط.</p>
<hr>
<h2>ابدأ مع CalorieVision</h2>
<p>اجعل التتبع الغذائي عادةً يومية سهلة. <strong>CalorieVision</strong> يُحلل صور وجباتك بلا جهد. <strong>جرّبه مجاناً</strong> اليوم.</p></div>$content$,
'published',true,'ar','2025-12-30T22:23:36.517+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'cheese-calories-complete-guide',
'دليلك الشامل لسعرات الجبن الحرارية',
'اكتشف سعرات أشهر أنواع الجبن — الشيدر والموزاريلا والبري وغيرها — ونصائح لإدراجه في نظام غذائي صحي.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/featured-1768516855375.webp',
$content$<div><h2>دليلك الشامل لسعرات الجبن الحرارية</h2>
<p>الجبن من الأطعمة المحبوبة التي تُضيف نكهة ومذاقاً لا مثيل لهما، لكنه يحمل سعرات حرارية تتفاوت تفاوتاً كبيراً بين أنواعه.</p>
<hr>
<h2>سعرات أشهر أنواع الجبن (لكل ٢٨ غ)</h2>
<ul>
<li><strong>شيدر:</strong> ~١١٣ سعرة</li>
<li><strong>موزاريلا طازجة:</strong> ~٨٥ سعرة</li>
<li><strong>بري:</strong> ~٩٥ سعرة</li>
<li><strong>فيتا:</strong> ~٧٤ سعرة</li>
<li><strong>بارميزان مبشور:</strong> ~١١١ سعرة</li>
<li><strong>كوتيج تشيز (قليل الدسم):</strong> ~٢٠ سعرة</li>
</ul>
<hr>
<h2>القيمة الغذائية للجبن</h2>
<ul>
<li><strong>الكالسيوم:</strong> مصدر ممتاز لصحة العظام والأسنان</li>
<li><strong>البروتين:</strong> ٦-٨ غ لكل ٢٨ غ من معظم الأنواع</li>
<li><strong>فيتامين B12:</strong> مهم لصحة الجهاز العصبي</li>
</ul>
<hr>
<h2>نصائح لتناول الجبن باعتدال</h2>
<p>استخدم كميات صغيرة من الأنواع ذات النكهة القوية كالبارميزان لتحقيق أقصى نكهة بأقل سعرات. الكوتيج تشيز خيار ممتاز للأنظمة المنخفضة السعرات.</p>
<hr>
<h2>تتبع الجبن مع CalorieVision</h2>
<p>صوّر وجبتك واحصل على تحليل دقيق للجبن بداخلها. <strong>جرّب CalorieVision مجاناً</strong> وتعرّف على سعرات ما تأكله.</p></div>$content$,
'published',true,'ar','2026-01-15T22:44:37.923+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'coffee-calories-complete-guide',
'دليلك الشامل لسعرات القهوة الحرارية',
'اكتشف سعرات أنواع القهوة المختلفة — الإسبريسو والأمريكانو واللاتيه والكابتشينو — وكيف تُحضّر قهوتك الصحية.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1768518882439.webp',
$content$<div><h2>دليلك الشامل لسعرات القهوة الحرارية</h2>
<p>القهوة السوداء تكاد تكون خالية من السعرات، لكن الإضافات من حليب وسكر وكريمة وشراب تُحوّلها أحياناً إلى مشروب يضاهي حلوى كاملة بالسعرات.</p>
<hr>
<h2>سعرات أشهر أنواع القهوة</h2>
<ul>
<li><strong>إسبريسو (٣٠ مل):</strong> ~١ سعرة فقط</li>
<li><strong>أمريكانو (٢٤٠ مل):</strong> ~١٥ سعرة</li>
<li><strong>لاتيه (٣٥٥ مل بالحليب كامل الدسم):</strong> ~١٩٠ سعرة</li>
<li><strong>كابتشينو (٣٥٥ مل):</strong> ~١٢٠ سعرة</li>
<li><strong>ماكياتو بالكراميل (ستاربكس كبير):</strong> ~٢٥٠ سعرة</li>
<li><strong>فرابتشينو موكا:</strong> ~٣٨٠+ سعرة</li>
</ul>
<hr>
<h2>أكثر الإضافات تأثيراً على السعرات</h2>
<ul>
<li><strong>السكر (ملعقة صغيرة):</strong> ١٦ سعرة</li>
<li><strong>الكريمة الثقيلة (٣٠ مل):</strong> ١٠٠ سعرة</li>
<li><strong>شراب النكهة (٣٠ مل):</strong> ٧٥ سعرة</li>
</ul>
<hr>
<h2>نصائح لتقليل سعرات قهوتك</h2>
<p>استخدم حليب اللوز أو الشوفان بدلاً من الحليب كامل الدسم. قلّل من الشراب المحلى أو استبدله بالقرفة. تذكّر: القهوة السوداء مشروب مثالي إذا اعتدت عليها.</p>
<hr>
<h2>تتبع قهوتك مع CalorieVision</h2>
<p>صوّر كوب قهوتك وسيُحلله <strong>CalorieVision</strong> ويحدد سعراته. <strong>جرّبه مجاناً</strong> الآن.</p></div>$content$,
'published',true,'ar','2026-01-15T23:14:57.075+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'eggplant-calories-complete-guide',
'دليلك الشامل لسعرات الباذنجان الحرارية',
'اكتشف سعرات الباذنجان نيئاً ومشوياً ومقلياً وكيف يُضيف قيمة غذائية عالية بسعرات منخفضة.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1768309299536.webp',
$content$<div><h2>دليلك الشامل لسعرات الباذنجان الحرارية</h2>
<p>الباذنجان خضروات متعددة الاستخدامات، منخفضة السعرات وغنية بالألياف ومضادات الأكسدة. يُعتبر مكوّناً مثالياً لأي نظام غذائي صحي.</p>
<hr>
<h2>كم سعرة في الباذنجان؟</h2>
<ul>
<li><strong>١٠٠ غ نيء:</strong> ~٢٥ سعرة</li>
<li><strong>كوب باذنجان مكعبات (~٨٢ غ):</strong> ~٢٠ سعرة</li>
<li><strong>١٠٠ غ مشوي:</strong> ~٣٥ سعرة</li>
<li><strong>الباذنجان المقلي:</strong> ٢٠٠-٣٠٠ سعرة/١٠٠ غ (يمتص الزيت)</li>
</ul>
<hr>
<h2>تأثير طريقة الطهي</h2>
<p>الباذنجان مثل الإسفنج — يمتص الزيت بسرعة عند القلي مما يُضاعف سعراته. الشوي أو الخبز في الفرن أفضل للحفاظ على انخفاض السعرات.</p>
<hr>
<h2>القيمة الغذائية</h2>
<ul>
<li><strong>الألياف:</strong> ٣ غ لكل ١٠٠ غ — تدعم صحة الهضم</li>
<li><strong>النازونين:</strong> مضاد أكسدة قوي في قشرة الباذنجان</li>
<li><strong>البوتاسيوم والمنغنيز وحمض الكلوروجينيك</strong></li>
<li><strong>منخفض جداً في الدهون والكربوهيدرات</strong></li>
</ul>
<hr>
<h2>تتبع الباذنجان مع CalorieVision</h2>
<p>صوّر طبقك وسيحسب <strong>CalorieVision</strong> سعرات الباذنجان وكيفية تحضيره. <strong>جرّبه مجاناً</strong> اليوم.</p></div>$content$,
'published',true,'ar','2026-01-13T13:02:55.467+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

INSERT INTO public.blog_posts (slug,title,meta_description,featured_image_url,content,status,is_published,language,published_at,created_at,updated_at) VALUES (
'future-ai-personal-health-nutrition-2026',
'مستقبل الذكاء الاصطناعي في الصحة الشخصية والتغذية عام ٢٠٢٦',
'استشرف كيف سيُغيّر الذكاء الاصطناعي مفهوم التغذية الشخصية والرعاية الصحية في عام ٢٠٢٦ وما بعده.',
'https://smsikaqybxtnzjvruhsa.supabase.co/storage/v1/object/public/blog-images/compressed-1767460563416.webp',
$content$<div><h2>مستقبل الذكاء الاصطناعي في الصحة الشخصية والتغذية عام ٢٠٢٦</h2>
<p>التغذية الشخصية تشهد ثورة حقيقية. لم تعد المعلومات الغذائية حكراً على أخصائيي التغذية — الذكاء الاصطناعي يضع المعرفة الغذائية في يد كل شخص في أي مكان.</p>
<hr>
<h2>ما الذي تغيّر في ٢٠٢٦؟</h2>
<ul>
<li><strong>تحليل الصور الغذائية:</strong> من الصورة إلى تقرير غذائي كامل في ثوانٍ</li>
<li><strong>التوصيات الشخصية:</strong> خطط غذائية مبنية على أسلوب حياتك</li>
<li><strong>الأجهزة القابلة للارتداء:</strong> تتبع النشاط والنوم وتكاملها مع التغذية</li>
<li><strong>المستشار الغذائي الافتراضي:</strong> متاح ٢٤/٧ دون تكلفة باهظة</li>
</ul>
<hr>
<h2>التحديات والاعتبارات</h2>
<p>مع الإمكانات الهائلة، تبقى تحديات: دقة التحليل تتأثر بجودة الصور، والخصوصية مسألة جوهرية. الذكاء الاصطناعي يُكمّل ولا يُعوّض الرعاية الطبية المتخصصة.</p>
<hr>
<h2>CalorieVision — الحاضر والمستقبل</h2>
<p><strong>CalorieVision</strong> يُجسّد هذا التحول اليوم. جرّبه مجاناً واختبر بنفسك مستقبل تتبع التغذية.</p></div>$content$,
'published',true,'ar','2025-12-30T14:28:42.944+00:00',NOW(),NOW()
) ON CONFLICT (slug,language) DO UPDATE SET
  title=EXCLUDED.title,meta_description=EXCLUDED.meta_description,
  featured_image_url=EXCLUDED.featured_image_url,content=EXCLUDED.content,
  status='published',is_published=true,updated_at=NOW();

-- Verify part 1
SELECT slug, language, title FROM public.blog_posts
WHERE language = 'ar'
ORDER BY created_at DESC LIMIT 15;
