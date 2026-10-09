/* إعلانات مركز التعليم المستمر — add a new announcement by adding one object to this array.
   Fields: id, title, summary, date (optional text), tags[], poster {base, widths[], w, h} (optional),
   alt (required when poster), cta {label, href, ext}, more {label, href} (optional), source.
   Poster files live in assets/img/cec/ann/<base>-<width>.webp (+ a .jpg fallback at 800 and 1800). */
window.CE_ANNOUNCEMENTS = [
  {
    id: "lang-courses-2026",
    featured: true,
    title: "وسّع آفاقك وتعلّم لغة جديدة",
    summary: "فتح باب التسجيل في دورات اللغات: الإنجليزية والفرنسية والروسية والصينية.",
    tags: ["دورات اللغات", "المقاعد محدودة"],
    poster: { base: "assets/img/cec/ann/lang-courses-2026", widths: [480, 800, 1200, 1800], w: 2251, h: 4160 },
    alt: "إعلان مركز التعليم المستمر: وسّع آفاقك وتعلّم لغة جديدة — فتح باب التسجيل في دورات اللغات الإنجليزية والفرنسية والروسية والصينية؛ عدد الساعات 30 ساعة تدريبية؛ الرسوم 1,200 درهم إماراتي فقط؛ يومان أسبوعياً؛ خصومات متنوعة تصل إلى 40% للفئات المستحقة؛ المقاعد محدودة؛ رمز QR للتسجيل؛ ترخيص أكتفت ACTVET LICENSE NO. 2026/1578.",
    cta: { label: "قم بالتسجيل", href: "https://hub.mbzuh.ac.ae/cec", ext: true },
    more: { label: "مواعيد كل لغة", href: "#languages" },
    source: "الإعلان الرسمي للمركز"
  },
  {
    id: "cec-guide-2026",
    title: "دليل البرامج التدريبية 2026",
    summary: "برامج ودورات تغطي القيادة والإدارة، وإدارة المشاريع، والموارد البشرية وتطوير الأداء، والجودة والابتكار، والاستراتيجية والتخطيط، واللغات، والاتصال والإعلام، والذكاء الاصطناعي، والتحضير لاختبارات IELTS وTOEFL.",
    tags: ["دليل", "PDF"],
    icon: "book",
    cta: { label: "تحميل الدليل (PDF)", href: "https://www.mbzuh.ac.ae/files/CEC-Training-Guide-2026.pdf", ext: true },
    more: { label: "تصفّح البرامج", href: "#catalog" },
    source: "دليل البرامج التدريبية — موقع الجامعة"
  }
];
