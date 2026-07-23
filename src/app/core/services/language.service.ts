import { Injectable, effect, signal } from '@angular/core';

export type Lang = 'en' | 'ar';

interface Entry {
  en: string;
  ar: string;
}

const STORAGE_KEY = 'aya-lab-lang';

/** UI chrome strings shared across pages. Content that already has its own
 *  bilingual data (lessons, problem descriptions, admin-authored text) is
 *  NOT duplicated here — only static labels/buttons/headings live in this dict. */
const DICT = {
  // topbar
  navProblems:  { en: 'Problems',  ar: 'المسائل' },
  navLessons:   { en: 'Lessons',   ar: 'الدروس' },
  navDashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  navAdminLessons:  { en: 'Lesson Admin',  ar: 'إدارة الدروس' },
  navAdminProblems: { en: 'Problem Admin', ar: 'إدارة المسائل' },
  coffeeBtn: { en: '☕ Buy me a coffee', ar: '☕ اشتريلي قهوة' },

  // problem-list
  plSolvedOf: { en: 'solved', ar: 'اتحلت' },
  plDiffEasy:   { en: 'Easy',   ar: 'سهلة' },
  plDiffMedium: { en: 'Medium', ar: 'متوسطة' },
  plDiffHard:   { en: 'Hard',   ar: 'صعبة' },
  plSearchPlaceholder: { en: 'Search problems…', ar: 'دور على مسألة…' },
  plFilterAll:    { en: 'All',    ar: 'الكل' },
  plStatusTodo:      { en: 'Todo',      ar: 'لسه ماحلتهاش' },
  plStatusAttempted: { en: 'Attempted', ar: 'حاولت فيها' },
  plStatusSolved:    { en: 'Solved',    ar: 'اتحلت' },
  plClear: { en: 'Clear', ar: 'مسح' },
  plClearFilters: { en: 'Clear filters', ar: 'امسح الفلاتر' },
  plAllTopics: { en: 'All Topics', ar: 'كل المواضيع' },
  plProblemSet: { en: 'Problem Set', ar: 'قائمة المسائل' },
  plItems: { en: 'items', ar: 'مسألة' },
  plLoading: { en: 'Loading problems…', ar: 'بنحمّل المسائل…' },
  plNoMatch: { en: 'No problems match your filters', ar: 'مفيش مسائل مطابقة للفلاتر دي' },
  plThNum: { en: '#', ar: '#' },
  plThTitle: { en: 'Title', ar: 'الاسم' },
  plThAcceptance: { en: 'Acceptance', ar: 'نسبة الحل' },
  plThDifficulty: { en: 'Difficulty', ar: 'الصعوبة' },
  plVisualizerBadge: { en: 'Visualizer', ar: 'فيها Visualizer' },
  plComingSoon: { en: 'Coming Soon', ar: 'قريبًا' },

  // dashboard
  dashTitle: { en: '💳 Payment Dashboard', ar: '💳 لوحة المدفوعات' },
  dashPeriodDay:   { en: '24h', ar: '٢٤ ساعة' },
  dashPeriodWeek:  { en: '7d',  ar: '٧ أيام' },
  dashPeriodMonth: { en: '30d', ar: '٣٠ يوم' },
  dashKpiTotal:    { en: 'Total Initiated', ar: 'إجمالي المحاولات' },
  dashKpiSuccess:  { en: 'Completed', ar: 'اتمت بنجاح' },
  dashKpiFailed:   { en: 'Failed', ar: 'فشلت' },
  dashKpiRevenue:  { en: 'Revenue', ar: 'الإيرادات' },
  dashKpiRate:     { en: 'Success Rate', ar: 'نسبة النجاح' },
  dashChartTimeline: { en: 'Payments over time', ar: 'المدفوعات عبر الوقت' },
  dashChartByMethod: { en: 'By method', ar: 'حسب طريقة الدفع' },
  dashAuditLog: { en: '🗂 Audit Log', ar: '🗂 سجل الأحداث' },
  dashAllEvents: { en: 'All events', ar: 'كل الأحداث' },
  dashLoading: { en: 'Loading… ⏳', ar: 'بيتحمّل… ⏳' },
  dashNoEvents: { en: 'No events yet. Make a payment to see logs here.', ar: 'لسه مفيش أحداث. اعمل عملية دفع عشان تشوف السجل هنا.' },
  dashThEvent:  { en: 'Event', ar: 'الحدث' },
  dashThRef:    { en: 'Ref', ar: 'المرجع' },
  dashThMethod: { en: 'Method', ar: 'الطريقة' },
  dashThAmount: { en: 'Amount', ar: 'المبلغ' },
  dashThError:  { en: 'Error', ar: 'الخطأ' },
  dashThTime:   { en: 'Time', ar: 'الوقت' },
  dashPage: { en: 'Page', ar: 'صفحة' },

  // support
  supTitle: { en: 'Buy me a coffee!', ar: 'اشتريلي قهوة!' },
  supTagline: {
    en: 'If AyaLab helped you crack an interview or learn something new, a coffee keeps the problems coming ❤️',
    ar: 'لو Aya Coding Lab ساعدك تعدي انترفيو أو تتعلم حاجة جديدة، فنجان قهوة بيخلينا نكمل نضيف مسائل أكتر ❤️',
  },
  supHowMany: { en: 'How many coffees?', ar: 'كام فنجان؟' },
  supPayWith: { en: 'Pay with', ar: 'ادفع بـ' },
  supMethodCard:   { en: 'Card', ar: 'بطاقة' },
  supMethodWallet: { en: 'Mobile Wallet', ar: 'محفظة موبايل' },
  supMethodKiosk:  { en: 'Kiosk (Aman)', ar: 'أمان (كشك)' },
  supFirstName: { en: 'First name *', ar: 'الاسم الأول *' },
  supLastName:  { en: 'Last name *', ar: 'اسم العائلة *' },
  supEmail:     { en: 'Email *', ar: 'الإيميل *' },
  supPhone:     { en: 'Mobile number *', ar: 'رقم الموبايل *' },
  supProcessing: { en: 'Processing…', ar: 'بنعالج الطلب…' },
  supSend: { en: 'Send', ar: 'ابعت' },
  supCoffee:  { en: 'coffee', ar: 'قهوة' },
  supCoffees: { en: 'coffees', ar: 'قهوات' },
  supSecureNote: { en: '🔒 Secured by Paymob · PCI-DSS compliant', ar: '🔒 محمي بواسطة Paymob · متوافق مع PCI-DSS' },
  supErrFillNameEmail: { en: 'Please fill in your name and email.', ar: 'من فضلك اكتب اسمك وإيميلك.' },
  supErrPhoneRequired: { en: 'Phone number is required for mobile wallet.', ar: 'رقم الموبايل مطلوب لو هتدفع بالمحفظة.' },

  // payment checkout
  pcSecureBy: { en: 'Secure payment powered by', ar: 'دفع آمن بواسطة' },
  pcOrderSummary: { en: 'Order Summary', ar: 'ملخص الطلب' },
  pcPlanName: { en: 'Aya Lab — Pro Plan', ar: 'Aya Lab — باقة Pro' },
  pcPlanDesc: { en: 'Monthly subscription · Full platform access', ar: 'اشتراك شهري · وصول كامل للمنصة' },
  pcMonthlyPlan: { en: 'Monthly Plan', ar: 'الباقة الشهرية' },
  pcTax: { en: 'Tax (0%)', ar: 'الضريبة (٠٪)' },
  pcTotalDue: { en: 'Total due today', ar: 'الإجمالي المطلوب اليوم' },
  pcPerk1: { en: 'All problems & visualizers unlocked', ar: 'كل المسائل والـ Visualizers متاحة' },
  pcPerk2: { en: 'AI-powered solutions', ar: 'حلول مدعومة بالذكاء الاصطناعي' },
  pcPerk3: { en: 'Cancel anytime', ar: 'إلغاء في أي وقت' },
  pcProtected: { en: 'Your payment is protected', ar: 'عملية الدفع بتاعتك محمية' },
  pcSsl: { en: '256-bit SSL Encryption', ar: 'تشفير SSL بقوة ٢٥٦ بت' },
  pcSslDesc: { en: 'Bank-grade data protection on every transaction', ar: 'حماية بيانات بمستوى البنوك في كل عملية' },
  pcPci: { en: 'PCI DSS Compliant', ar: 'متوافق مع PCI DSS' },
  pcPciDesc: { en: 'Highest international payment security standard', ar: 'أعلى معيار عالمي لأمان المدفوعات' },
  pcInstant: { en: 'Instant Confirmation', ar: 'تأكيد فوري' },
  pcInstantDesc: { en: 'Access granted immediately after payment', ar: 'الوصول بيتفعّل فورًا بعد الدفع' },
  pcRedirect: { en: 'Secure Redirect', ar: 'تحويل آمن' },
  pcRedirectDesc: { en: 'Card details processed by Paymob — never stored by us', ar: 'بيانات الكارت بتتعالج عن طريق Paymob — إحنا مبنخزنهاش خالص' },
  pcAcceptedMethods: { en: 'Accepted payment methods', ar: 'وسائل الدفع المقبولة' },
  pcNeedHelp: { en: 'Need help?', ar: 'محتاج مساعدة؟' },
  pcSupportHours: { en: 'Sun – Thu · 9 AM – 5 PM EET', ar: 'الأحد – الخميس · ٩ ص – ٥ م بتوقيت القاهرة' },
  pcCompletePayment: { en: 'Complete your payment', ar: 'كمّل عملية الدفع' },
  pcFormSub: { en: 'Trusted by thousands of Egyptian developers · Multiple payment methods available', ar: 'موثوق بيه من آلاف المبرمجين المصريين · طرق دفع متعددة متاحة' },
  pcSelectMethod: { en: 'Select Payment Method', ar: 'اختار طريقة الدفع' },
  pcMethodCardLabel: { en: 'Credit / Debit Card', ar: 'بطاقة ائتمان / خصم' },
  pcMethodCardHint:  { en: 'Pay securely via Paymob iframe', ar: 'ادفع بأمان عن طريق Paymob' },
  pcMethodWalletLabel: { en: 'Mobile Wallet', ar: 'محفظة موبايل' },
  pcMethodWalletHint:  { en: 'Vodafone Cash · Etisalat · Orange', ar: 'فودافون كاش · اتصالات كاش · أورنج كاش' },
  pcMethodKioskLabel: { en: 'Kiosk (Aman)', ar: 'أمان (كشك)' },
  pcMethodKioskHint:  { en: 'Pay at the nearest Aman or Masary outlet', ar: 'ادفع في أقرب منفذ أمان أو مصاري' },
  pcBillingDetails: { en: 'Billing Details', ar: 'بيانات الفوترة' },
  pcFirstName: { en: 'First name', ar: 'الاسم الأول' },
  pcLastName: { en: 'Last name', ar: 'اسم العائلة' },
  pcEmailAddress: { en: 'Email address', ar: 'الإيميل' },
  pcWalletNumber: { en: 'Mobile wallet number', ar: 'رقم المحفظة' },
  pcWalletNote: { en: 'Must match your registered wallet number', ar: 'لازم يكون نفس رقم المحفظة المسجل بيه' },
  pcSecNote: { en: 'Your payment is protected with bank-level encryption. We never collect or store card details.', ar: 'عملية الدفع محمية بتشفير بمستوى البنوك. إحنا مش بنجمع أو نخزن بيانات الكارت خالص.' },
  pcProcessingSecurely: { en: 'Processing securely…', ar: 'بنعالج الدفع بأمان…' },
  pcPaySecurely: { en: 'Pay Securely Now', ar: 'ادفع بأمان دلوقتي' },
  pcInstantAccess: { en: 'Instant access', ar: 'وصول فوري' },
  pcPciCompliant: { en: 'PCI Compliant', ar: 'متوافق PCI' },
  pcCancelAnytime: { en: 'Cancel anytime', ar: 'إلغاء في أي وقت' },
  pcPoweredBy: { en: 'Trusted secure checkout powered by', ar: 'صفحة دفع آمنة وموثوقة بواسطة' },
  pcPrivacy: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  pcTerms: { en: 'Terms of Service', ar: 'شروط الاستخدام' },
  pcRefund: { en: 'Refund Policy', ar: 'سياسة الاسترجاع' },
  pcAllRights: { en: 'All rights reserved.', ar: 'كل الحقوق محفوظة.' },
  pcErrRequiredFields: { en: 'Please fill in all required fields.', ar: 'من فضلك املا كل الحقول المطلوبة.' },
  pcErrPhoneRequired: { en: 'Phone number is required for mobile wallet payments.', ar: 'رقم الموبايل مطلوب للدفع بالمحفظة.' },

  // payment callback
  cbKioskTitle: { en: 'Pay at Kiosk', ar: 'ادفع في الكشك' },
  cbKioskDesc: {
    en: 'Visit any Aman or Masary outlet and use the reference number below to complete your payment.',
    ar: 'روح لأي فرع أمان أو مصاري واستخدم رقم المرجع اللي تحت عشان تكمّل الدفع.',
  },
  cbRefLabel: { en: 'Bill Reference Number', ar: 'رقم مرجع الفاتورة' },
  cbRefSub: { en: 'Valid for 48 hours · Your account activates automatically', ar: 'صالح لمدة ٤٨ ساعة · حسابك هيتفعّل تلقائيًا' },
  cbStep1: { en: 'Go to any Aman or Masary kiosk near you', ar: 'روح لأقرب كشك أمان أو مصاري' },
  cbStep2: { en: 'Select Paymob from the services menu', ar: 'اختار Paymob من قائمة الخدمات' },
  cbStep3: { en: 'Enter the reference number above and pay', ar: 'ادخل رقم المرجع اللي فوق وادفع' },
  cbStep4: { en: 'Your Pro account activates instantly after payment', ar: 'حساب الـ Pro هيتفعّل فورًا بعد الدفع' },
  cbBackToProblems: { en: 'Back to problems', ar: 'ارجع للمسائل' },
  cbConfirming: { en: 'Confirming payment…', ar: 'بنأكّد عملية الدفع…' },
  cbConfirmingDesc: { en: "We're verifying your payment with Paymob. This usually takes just a few seconds.", ar: 'بنتأكد من عملية الدفع مع Paymob. ده بياخد كام ثانية بس عادةً.' },
  cbDontClose: { en: "Please don't close this page.", ar: 'من فضلك متقفلش الصفحة دي.' },
  cbSuccessTitle: { en: 'Payment Successful!', ar: 'الدفع تم بنجاح!' },
  cbSuccessDesc: { en: 'Your Pro subscription is now active. Enjoy unlimited access to all problems, visualizers, and AI solutions.', ar: 'اشتراك الـ Pro بتاعك دلوقتي شغال. استمتع بوصول كامل لكل المسائل والـ Visualizers والحلول بالذكاء الاصطناعي.' },
  cbPerkAllUnlocked: { en: 'All problems unlocked', ar: 'كل المسائل اتفتحت' },
  cbPerkViz: { en: 'Visualizers enabled', ar: 'الـ Visualizers اتفعّلت' },
  cbPerkAi: { en: 'AI solutions available', ar: 'الحلول بالذكاء الاصطناعي متاحة' },
  cbStartSolving: { en: 'Start Solving Problems', ar: 'ابدأ تحل المسائل' },
  cbEmailSent: { en: 'A confirmation email has been sent to your inbox.', ar: 'اتبعتلك إيميل تأكيد على بريدك.' },
  cbFailedTitle: { en: 'Payment Failed', ar: 'فشلت عملية الدفع' },
  cbFailedDesc: { en: 'Something went wrong with your payment. No charge was made. Please try again with a different method or contact your bank.', ar: 'حصلت مشكلة في عملية الدفع. مفيش أي مبلغ اتخصم. جرب طريقة تانية أو كلم البنك بتاعك.' },
  cbTip1: { en: 'Check that your card details are correct', ar: 'اتأكد إن بيانات الكارت صحيحة' },
  cbTip2: { en: 'Ensure sufficient balance is available', ar: 'اتأكد إن فيه رصيد كافي' },
  cbTip3: { en: 'Try a different payment method', ar: 'جرب طريقة دفع تانية' },
  cbTryAgain: { en: 'Try Again', ar: 'حاول تاني' },
  cbNeedHelpContact: { en: 'Need help? Contact', ar: 'محتاج مساعدة؟ كلّم' },
  cbSecuredBy: { en: 'Secured by', ar: 'محمي بواسطة' },
  cbPciCompliantFull: { en: 'PCI DSS Compliant', ar: 'متوافق مع PCI DSS' },

  // admin: problems
  apTitle: { en: '🎮 Problem Admin', ar: '🎮 إدارة المسائل' },
  apSub: { en: 'Manage the problem catalogue — create, edit, and publish problems.', ar: 'تحكّم في قائمة المسائل — أضف وعدّل وانشر المسائل.' },
  apNewProblem: { en: '＋ New Problem', ar: '＋ مسألة جديدة' },
  apKpiTotal: { en: 'Total Problems', ar: 'إجمالي المسائل' },
  apKpiPublished: { en: 'Published', ar: 'منشورة' },
  apKpiHidden: { en: 'Hidden', ar: 'مخفية' },
  apKpiSandbox: { en: 'With Sandbox', ar: 'فيها Sandbox' },
  apRetry: { en: 'Retry', ar: 'حاول تاني' },
  apThId: { en: '#', ar: '#' },
  apThTitle: { en: 'Title', ar: 'الاسم' },
  apThSlug: { en: 'Slug', ar: 'Slug' },
  apThDifficulty: { en: 'Difficulty', ar: 'الصعوبة' },
  apThTags: { en: 'Tags', ar: 'الوسوم' },
  apThSandbox: { en: 'Sandbox', ar: 'Sandbox' },
  apThStatus: { en: 'Status', ar: 'الحالة' },
  apThActions: { en: 'Actions', ar: 'إجراءات' },
  apEdit: { en: '✏️ Edit', ar: '✏️ عدّل' },
  apDelete: { en: 'Delete', ar: 'احذف' },
  apCancel: { en: 'Cancel', ar: 'إلغاء' },
  apLive: { en: '● Live', ar: '● منشورة' },
  apHiddenPill: { en: '○ Hidden', ar: '○ مخفية' },
  apEmptyRow: { en: 'No problems yet — click "New Problem" to add one.', ar: 'لسه مفيش مسائل — دوس على "مسألة جديدة" عشان تضيف واحدة.' },

  // admin: lessons
  alTitle: { en: '📚 Lesson Admin', ar: '📚 إدارة الدروس' },
  alSub: { en: 'Manage the lessons catalogue — create, edit, and publish lessons.', ar: 'تحكّم في قائمة الدروس — أضف وعدّل وانشر الدروس.' },
  alNewLesson: { en: '＋ New Lesson', ar: '＋ درس جديد' },
  alKpiTotal: { en: 'Total Lessons', ar: 'إجمالي الدروس' },
  alKpiPublished: { en: 'Published', ar: 'منشورة' },
  alKpiHidden: { en: 'Hidden', ar: 'مخفية' },
  alThId: { en: '#', ar: '#' },
  alThTitle: { en: 'Title', ar: 'الاسم' },
  alThSlides: { en: 'Slides', ar: 'الشرائح' },
  alThStatus: { en: 'Status', ar: 'الحالة' },
  alThActions: { en: 'Actions', ar: 'إجراءات' },

  // lessons list
  llCouldNotReach: { en: 'Could not reach the server.', ar: 'مقدرناش نوصل للسيرفر.' },
  llRetry: { en: 'Retry', ar: 'حاول تاني' },

  // lesson viewer
  lvLoading: { en: 'Loading lesson…', ar: 'بيتحمّل الدرس…' },
  lvNotFound: { en: 'Lesson not found.', ar: 'الدرس مش موجود.' },
  lvBackToLessons: { en: 'Back to Lessons', ar: 'ارجع للدروس' },

  // problem detail
  pdTraceGame: { en: '🎮 Trace Game', ar: '🎮 لعبة التتبع' },
  pdBothSolutions: { en: '📽️ Both Solutions', ar: '📽️ الحلّان' },
  pdMovePointer: { en: '🖱️ Move the Pointer', ar: '🖱️ حرّك المؤشر' },
  pdSolutionOnly: { en: '💻 Solution', ar: '💻 الحل' },
  pdSolutionLabel: { en: '💻 Solution', ar: '💻 الحل' },
  pdReset: { en: '↺ Reset', ar: '↺ إعادة تعيين' },
  pdRunTests: { en: '▶ Run Tests', ar: '▶ شغّل الاختبارات' },
  pdSubmit: { en: '🚀 Submit', ar: '🚀 إرسال' },
} satisfies Record<string, Entry>;

export type TKey = keyof typeof DICT;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  lang = signal<Lang>(this.readStored());

  constructor() {
    effect(() => {
      const l = this.lang();
      if (typeof document !== 'undefined') {
        document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = l;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, l);
      }
    });
  }

  private readStored(): Lang {
    if (typeof localStorage === 'undefined') return 'en';
    return localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
  }

  get isAr(): boolean { return this.lang() === 'ar'; }

  set(l: Lang): void { this.lang.set(l); }
  toggle(): void { this.lang.set(this.lang() === 'en' ? 'ar' : 'en'); }

  t(key: TKey): string {
    return DICT[key][this.lang()];
  }

  /** For components that hold their own {en, ar} bilingual data objects. */
  pick(entry: Entry): string {
    return entry[this.lang()];
  }
}
