import { CheatFunction } from '../models/cheatsheet.models';

// Curated for coding-interview / DSA use, not exhaustive language references.
// PHP and Java entries are paired 1:1 via equivalentSlug so a reader can jump
// straight to "how do I do this in the other language". name/signature/example/
// output stay English-only (code, like everywhere else in the app); summary and
// description are bilingual.

const PHP_FUNCTIONS: CheatFunction[] = [
  {
    slug: 'str-split', lang: 'php', name: 'str_split', category: 'String',
    signature: 'str_split(string $string, int $length = 1): array',
    summary: {
      en: 'Splits a string into an array of chunks of a given length.',
      ar: 'بتقسم string لمصفوفة من القطع بطول معين.',
    },
    description: {
      en: 'Breaks a string into equal-sized pieces (one character each by default) and returns them as an indexed array — the standard way to iterate a string character by character in PHP, since strings aren\'t directly iterable.',
      ar: 'بتكسّر الـ string لقطع متساوية (حرف واحد لكل قطعة افتراضيًا) وبترجعها كمصفوفة مُرقّمة — الطريقة القياسية إنك تمشي على الـ string حرف حرف في PHP، لأن الـ strings مش قابلة للتكرار (iterable) بشكل مباشر.',
    },
    example: '$chars = str_split("hello");\nprint_r($chars);',
    output: '["h", "e", "l", "l", "o"]',
    equivalentSlug: 'to-char-array',
  },
  {
    slug: 'strtolower', lang: 'php', name: 'strtolower', category: 'String',
    signature: 'strtolower(string $string): string',
    summary: {
      en: 'Converts all alphabetic characters to lowercase.',
      ar: 'بتحول كل الحروف الأبجدية لحروف صغيرة (lowercase).',
    },
    description: {
      en: 'ASCII-only case folding — accented/multibyte characters pass through unchanged (use mb_strtolower for those). Commonly used to normalize strings before comparison, e.g. case-insensitive anagram or palindrome checks.',
      ar: 'بتحول الحروف بناءً على ASCII بس — الحروف المُشكّلة أو multibyte بتفضل زي ما هي (استخدمي mb_strtolower لِيهم). بتُستخدم كتير عشان توحّدي الـ strings قبل المقارنة، زي فحص الـ anagram أو الـ palindrome من غير حساسية لحالة الحروف.',
    },
    example: 'echo strtolower("Hello World");',
    output: 'hello world',
    equivalentSlug: 'to-lower-case',
  },
  {
    slug: 'strtoupper', lang: 'php', name: 'strtoupper', category: 'String',
    signature: 'strtoupper(string $string): string',
    summary: {
      en: 'Converts all alphabetic characters to uppercase.',
      ar: 'بتحول كل الحروف الأبجدية لحروف كبيرة (uppercase).',
    },
    description: {
      en: 'The mirror image of strtolower — same ASCII-only caveat applies. Useful for normalizing user input like command codes or single-letter flags.',
      ar: 'عكس strtolower تمامًا — نفس الملاحظة بتاعة ASCII بتنطبق هنا. مفيدة لتوحيد مدخلات المستخدم زي أكواد الأوامر أو الأحرف المفردة.',
    },
    example: 'echo strtoupper("Hello World");',
    output: 'HELLO WORLD',
    equivalentSlug: 'to-upper-case',
  },
  {
    slug: 'strrev', lang: 'php', name: 'strrev', category: 'String',
    signature: 'strrev(string $string): string',
    summary: {
      en: 'Reverses a string.',
      ar: 'بتعكس ترتيب حروف الـ string.',
    },
    description: {
      en: 'Returns the characters of a string in reverse order. A one-liner for palindrome checks: comparing $s to strrev($s).',
      ar: 'بترجع حروف الـ string بترتيب معكوس. سطر واحد يكفي لفحص الـ palindrome: تقارني $s بـ strrev($s).',
    },
    example: 'echo strrev("hello");',
    output: 'olleh',
    equivalentSlug: 'reverse',
  },
  {
    slug: 'substr', lang: 'php', name: 'substr', category: 'String',
    signature: 'substr(string $string, int $offset, ?int $length = null): string',
    summary: {
      en: 'Extracts a substring starting at a given offset.',
      ar: 'بتستخرج جزء من الـ string بادئة من موضع معين.',
    },
    description: {
      en: 'Negative offsets count from the end of the string. Omitting length returns everything to the end. The go-to tool for sliding-window and substring problems.',
      ar: 'الـ offset السالب بيتحسب من آخر الـ string. لو ماحددتيش length، بترجع كل حاجة لحد الآخر. الأداة الأساسية في مسائل الـ sliding window والـ substring.',
    },
    example: 'echo substr("hello world", 6);',
    output: 'world',
    equivalentSlug: 'substring',
  },
  {
    slug: 'trim', lang: 'php', name: 'trim', category: 'String',
    signature: 'trim(string $string, string $characters = " \\n\\r\\t\\v\\x00"): string',
    summary: {
      en: 'Strips whitespace (or given characters) from both ends of a string.',
      ar: 'بتشيل المسافات الفاضية (أو حروف معينة) من طرفي الـ string.',
    },
    description: {
      en: 'ltrim()/rtrim() do the same on just one side. Worth reaching for before comparing user input or tokens split out of a larger string.',
      ar: 'فيه ltrim()/rtrim() بيعملوا نفس الحاجة بس من جهة واحدة. يستاهل تستخدميها قبل ما تقارني مدخلات المستخدم أو أجزاء اتقسّمت من string أكبر.',
    },
    example: 'echo trim("  hi  ");',
    output: 'hi',
    equivalentSlug: 'trim',
  },
  {
    slug: 'explode', lang: 'php', name: 'explode', category: 'String',
    signature: 'explode(string $separator, string $string, int $limit = PHP_INT_MAX): array',
    summary: {
      en: 'Splits a string into an array by a delimiter.',
      ar: 'بتقسم string لمصفوفة على حسب delimiter معين.',
    },
    description: {
      en: 'The standard tool for tokenizing input like CSV rows or space-separated words. Pairs with implode() to round-trip back to a string.',
      ar: 'الأداة الأساسية لتقطيع مدخلات زي صفوف CSV أو كلمات متفصلة بمسافات. بتترابط مع implode لترجعي للـ string الأصلي.',
    },
    example: 'print_r(explode(",", "a,b,c"));',
    output: '["a", "b", "c"]',
    equivalentSlug: 'split',
  },
  {
    slug: 'implode', lang: 'php', name: 'implode', category: 'String',
    signature: 'implode(string $separator, array $array): string',
    summary: {
      en: 'Joins array elements into a string with a glue string.',
      ar: 'بتلزّق عناصر مصفوفة في string واحد بفاصل معين.',
    },
    description: {
      en: 'The inverse of explode(). Also available under the alias join().',
      ar: 'عكس explode() بالظبط. متاحة كمان تحت اسم join().',
    },
    example: 'echo implode("-", ["a", "b", "c"]);',
    output: 'a-b-c',
    equivalentSlug: 'string-join',
  },
  {
    slug: 'array-map', lang: 'php', name: 'array_map', category: 'Array',
    signature: 'array_map(callable $callback, array ...$arrays): array',
    summary: {
      en: 'Applies a callback to every element of an array, returning a new array.',
      ar: 'بتطبّق callback على كل عنصر في مصفوفة وبترجع مصفوفة جديدة.',
    },
    description: {
      en: 'Non-mutating — always returns a new array of the same length as the input. Can take multiple arrays at once and zip them elementwise into the callback.',
      ar: 'مبتغيّرش المصفوفة الأصلية — دايمًا بترجع مصفوفة جديدة بنفس الطول. ممكن تاخد أكتر من مصفوفة مرة واحدة وتجمعهم عنصر بعنصر جوه الـ callback.',
    },
    example: 'print_r(array_map(fn($x) => $x * 2, [1, 2, 3]));',
    output: '[2, 4, 6]',
    equivalentSlug: 'stream-map',
  },
  {
    slug: 'array-filter', lang: 'php', name: 'array_filter', category: 'Array',
    signature: 'array_filter(array $array, ?callable $callback = null): array',
    summary: {
      en: 'Keeps only the elements that pass a test callback.',
      ar: 'بتسيب بس العناصر اللي بتعدّي شرط معين في callback.',
    },
    description: {
      en: 'Preserves the original array keys — call array_values() afterward if you need a clean re-indexed array. Without a callback, it just drops falsy values.',
      ar: 'بتحافظ على الـ keys الأصلية — استخدمي array_values() بعدها لو محتاجة مصفوفة مُرقّمة من جديد. من غير callback، بتشيل بس القيم الـ falsy.',
    },
    example: 'print_r(array_filter([1, 2, 3, 4], fn($x) => $x % 2 === 0));',
    output: '[1 => 2, 3 => 4]',
    equivalentSlug: 'stream-filter',
  },
  {
    slug: 'array-reduce', lang: 'php', name: 'array_reduce', category: 'Array',
    signature: 'array_reduce(array $array, callable $callback, mixed $initial = null): mixed',
    summary: {
      en: 'Reduces an array to a single value by folding a callback over it.',
      ar: 'بتلمّ مصفوفة لقيمة واحدة عن طريق تمرير callback عليها.',
    },
    description: {
      en: 'The callback receives ($carry, $item) on each step. Useful for sums, products, or building up any kind of accumulator in one pass.',
      ar: 'الـ callback بياخد ($carry, $item) في كل خطوة. مفيدة للمجاميع أو حاصل الضرب أو بناء أي accumulator في مرة واحدة.',
    },
    example: 'echo array_reduce([1, 2, 3], fn($c, $x) => $c + $x, 0);',
    output: '6',
    equivalentSlug: 'stream-reduce',
  },
  {
    slug: 'sort', lang: 'php', name: 'sort', category: 'Array',
    signature: 'sort(array &$array, int $flags = SORT_REGULAR): bool',
    summary: {
      en: 'Sorts an array in place, ascending, and re-indexes the keys.',
      ar: 'بترتب مصفوفة في مكانها تصاعديًا وتعيد ترقيم الـ keys.',
    },
    description: {
      en: 'Mutates the array by reference (that\'s why it takes &$array). Use rsort() for descending, or asort()/ksort() when you need to keep the original key associations.',
      ar: 'بتغيّر المصفوفة نفسها (بالـ reference، عشان كده بتاخد &$array). استخدمي rsort() للترتيب التنازلي، أو asort()/ksort() لو عايزة تحافظي على ارتباط الـ keys الأصلية.',
    },
    example: '$a = [3, 1, 2];\nsort($a);\nprint_r($a);',
    output: '[1, 2, 3]',
    equivalentSlug: 'arrays-sort',
  },
  {
    slug: 'usort', lang: 'php', name: 'usort', category: 'Array',
    signature: 'usort(array &$array, callable $callback): bool',
    summary: {
      en: 'Sorts an array in place using a custom comparison function.',
      ar: 'بترتب مصفوفة في مكانها باستخدام دالة مقارنة مخصوصة.',
    },
    description: {
      en: 'The callback returns negative/zero/positive like a classic comparator — e.g. fn($a, $b) => $a <=> $b. The tool for sorting arrays of arrays/objects by a specific field.',
      ar: 'الـ callback بيرجع سالب/صفر/موجب زي أي comparator عادي — زي fn($a, $b) => $a <=> $b. دي الأداة لترتيب مصفوفة من مصفوفات أو objects حسب حقل معين.',
    },
    example: 'usort($people, fn($a, $b) => $a[\'age\'] <=> $b[\'age\']);',
    output: '// $people re-sorted by age, ascending',
    equivalentSlug: 'sort-comparator',
  },
  {
    slug: 'array-slice', lang: 'php', name: 'array_slice', category: 'Array',
    signature: 'array_slice(array $array, int $offset, ?int $length = null, bool $preserve_keys = false): array',
    summary: {
      en: 'Extracts a portion of an array without modifying the original.',
      ar: 'بتستخرج جزء من مصفوفة من غير ما تغيّر الأصلية.',
    },
    description: {
      en: 'Non-mutating counterpart to array_splice(). Negative offset or length count from the end of the array, same convention as substr().',
      ar: 'عكس array_splice() اللي بيغيّر المصفوفة. الـ offset أو length السالب بيتحسبوا من آخر المصفوفة، بنفس منطق substr().',
    },
    example: 'print_r(array_slice([1, 2, 3, 4, 5], 1, 3));',
    output: '[2, 3, 4]',
    equivalentSlug: 'copy-of-range',
  },
  {
    slug: 'array-merge', lang: 'php', name: 'array_merge', category: 'Array',
    signature: 'array_merge(array ...$arrays): array',
    summary: {
      en: 'Combines one or more arrays into one.',
      ar: 'بتدمج مصفوفة واحدة أو أكتر في مصفوفة واحدة.',
    },
    description: {
      en: 'String keys from later arrays overwrite earlier ones; numeric keys are renumbered from 0. Use the + operator instead if you need to preserve original numeric keys.',
      ar: 'الـ keys النصية من المصفوفات اللاحقة بتِكتب فوق السابقة؛ الـ keys الرقمية بتترقم من الأول. استخدمي عامل + بدل منها لو عايزة تحافظي على الـ keys الرقمية الأصلية.',
    },
    example: 'print_r(array_merge([1, 2], [3, 4]));',
    output: '[1, 2, 3, 4]',
    equivalentSlug: 'stream-concat',
  },
  {
    slug: 'in-array', lang: 'php', name: 'in_array', category: 'Array',
    signature: 'in_array(mixed $needle, array $haystack, bool $strict = false): bool',
    summary: {
      en: 'Checks whether a value exists in an array.',
      ar: 'بتفحص لو قيمة معينة موجودة في مصفوفة.',
    },
    description: {
      en: 'Pass strict: true to also require matching types and avoid PHP\'s loose == surprises (like 0 == "abc"). It\'s O(n) — for repeated membership checks, flip the array to keys first with array_flip().',
      ar: 'مرّري strict: true عشان كمان تتأكدي إن النوع مطابق وتتجنبي مفاجآت == بتاعة PHP (زي 0 == "abc"). سرعتها O(n) — لو هتفحصي كتير، اقلبي المصفوفة لـ keys الأول باستخدام array_flip().',
    },
    example: 'var_dump(in_array(3, [1, 2, 3]));',
    output: 'true',
    equivalentSlug: 'contains',
  },
  {
    slug: 'array-unique', lang: 'php', name: 'array_unique', category: 'Array',
    signature: 'array_unique(array $array, int $flags = SORT_STRING): array',
    summary: {
      en: 'Removes duplicate values from an array.',
      ar: 'بتشيل القيم المكررة من مصفوفة.',
    },
    description: {
      en: 'Keeps the first occurrence of each value and preserves the original keys — call array_values() afterward if you need a clean 0..n indexed array.',
      ar: 'بتحافظ على أول ظهور لكل قيمة وعلى الـ keys الأصلية — استخدمي array_values() بعدها لو محتاجة مصفوفة مُرقّمة من 0 نظيفة.',
    },
    example: 'print_r(array_unique([1, 2, 2, 3, 3, 3]));',
    output: '[1, 2, 3]',
    equivalentSlug: 'distinct',
  },
  {
    slug: 'count', lang: 'php', name: 'count', category: 'Array',
    signature: 'count(Countable|array $value, int $mode = COUNT_NORMAL): int',
    summary: {
      en: 'Counts the elements in an array (or a Countable object).',
      ar: 'بتحسب عدد العناصر في مصفوفة (أو Countable object).',
    },
    description: {
      en: 'Pass COUNT_RECURSIVE to also count nested array elements. Also available under the alias sizeof().',
      ar: 'مرّري COUNT_RECURSIVE عشان تحسبي العناصر الداخلية كمان. متاحة كمان تحت اسم sizeof().',
    },
    example: 'echo count([1, 2, 3]);',
    output: '3',
    equivalentSlug: 'length-size',
  },
  {
    slug: 'intval', lang: 'php', name: 'intval', category: 'Type & Char',
    signature: 'intval(mixed $value, int $base = 10): int',
    summary: {
      en: 'Converts a value to an integer.',
      ar: 'بتحول قيمة لعدد صحيح (integer).',
    },
    description: {
      en: 'Parses leading numeric characters and stops at the first non-digit, so "42abc" becomes 42 rather than throwing. Handy for pulling numbers out of loosely-formatted input.',
      ar: 'بتقرأ الأرقام من الأول وتوقف عند أول حرف مش رقم، يعني "42abc" بترجع 42 من غير ما تعمل error. مفيدة لاستخراج أرقام من مدخلات مش منسقة كويس.',
    },
    example: 'echo intval("42abc");',
    output: '42',
    equivalentSlug: 'parse-int',
  },
  {
    slug: 'is-numeric', lang: 'php', name: 'is_numeric', category: 'Type & Char',
    signature: 'is_numeric(mixed $value): bool',
    summary: {
      en: 'Checks whether a value is a number or a numeric string.',
      ar: 'بتفحص لو القيمة رقم أو string فيه رقم.',
    },
    description: {
      en: 'Accepts ints, floats, and strings like "3.14" or "1e10" — a safe guard to run before doing arithmetic on input that might still be a string.',
      ar: 'بتقبل أعداد صحيحة، عشرية، وstrings زي "3.14" أو "1e10" — حماية كويسة قبل ما تعملي عمليات حسابية على قيمة ممكن تكون لسه string.',
    },
    example: 'var_dump(is_numeric("3.14"));',
    output: 'true',
    equivalentSlug: 'is-digit',
  },
  {
    slug: 'ord', lang: 'php', name: 'ord', category: 'Type & Char',
    signature: 'ord(string $character): int',
    summary: {
      en: 'Returns the ASCII/byte value of the first character of a string.',
      ar: 'بترجع قيمة ASCII/byte لأول حرف في string.',
    },
    description: {
      en: 'The counterpart to chr(). Essential for character-arithmetic tricks like ord($c) - ord(\'a\') to map \'a\'..\'z\' onto 0..25.',
      ar: 'عكس chr(). أساسية لحيل حسابية على الحروف زي ord($c) - ord(\'a\') عشان تحوّلي \'a\'..\'z\' لـ 0..25.',
    },
    example: "echo ord('a');",
    output: '97',
    equivalentSlug: 'char-to-int',
  },
  {
    slug: 'chr', lang: 'php', name: 'chr', category: 'Type & Char',
    signature: 'chr(int $codepoint): string',
    summary: {
      en: 'Returns a one-character string for a given ASCII code.',
      ar: 'بترجع حرف واحد كـ string من كود ASCII معين.',
    },
    description: {
      en: 'The inverse of ord(). Comes up any time a problem builds strings from computed character codes.',
      ar: 'عكس ord(). بتظهر أي وقت مسألة بتبني strings من أكواد حروف محسوبة.',
    },
    example: 'echo chr(97);',
    output: 'a',
    equivalentSlug: 'int-to-char',
  },
  {
    slug: 'str-pad', lang: 'php', name: 'str_pad', category: 'Type & Char',
    signature: 'str_pad(string $string, int $length, string $pad_string = " ", int $pad_type = STR_PAD_RIGHT): string',
    summary: {
      en: 'Pads a string to a given length with another string.',
      ar: 'بتضيف padding لـ string لحد طول معين.',
    },
    description: {
      en: 'STR_PAD_LEFT / STR_PAD_RIGHT / STR_PAD_BOTH control which side gets padded — useful for formatting fixed-width output like leaderboard columns or zero-padded IDs.',
      ar: 'STR_PAD_LEFT / STR_PAD_RIGHT / STR_PAD_BOTH بتتحكم في جهة الـ padding — مفيدة لتنسيق مخرجات بعرض ثابت زي أعمدة الـ leaderboard أو IDs بأصفار زيادة.',
    },
    example: 'echo str_pad("5", 3, "0", STR_PAD_LEFT);',
    output: '005',
    equivalentSlug: 'string-format-pad',
  },
  {
    slug: 'sprintf', lang: 'php', name: 'sprintf', category: 'Type & Char',
    signature: 'sprintf(string $format, mixed ...$values): string',
    summary: {
      en: 'Returns a formatted string built from a format specifier and values.',
      ar: 'بترجع string منسّق مبني من format معين وقيم.',
    },
    description: {
      en: 'Supports %d, %s, %f, width/padding like %05d, and more — the standard way to build formatted output without manual string concatenation.',
      ar: 'بتدعم %d و%s و%f، وعرض/padding زي %05d وغيرها — الطريقة القياسية لبناء مخرجات منسّقة من غير ما تلزّقي strings يدويًا.',
    },
    example: 'echo sprintf("%05d", 42);',
    output: '00042',
    equivalentSlug: 'string-format',
  },
];

const JAVA_FUNCTIONS: CheatFunction[] = [
  {
    slug: 'to-char-array', lang: 'java', name: 'toCharArray()', category: 'String',
    signature: 'char[] toCharArray()',
    summary: {
      en: 'Converts a String into a char array.',
      ar: 'بتحول String لمصفوفة من char.',
    },
    description: {
      en: 'The direct equivalent of iterating a string character by character in Java — since String has no index operator, this is the standard way to get per-character access.',
      ar: 'المكافئ المباشر للمشي على string حرف حرف في Java — لأن الـ String مالهاش operator للفهرسة، دي الطريقة القياسية للوصول لكل حرف لوحده.',
    },
    example: 'char[] chars = "hello".toCharArray();',
    output: "['h', 'e', 'l', 'l', 'o']",
    equivalentSlug: 'str-split',
  },
  {
    slug: 'to-lower-case', lang: 'java', name: 'toLowerCase()', category: 'String',
    signature: 'String toLowerCase()',
    summary: {
      en: 'Returns a copy of the string with all characters converted to lowercase.',
      ar: 'بترجع نسخة من الـ string بكل حروفها صغيرة (lowercase).',
    },
    description: {
      en: 'Locale-sensitive by default — for locale-independent behavior in algorithmic code, prefer toLowerCase(Locale.ROOT).',
      ar: 'بتتأثر بالـ locale افتراضيًا — لسلوك مستقل عن الـ locale في الكود الخوارزمي، استخدمي toLowerCase(Locale.ROOT).',
    },
    example: 'System.out.println("Hello World".toLowerCase());',
    output: 'hello world',
    equivalentSlug: 'strtolower',
  },
  {
    slug: 'to-upper-case', lang: 'java', name: 'toUpperCase()', category: 'String',
    signature: 'String toUpperCase()',
    summary: {
      en: 'Returns a copy of the string with all characters converted to uppercase.',
      ar: 'بترجع نسخة من الـ string بكل حروفها كبيرة (uppercase).',
    },
    description: {
      en: 'The mirror image of toLowerCase() — same locale caveat applies (use Locale.ROOT for locale-independent results).',
      ar: 'عكس toLowerCase() — نفس ملاحظة الـ locale بتنطبق (استخدمي Locale.ROOT لنتيجة مستقلة عن الـ locale).',
    },
    example: 'System.out.println("Hello World".toUpperCase());',
    output: 'HELLO WORLD',
    equivalentSlug: 'strtoupper',
  },
  {
    slug: 'reverse', lang: 'java', name: 'StringBuilder.reverse()', category: 'String',
    signature: 'new StringBuilder(s).reverse().toString()',
    summary: {
      en: 'Reverses a string via StringBuilder.',
      ar: 'بتعكس string باستخدام StringBuilder.',
    },
    description: {
      en: 'Strings are immutable in Java, so there\'s no s.reverse() — StringBuilder is the idiomatic, efficient way to reverse (or otherwise build up) string content.',
      ar: 'الـ Strings ثابتة (immutable) في Java، فمفيش s.reverse() — StringBuilder هي الطريقة الفعّالة والقياسية لعكس (أو تعديل) محتوى string.',
    },
    example: 'String r = new StringBuilder("hello").reverse().toString();',
    output: 'olleh',
    equivalentSlug: 'strrev',
  },
  {
    slug: 'substring', lang: 'java', name: 'substring()', category: 'String',
    signature: 'String substring(int beginIndex, int endIndex)',
    summary: {
      en: 'Extracts a substring between two indices.',
      ar: 'بتستخرج جزء من الـ string بين موضعين.',
    },
    description: {
      en: 'endIndex is exclusive — unlike PHP\'s length-based substr(), a common off-by-one trap when porting code between the two languages.',
      ar: 'الـ endIndex مستبعد (exclusive) — عكس substr() في PHP اللي بتشتغل بالطول، وده فخ شائع لما تنقلي كود بين اللغتين.',
    },
    example: '"hello world".substring(6)',
    output: 'world',
    equivalentSlug: 'substr',
  },
  {
    slug: 'trim', lang: 'java', name: 'trim() / strip()', category: 'String',
    signature: 'String trim() / String strip()',
    summary: {
      en: 'Removes leading and trailing whitespace.',
      ar: 'بتشيل المسافات الفاضية من طرفي الـ string.',
    },
    description: {
      en: 'trim() only strips ASCII whitespace ≤ U+0020; the newer strip() (Java 11+) is Unicode-aware and generally the better default now.',
      ar: 'trim() بتشيل بس مسافات ASCII لحد U+0020؛ strip() الأحدث (Java 11+) بتتعامل مع Unicode وعمومًا هي الأفضل دلوقتي.',
    },
    example: '"  hi  ".trim()',
    output: 'hi',
    equivalentSlug: 'trim',
  },
  {
    slug: 'split', lang: 'java', name: 'split()', category: 'String',
    signature: 'String[] split(String regex)',
    summary: {
      en: 'Splits a string into an array using a regular expression delimiter.',
      ar: 'بتقسم string لمصفوفة باستخدام regex كـ delimiter.',
    },
    description: {
      en: 'Unlike PHP\'s explode(), the delimiter is a regex — plain characters like "," work as-is, but regex metacharacters (., |, *) need escaping.',
      ar: 'عكس explode() في PHP، الـ delimiter هنا regex — الحروف العادية زي "," بتشتغل زي ما هي، بس رموز الـ regex الخاصة (. | *) لازم تتعمللها escape.',
    },
    example: '"a,b,c".split(",")',
    output: '["a", "b", "c"]',
    equivalentSlug: 'explode',
  },
  {
    slug: 'string-join', lang: 'java', name: 'String.join()', category: 'String',
    signature: 'String.join(CharSequence delimiter, CharSequence... elements)',
    summary: {
      en: 'Joins strings (or a collection of strings) with a delimiter.',
      ar: 'بتلزّق strings (أو مجموعة strings) بفاصل معين.',
    },
    description: {
      en: 'A static factory method on String — no manual StringBuilder loop needed for a simple join.',
      ar: 'دالة static على String — مش محتاجة تعملي loop بـ StringBuilder عشان لزق بسيط.',
    },
    example: 'String.join("-", "a", "b", "c")',
    output: 'a-b-c',
    equivalentSlug: 'implode',
  },
  {
    slug: 'stream-map', lang: 'java', name: 'Stream.map()', category: 'Array / Stream',
    signature: 'Arrays.stream(arr).map(x -> ...).toArray()',
    summary: {
      en: 'Transforms each element of a stream, producing a new stream/array.',
      ar: 'بتحوّل كل عنصر في stream وبترجع stream/مصفوفة جديدة.',
    },
    description: {
      en: 'The Stream API\'s map() is the Java analog of array_map — build a stream from an array or collection, transform it, then collect back with .toArray() or Collectors.toList().',
      ar: 'map() بتاعة الـ Stream API هي مكافئ array_map — ابني stream من مصفوفة أو collection، حوّليه، وبعدين اجمعيه بـ .toArray() أو Collectors.toList().',
    },
    example: 'Arrays.stream(new int[]{1, 2, 3}).map(x -> x * 2).toArray()',
    output: '[2, 4, 6]',
    equivalentSlug: 'array-map',
  },
  {
    slug: 'stream-filter', lang: 'java', name: 'Stream.filter()', category: 'Array / Stream',
    signature: 'stream.filter(x -> predicate)',
    summary: {
      en: 'Keeps only elements matching a predicate.',
      ar: 'بتسيب بس العناصر اللي بتحقق شرط معين.',
    },
    description: {
      en: 'Lazily evaluated as part of a stream pipeline — chain with .map()/.collect() to filter-then-transform in a single pass.',
      ar: 'بتتنفذ بشكل lazy جوه سلسلة الـ stream — اربطيها بـ .map()/.collect() عشان تفلتري وتحوّلي في تمريرة واحدة.',
    },
    example: 'Arrays.stream(new int[]{1, 2, 3, 4}).filter(x -> x % 2 == 0).toArray()',
    output: '[2, 4]',
    equivalentSlug: 'array-filter',
  },
  {
    slug: 'stream-reduce', lang: 'java', name: 'Stream.reduce()', category: 'Array / Stream',
    signature: 'stream.reduce(identity, BinaryOperator<T> accumulator)',
    summary: {
      en: 'Folds a stream down to a single value.',
      ar: 'بتلمّ stream لقيمة واحدة.',
    },
    description: {
      en: 'identity is both the starting value and the result when the stream is empty — the direct analog of array_reduce\'s $initial argument.',
      ar: 'identity هي القيمة الابتدائية والنتيجة كمان لو الـ stream فاضي — نفس فكرة $initial بتاع array_reduce.',
    },
    example: 'Arrays.stream(new int[]{1, 2, 3}).reduce(0, Integer::sum)',
    output: '6',
    equivalentSlug: 'array-reduce',
  },
  {
    slug: 'arrays-sort', lang: 'java', name: 'Arrays.sort() / Collections.sort()', category: 'Array / Stream',
    signature: 'Arrays.sort(int[] a) / Collections.sort(List<T> list)',
    summary: {
      en: 'Sorts an array or list in place, ascending.',
      ar: 'بترتب مصفوفة أو list في مكانها تصاعديًا.',
    },
    description: {
      en: 'Arrays.sort() works on primitive/object arrays; Collections.sort() works on List implementations — both mutate in place, like PHP\'s sort().',
      ar: 'Arrays.sort() بتشتغل على مصفوفات primitive/object؛ Collections.sort() بتشتغل على List — الاتنين بيغيّروا في نفس المكان، زي sort() في PHP.',
    },
    example: 'int[] a = {3, 1, 2};\nArrays.sort(a);',
    output: '[1, 2, 3]',
    equivalentSlug: 'sort',
  },
  {
    slug: 'sort-comparator', lang: 'java', name: 'Comparator sort', category: 'Array / Stream',
    signature: 'Arrays.sort(T[] a, Comparator<T> c) / list.sort(Comparator<T> c)',
    summary: {
      en: 'Sorts using a custom comparator.',
      ar: 'بترتب باستخدام comparator مخصوص.',
    },
    description: {
      en: 'Comparator.comparing(...) or a lambda returning negative/zero/positive — the direct Java equivalent of PHP\'s usort() callback.',
      ar: 'Comparator.comparing(...) أو lambda بترجع سالب/صفر/موجب — المكافئ المباشر لـ callback بتاع usort() في PHP.',
    },
    example: 'people.sort((a, b) -> a.age - b.age);',
    output: '// people re-sorted by age, ascending',
    equivalentSlug: 'usort',
  },
  {
    slug: 'copy-of-range', lang: 'java', name: 'Arrays.copyOfRange()', category: 'Array / Stream',
    signature: 'Arrays.copyOfRange(T[] original, int from, int to)',
    summary: {
      en: 'Copies a range of an array into a new array.',
      ar: 'بتنسخ جزء من مصفوفة لمصفوفة جديدة.',
    },
    description: {
      en: 'to is exclusive. For Lists, list.subList(from, to) does the equivalent without copying — it returns a live view onto the original list.',
      ar: 'الـ to مستبعد (exclusive). بالنسبة للـ Lists، list.subList(from, to) بتعمل نفس الحاجة من غير نسخ — بترجع view حي على الـ list الأصلية.',
    },
    example: 'Arrays.copyOfRange(new int[]{1, 2, 3, 4, 5}, 1, 4)',
    output: '[2, 3, 4]',
    equivalentSlug: 'array-slice',
  },
  {
    slug: 'stream-concat', lang: 'java', name: 'Stream.concat() / addAll()', category: 'Array / Stream',
    signature: 'Stream.concat(s1, s2) / list.addAll(other)',
    summary: {
      en: 'Combines two arrays or collections into one.',
      ar: 'بتدمج مصفوفتين أو collections في واحدة.',
    },
    description: {
      en: 'For primitive arrays, concatenate via streams (Stream.concat + toArray) or System.arraycopy; for Lists, addAll() mutates the target list in place.',
      ar: 'للمصفوفات الـ primitive، ادمجي عن طريق streams (Stream.concat + toArray) أو System.arraycopy؛ بالنسبة للـ Lists، addAll() بتغيّر الـ list المستهدفة في مكانها.',
    },
    example: 'Stream.concat(Arrays.stream(a), Arrays.stream(b)).toArray()',
    output: '// elements of a followed by elements of b',
    equivalentSlug: 'array-merge',
  },
  {
    slug: 'contains', lang: 'java', name: 'contains()', category: 'Array / Stream',
    signature: 'list.contains(x) / Arrays.asList(arr).contains(x)',
    summary: {
      en: 'Checks whether a value exists in a list or array.',
      ar: 'بتفحص لو قيمة موجودة في list أو مصفوفة.',
    },
    description: {
      en: 'Arrays have no built-in contains() — wrap with Arrays.asList() first (autoboxing makes this the simplest route even for int[], via boxed streams).',
      ar: 'المصفوفات مالهاش contains() جاهزة — لفيها بـ Arrays.asList() الأول (الـ autoboxing بتخلي ده أسهل طريق حتى لـ int[]، عن طريق boxed streams).',
    },
    example: 'Arrays.asList(1, 2, 3).contains(3)',
    output: 'true',
    equivalentSlug: 'in-array',
  },
  {
    slug: 'distinct', lang: 'java', name: 'Stream.distinct()', category: 'Array / Stream',
    signature: 'stream.distinct()',
    summary: {
      en: 'Removes duplicate elements from a stream.',
      ar: 'بتشيل العناصر المكررة من stream.',
    },
    description: {
      en: 'Uses equals()/hashCode() to detect duplicates, keeping first-seen order — chain it onto a stream pipeline the same way array_unique() wraps an array.',
      ar: 'بتستخدم equals()/hashCode() عشان تكتشف التكرار، وبتحافظ على ترتيب أول ظهور — اربطيها بسلسلة stream زي ما array_unique() بتلف مصفوفة.',
    },
    example: 'Arrays.stream(new int[]{1, 2, 2, 3, 3, 3}).distinct().toArray()',
    output: '[1, 2, 3]',
    equivalentSlug: 'array-unique',
  },
  {
    slug: 'length-size', lang: 'java', name: '.length / .size()', category: 'Array / Stream',
    signature: 'array.length / collection.size()',
    summary: {
      en: 'Gets the number of elements.',
      ar: 'بترجع عدد العناصر.',
    },
    description: {
      en: 'Arrays expose it as a field (.length, no parentheses); Collections expose it as a method (.size()) — a common source of typos when switching between the two.',
      ar: 'المصفوفات بتعرضها كـ field (.length، من غير أقواس)؛ الـ Collections بتعرضها كـ method (.size()) — مصدر شائع لأخطاء إملائية لما تبدّلي بين الاتنين.',
    },
    example: 'new int[]{1, 2, 3}.length',
    output: '3',
    equivalentSlug: 'count',
  },
  {
    slug: 'parse-int', lang: 'java', name: 'Integer.parseInt()', category: 'Type & Char',
    signature: 'Integer.parseInt(String s)',
    summary: {
      en: 'Parses a string into an int.',
      ar: 'بتحول string لـ int.',
    },
    description: {
      en: 'Unlike PHP\'s intval(), this throws NumberFormatException on any non-numeric input rather than silently truncating — the whole string must be a valid integer.',
      ar: 'عكس intval() في PHP، دي بترمي NumberFormatException لو فيه أي حرف مش رقمي بدل ما تقطع بصمت — لازم الـ string كله يكون رقم صحيح صالح.',
    },
    example: 'Integer.parseInt("42")',
    output: '42',
    equivalentSlug: 'intval',
  },
  {
    slug: 'is-digit', lang: 'java', name: 'Character.isDigit()', category: 'Type & Char',
    signature: 'Character.isDigit(char c)',
    summary: {
      en: 'Checks whether a single character is a digit.',
      ar: 'بتفحص لو حرف واحد رقم.',
    },
    description: {
      en: 'Character-level, not string-level like PHP\'s is_numeric() — to validate a whole numeric string, loop with isDigit() or wrap parseInt/parseDouble in a try/catch.',
      ar: 'بتشتغل على مستوى الحرف، مش الـ string زي is_numeric() في PHP — عشان تتأكدي من string رقمي كامل، لفي بـ isDigit() أو لفّي parseInt/parseDouble في try/catch.',
    },
    example: "Character.isDigit('7')",
    output: 'true',
    equivalentSlug: 'is-numeric',
  },
  {
    slug: 'char-to-int', lang: 'java', name: '(int) cast', category: 'Type & Char',
    signature: "(int) c  /  c - '0'",
    summary: {
      en: 'Converts a character to its numeric code (or digit value).',
      ar: 'بتحول حرف لكوده الرقمي (أو قيمته كرقم).',
    },
    description: {
      en: 'char is itself a 16-bit numeric type in Java, so casting to int directly gives the Unicode code point — subtract \'0\' or \'a\' for digit/letter-index tricks, the same move as ord($c) - ord(\'a\') in PHP.',
      ar: 'الـ char نفسها نوع رقمي 16-bit في Java، فتحويلها لـ int بيدّيكي الـ Unicode code point مباشرة — اطرحي \'0\' أو \'a\' لحيل زي فهرسة الأرقام/الحروف، نفس حركة ord($c) - ord(\'a\') في PHP.',
    },
    example: "(int) 'a'\n'7' - '0'",
    output: "97\n7",
    equivalentSlug: 'ord',
  },
  {
    slug: 'int-to-char', lang: 'java', name: '(char) cast', category: 'Type & Char',
    signature: '(char) codepoint',
    summary: {
      en: 'Converts a numeric code back to a character.',
      ar: 'بتحول كود رقمي لحرف.',
    },
    description: {
      en: 'A direct cast from int (or a char-arithmetic result) back to char — the inverse of the (int) cast above.',
      ar: 'تحويل مباشر من int (أو نتيجة عملية حسابية على char) لـ char — عكس التحويل اللي فوق.',
    },
    example: '(char) 97',
    output: "'a'",
    equivalentSlug: 'chr',
  },
  {
    slug: 'string-format-pad', lang: 'java', name: 'String.format() padding', category: 'Type & Char',
    signature: 'String.format("%05d", n)  /  "0".repeat(n) + s',
    summary: {
      en: 'Pads a value to a fixed width.',
      ar: 'بتضيف padding لقيمة لحد عرض معين.',
    },
    description: {
      en: 'For numbers, String.format\'s width specifiers (%05d) handle zero/space padding directly; for arbitrary strings, build the pad manually with String.repeat() (Java 11+).',
      ar: 'للأرقام، محددات العرض بتاعة String.format (زي %05d) بتتعامل مع padding الصفر/المسافة مباشرة؛ للـ strings العادية، اعملي الـ padding يدوي بـ String.repeat() (Java 11+).',
    },
    example: 'String.format("%03d", 5)',
    output: '005',
    equivalentSlug: 'str-pad',
  },
  {
    slug: 'string-format', lang: 'java', name: 'String.format()', category: 'Type & Char',
    signature: 'String.format(String format, Object... args)',
    summary: {
      en: 'Builds a formatted string from a format specifier and arguments.',
      ar: 'بتبني string منسّق من format معين وقيم.',
    },
    description: {
      en: 'Same format-specifier language as C\'s printf / PHP\'s sprintf (%d, %s, %.2f, etc.) — Java\'s direct equivalent, just a static method rather than a language builtin.',
      ar: 'نفس لغة الـ format specifiers بتاعة printf في C / sprintf في PHP (%d، %s، %.2f، إلخ) — المكافئ المباشر في Java، بس كـ static method مش دالة لغة مدمجة.',
    },
    example: 'String.format("%05d", 42)',
    output: '00042',
    equivalentSlug: 'sprintf',
  },
];

export const CHEATSHEET_FUNCTIONS: CheatFunction[] = [...PHP_FUNCTIONS, ...JAVA_FUNCTIONS];
