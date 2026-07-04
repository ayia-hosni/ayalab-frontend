import { Lesson, Slide } from '../models/lesson.models';
import {
  COLOR_A, COLOR_B, COLOR_C, COLOR_X,
  arrowConn, codeBlock, codeInline, codeText, curTag,
  fullChainVisual, headTag, nodeBox, nullNode, numberChainVisual, visualBox,
} from './lesson-visuals';

const c = (s: string) => `<code class="bg-white border border-gray-200 px-1.5 py-0.5 rounded font-mono text-sm">${s}</code>`;

export const LINKED_LIST_SLIDES: Slide[] = [
// 1. Title / overview
{
  kicker: { en: 'Data Structures &amp; Algorithms', ar: 'هياكل البيانات والخوارزميات' },
  title: { en: 'Linked List', ar: 'Linked List' },
  visual: fullChainVisual(true),
  body: {
    en: `<p>Look at the picture above &mdash; that <strong>is</strong> the entire Linked List.</p>
         <p>We're going to explain it piece by piece, as if we're seeing it for the very first time. Nothing will be skipped &mdash; just slowed down.</p>`,
    ar: `<p>بص على الرسمة اللي فوق &mdash; دي هي الـ Linked List <strong>كلها</strong>.</p>
         <p>هنفهمها واحدة واحدة، كأننا أول مرة نشوفها. مفيش حاجة هتتشال، بس هنبطّئ الشرح شوية.</p>`
  }
},
// 2. How many parts
{
  kicker: { en: 'The pieces', ar: 'الأجزاء' },
  title: { en: 'How many parts do we have?', ar: 'عندنا كام حاجة؟' },
  visual: fullChainVisual(true),
  body: {
    en: `<p>We have 4 things on screen:</p>
         <ul class="list-disc list-inside space-y-1 my-3">
            <li>${c('Head')}</li>
            <li>${c('Node A')}</li>
            <li>${c('Node B')}</li>
            <li>${c('Node C')}</li>
         </ul>
         <p>But here's the catch: <strong>Head is not a Node.</strong> It's just a pointer.</p>`,
    ar: `<p>عندنا ٤ حاجات على الشاشة:</p>
         <ul class="list-disc list-inside space-y-1 my-3">
            <li>${c('Head')}</li>
            <li>${c('Node A')}</li>
            <li>${c('Node B')}</li>
            <li>${c('Node C')}</li>
         </ul>
         <p>لكن الحقيقة: <strong>الـ Head مش Node.</strong> هو مجرد Pointer.</p>`
  }
},
// 3. Head
{
  kicker: { en: 'First up', ar: 'أول حاجة' },
  title: { en: 'Head', ar: 'Head' },
  visual: visualBox(`${headTag('Head')}`) + visualBox(`${headTag('Head')} ${arrowConn('bg-gray-300', true)} ${nodeBox('A', COLOR_A)}`),
  body: {
    en: `<p><code class="bg-brand-light text-brand-dark px-2 py-1 rounded-md text-sm font-mono border border-brand-purple/20">Head</code> is a variable. It does not store data.</p>
         <p>It stores the <strong>address</strong> of the first node. So instead of holding a number like ${c('Head = 10')}, it holds an address, for example ${c('Head = 0x1000')} &mdash; the address of the first node.</p>
         <p>In other words, Head is saying: <em>"the first element lives over there."</em></p>`,
    ar: `<p><code class="bg-brand-light text-brand-dark px-2 py-1 rounded-md text-sm font-mono border border-brand-purple/20">Head</code> عبارة عن متغير. مش بيخزن بيانات.</p>
         <p>هو بيخزن <strong>عنوان</strong> أول Node. يعني بدل ما يكون جواه رقم زي ${c('Head = 10')}، هيكون جواه Address، مثلًا ${c('Head = 0x1000')} &mdash; عنوان أول Node.</p>
         <p>يعني الـ Head بيقول: <em>"أول عنصر موجود هناك."</em></p>`
  }
},
// 4. Why Head
{
  kicker: { en: 'Why it matters', ar: 'ليه محتاجينه' },
  title: { en: 'Why do we need Head?', ar: 'ليه محتاجين Head؟' },
  visual: visualBox(`
        <div class="w-10 h-10 rounded-full border-2 border-dashed border-rose-400 flex items-center justify-center text-rose-500 font-bold text-xl flex-shrink-0">?</div>
        ${arrowConn('bg-gray-300', true)}
        ${nodeBox('A', { ...COLOR_A, bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-300' })}
        ${arrowConn('bg-gray-300', true)}
        ${nodeBox('B', { ...COLOR_B, bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-300' })}
        ${arrowConn('bg-gray-300', true)}
        ${nodeBox('C', { ...COLOR_C, bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-300' })}
    `, 'Head is lost'),
  body: {
    en: `<p>Because the entire Linked List starts from it.</p>
         <p>If Head is lost, we no longer know how to reach <em>any</em> node &mdash; the whole list is gone, even though every node still technically exists in memory.</p>`,
    ar: `<p>لأن كل الـ Linked List بتبدأ منه.</p>
         <p>لو ضاع الـ Head... مبقيناش عارفين نوصل لأي Node. يعني القائمة كلها ضاعت، حتى لو كل Node لسه موجودة في الذاكرة.</p>`
  }
},
// 5. Node overview
{
  kicker: { en: 'Second up', ar: 'ثاني حاجة' },
  title: { en: 'Node', ar: 'Node' },
  visual: visualBox(`
        <div class="flex rounded-2xl border-[3px] border-brand-purple overflow-hidden node-3d">
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm border-r-2 border-brand-purple">Data</div>
            <div class="w-16 h-16 sm:w-20 sm:h-20 bg-white text-brand-dark flex items-center justify-center font-bold text-sm">Next</div>
        </div>
    `),
  body: {
    en: `<p>Every rectangle in the diagram is called a <strong>Node</strong>.</p>
         <p>Each Node has exactly two things inside it: ${c('Data')} and ${c('Next')}.</p>`,
    ar: `<p>كل مستطيل في الرسمة اسمه <strong>Node</strong>.</p>
         <p>كل Node فيها حاجتين بالظبط: ${c('Data')} و ${c('Next')}.</p>`
  }
},
// 6. Data field
{
  kicker: { en: 'Inside the node', ar: 'جوه الـ Node' },
  title: { en: 'Data', ar: 'Data' },
  visual: visualBox(`
        <div class="flex flex-wrap gap-3 justify-center">
            <div class="px-4 py-2 rounded-lg bg-white border-2 border-brand-purple/30 font-mono text-sm text-brand-dark shadow-sm">5</div>
            <div class="px-4 py-2 rounded-lg bg-white border-2 border-brand-purple/30 font-mono text-sm text-brand-dark shadow-sm">"Ahmed"</div>
            <div class="px-4 py-2 rounded-lg bg-white border-2 border-brand-purple/30 font-mono text-sm text-brand-dark shadow-sm">Student</div>
            <div class="px-4 py-2 rounded-lg bg-white border-2 border-brand-purple/30 font-mono text-sm text-brand-dark shadow-sm">Car</div>
        </div>
    `),
  body: {
    en: `<p>This is the actual data. It could be ${c('5')}, or ${c('"Ahmed"')}, or a ${c('Student')} object, a ${c('Car')} object, or really any object at all.</p>
         <p>This part is simply the value itself.</p>`,
    ar: `<p>دي البيانات. ممكن تكون ${c('5')}، أو ${c('"Ahmed"')}، أو ${c('Student')}، أو ${c('Car')}، أو أي Object تاني.</p>
         <p>يعني الجزء ده هو القيمة نفسها.</p>`
  }
},
// 7. Next field
{
  kicker: { en: 'Inside the node', ar: 'جوه الـ Node' },
  title: { en: 'Next', ar: 'Next' },
  visual: visualBox(`
        <div class="flex rounded-2xl border-[3px] border-brand-purple overflow-hidden node-3d flex-shrink-0">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm border-r-2 border-brand-purple">5</div>
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-white text-brand-dark flex items-center justify-center font-mono font-bold text-xs">0x500</div>
        </div>
        ${arrowConn('bg-brand-purple')}
        <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-[3px] border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold text-sm node-3d flex-shrink-0">Node</div>
    `),
  body: {
    en: `<p>This is the most important part.</p>
         <p>${c('Next')} does not store a value. It stores the <strong>address of another node</strong> &mdash; a pointer.</p>
         <p>For example: ${c('Data = 5')}, ${c('Next = 0x500')}. That means: go to address ${c('0x500')}, and you'll find the next node there.</p>`,
    ar: `<p>وده أهم جزء.</p>
         <p>${c('Next')} مش بيخزن قيمة. بيخزن <strong>عنوان Node تانية</strong> &mdash; يعني Pointer.</p>
         <p>مثلًا: ${c('Data = 5')}، ${c('Next = 0x500')}. ده معناه: روح للعنوان ${c('0x500')}، هتلاقي الـ Node اللي بعدها.</p>`
  }
},
// 8. Node structure summary
{
  kicker: { en: 'Putting it together', ar: 'الخلاصة' },
  title: { en: 'One Node = Data + Next', ar: 'الـ Node = Data + Next' },
  visual: visualBox(`
        <div class="flex items-center gap-4">
            <div class="flex rounded-2xl border-[3px] border-brand-purple overflow-hidden node-3d">
                <div class="w-16 h-16 bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm border-r-2 border-brand-purple">Data</div>
                <div class="w-16 h-16 bg-white text-brand-dark flex items-center justify-center font-bold text-sm">Next</div>
            </div>
        </div>
    `),
  body: {
    en: `<p>So a single Node is simply:</p>
         <div class="bg-gray-900 text-white rounded-xl p-5 font-mono text-sm my-3">
            Node<br>&nbsp;&nbsp;Data<br>&nbsp;&nbsp;Next
         </div>
         <p>In plain words: <strong>a value, plus the address of whatever comes next.</strong></p>`,
    ar: `<p>يبقى الـ Node الواحدة عبارة عن:</p>
         <div class="bg-gray-900 text-white rounded-xl p-5 font-mono text-sm my-3" dir="ltr">
            Node<br>&nbsp;&nbsp;Data<br>&nbsp;&nbsp;Next
         </div>
         <p>يعني: <strong>قيمة + عنوان اللي بعدها.</strong></p>`
  }
},
// 9. Node A
{
  kicker: { en: 'Example', ar: 'مثال' },
  title: { en: 'Node A', ar: 'Node A' },
  visual: visualBox(`${headTag('Head')} ${arrowConn('bg-gray-300', true)} ${nodeBox('A', COLOR_A, 'w-16 h-16 text-xl')}`) +
          visualBox(`<div class="text-sm font-mono text-gray-600">Data = A <span class="text-gray-400">(e.g. 10)</span></div>`) +
          visualBox(`<div class="flex items-center gap-3 font-mono text-sm text-gray-600">Next = <span class="text-brand-dark font-bold">0x700</span> <span class="text-gray-400">&rarr; address of Node B</span></div>`),
  body: {
    en: `<p>Node A holds ${c('Data = A')} (say, ${c('10')}).</p>
         <p>Its ${c('Next')} does not literally say "Node B". It stores Node B's <strong>address</strong>, for example ${c('0x700')}.</p>`,
    ar: `<p>Node A فيها ${c('Data = A')} (مثلًا ${c('10')}).</p>
         <p>وكمان ${c('Next')}. الـ Next مش بيقول "Node B"، هو بيخزن <strong>عنوان</strong> Node B، مثلًا ${c('0x700')}.</p>`
  }
},
// 10. Node B
{
  kicker: { en: 'Example', ar: 'مثال' },
  title: { en: 'Node B', ar: 'Node B' },
  visual: visualBox(`${nodeBox('B', COLOR_B, 'w-16 h-16 text-xl')} ${arrowConn(COLOR_B.line)} ${nodeBox('C', COLOR_C, 'w-16 h-16 text-xl')}`) +
          visualBox(`<div class="text-sm font-mono text-gray-600">Data = 20</div>`),
  body: {
    en: `<p>Same idea. Node B holds ${c('Data = 20')}.</p>
         <p>Its ${c('Next')} points to Node C.</p>`,
    ar: `<p>نفس الفكرة. Node B فيها ${c('Data = 20')}.</p>
         <p>وبعدين ${c('Next')} يشاور على Node C.</p>`
  }
},
// 11. Node C
{
  kicker: { en: 'Example', ar: 'مثال' },
  title: { en: 'Node C', ar: 'Node C' },
  visual: visualBox(`${nodeBox('C', COLOR_C, 'w-16 h-16 text-xl')} ${arrowConn('bg-gray-300', true)} ${nullNode('w-12 h-12 text-sm')}`),
  body: {
    en: `<p>Node C has its ${c('Data')}, then ${c('Next')} &mdash; but nothing comes after it.</p>
         <p>So: ${c('Next = NULL')}.</p>`,
    ar: `<p>فيها Data. ثم Next. لكن مفيش بعدها حاجة.</p>
         <p>يبقى ${c('Next = NULL')}.</p>`
  }
},
// 12. What is NULL
{
  kicker: { en: 'A special value', ar: 'قيمة خاصة' },
  title: { en: 'What does NULL mean?', ar: 'يعني إيه NULL؟' },
  visual: visualBox(`${nullNode('w-16 h-16 text-2xl')}`),
  body: {
    en: `<p>${c('NULL')} means "no address." Nothing. It means the list has ended.</p>
         <p>When the program reaches ${c('Node C.Next = NULL')}, it knows: that's it, there are no more nodes.</p>`,
    ar: `<p>NULL معناها "مفيش عنوان". يعني Nothing. يعني انتهت القائمة.</p>
         <p>لما البرنامج يوصل لـ ${c('Node C.Next = NULL')}، هيعرف إن خلاص، مفيش Nodes بعدها.</p>`
  }
},
// 13. Why must last be NULL
{
  kicker: { en: 'A safety rule', ar: 'قاعدة أمان' },
  title: { en: 'Why must the last node be NULL?', ar: 'ليه آخر Node لازم تبقى NULL؟' },
  visual: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div class="flex justify-center mb-3">${nullNode('w-12 h-12 text-sm')}</div>
            <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Next = NULL &mdash; safe stop</div>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
            <div class="text-2xl mb-3">&#9888;&#65039;</div>
            <div class="text-xs font-bold text-rose-600 uppercase tracking-wider font-mono">Next = 0x123 &mdash; crash / garbage</div>
        </div>
    </div>`,
  body: {
    en: `<p>Imagine it wasn't NULL, and instead held a random leftover address, like ${c('Node C.Next = 0x123')}.</p>
         <p>The program would try to follow that address. It might find garbage data, or the program might crash.</p>
         <p>That's why the last node has to explicitly say <strong>"I am the last one"</strong> &mdash; and that's exactly what ${c('NULL')} does.</p>`,
    ar: `<p>تخيل إنها مش NULL، وكان جواها أي Address عشوائي، زي ${c('Node C.Next = 0x123')}.</p>
         <p>البرنامج هيحاول يروح للعنوان ده. ممكن يلاقي Garbage، أو يعمل Crash.</p>
         <p>عشان كده لازم آخر Node تقول <strong>"أنا آخر واحدة"</strong> &mdash; وده بالظبط اللي بتعمله ${c('NULL')}.</p>`
  }
},
// 14. Traversal
{
  kicker: { en: 'Walking the list', ar: 'إزاي نمشي جواها' },
  title: { en: 'How do we traverse a Linked List?', ar: 'إزاي نمشي جوه Linked List؟' },
  visual: visualBox(`
        <div class="flex flex-col items-center mr-1">${headTag('Head')}<div class="w-4 h-4"></div></div>
        <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-gray-400 mb-1">1</span>
            ${nodeBox('A', COLOR_A)}
        </div>
        ${arrowConn(COLOR_A.line)}
        <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-gray-400 mb-1">2</span>
            ${nodeBox('B', COLOR_B)}
        </div>
        ${arrowConn(COLOR_B.line)}
        <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-gray-400 mb-1">3</span>
            ${nodeBox('C', COLOR_C)}
        </div>
        ${arrowConn('bg-gray-300', true)}
        <div class="flex flex-col items-center">
            <span class="text-[10px] font-bold text-gray-400 mb-1">4 &mdash; stop</span>
            ${nullNode()}
        </div>
    `),
  body: {
    en: `<p>We start at ${c('Head')}, which points to Node A. Then ${c('Node A.Next')} takes us to Node B. Then ${c('Node B.Next')} takes us to Node C. Then ${c('Node C.Next')} is ${c('NULL')}, so we stop.</p>
         <p>In other words: the whole movement is about <strong>following pointers</strong>, not jumping between neighboring memory slots.</p>`,
    ar: `<p>بنبدأ من ${c('Head')}، بيشاور على Node A. بعدين ${c('Node A.Next')} يوصلنا لـ Node B. بعدين ${c('Node B.Next')} يوصلنا لـ Node C. بعدين ${c('Node C.Next')} يبقى ${c('NULL')}، فنقف.</p>
         <p>يعني الحركة كلها عبارة عن اتباع مؤشرات (Pointers)، مش بالقفز على عناصر متجاورة في الذاكرة.</p>`
  }
},
// 15. Memory address example
{
  kicker: { en: 'Under the hood', ar: 'تحت السطح' },
  title: { en: 'A memory address example', ar: 'مثال بالأرقام' },
  visual: `
        <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4 overflow-x-auto">
            <table class="w-full text-sm font-mono min-w-[280px]">
                <thead><tr class="text-gray-400 text-xs uppercase"><th class="text-left pb-2">Address</th><th class="text-left pb-2">Data</th></tr></thead>
                <tbody class="text-gray-700">
                    <tr class="border-t border-gray-200"><td class="py-2">1000</td><td class="py-2 font-bold text-orange-600">Node A</td></tr>
                    <tr class="border-t border-gray-200"><td class="py-2">5000</td><td class="py-2 font-bold text-brand-dark">Node B</td></tr>
                    <tr class="border-t border-gray-200"><td class="py-2">2000</td><td class="py-2 font-bold text-teal-600">Node C</td></tr>
                </tbody>
            </table>
        </div>
        ${visualBox(`
            <div class="flex flex-col items-center"><span class="text-[10px] text-gray-400 font-mono mb-1">1000</span>${nodeBox('A', COLOR_A)}</div>
            ${arrowConn(COLOR_A.line)}
            <div class="flex flex-col items-center"><span class="text-[10px] text-gray-400 font-mono mb-1">5000</span>${nodeBox('B', COLOR_B)}</div>
            ${arrowConn(COLOR_B.line)}
            <div class="flex flex-col items-center"><span class="text-[10px] text-gray-400 font-mono mb-1">2000</span>${nodeBox('C', COLOR_C)}</div>
            ${arrowConn('bg-gray-300', true)}
            ${nullNode()}
        `, 'Logical order via Next, despite scattered addresses')}
    `,
  body: {
    en: `<p>Suppose memory looks like this: Node A is at ${c('1000')}, Node B at ${c('5000')}, Node C at ${c('2000')}.</p>
         <p>Notice: ${c('1000, 5000, 2000')} are <strong>not</strong> next to each other. Yet ${c('Node A.Next = 5000')}, ${c('Node B.Next = 2000')}, ${c('Node C.Next = NULL')}.</p>
         <p>So the program can still walk ${c('1000 &rarr; 5000 &rarr; 2000 &rarr; NULL')}, even though the nodes live in completely different, scattered places in memory. This is exactly what <strong>"Independent, Nonconsecutive memory stores"</strong> means: each node exists on its own, and what links them together is the value of ${c('Next')} (the address) &mdash; not their physical position.</p>`,
    ar: `<p>نفترض الذاكرة بالشكل ده: Node A في ${c('1000')}، Node B في ${c('5000')}، Node C في ${c('2000')}.</p>
         <p>لاحظ إن ${c('1000, 5000, 2000')} مش ورا بعض. ومع ذلك ${c('Node A.Next = 5000')}، ${c('Node B.Next = 2000')}، ${c('Node C.Next = NULL')}.</p>
         <p>يبقى البرنامج يقدر يمشي ${c('1000 &larr; 5000 &larr; 2000 &larr; NULL')} رغم إن الأماكن متفرقة تمامًا في الذاكرة. وده سبب الجملة: <strong>"Independent Nonconsecutive memory stores"</strong> &mdash; يعني كل Node موجودة بشكل مستقل، ومش لازم تكون في أماكن متجاورة. اللي بيربطهم ببعض هو قيمة Next (العنوان)، مش مكانهم الفيزيائي.</p>`
  }
},
// 16. Insert
{
  kicker: { en: 'Operation', ar: 'عملية' },
  title: { en: 'Inserting a new node', ar: 'لو حبينا نضيف Node جديدة' },
  visual: `
        ${visualBox(`${nodeBox('A', COLOR_A)} ${arrowConn(COLOR_A.line)} ${nodeBox('B', COLOR_B)} ${arrowConn(COLOR_B.line)} ${nodeBox('C', COLOR_C)}`, 'Before')}
        ${visualBox(`${nodeBox('A', COLOR_A)} ${arrowConn(COLOR_X.line)} ${nodeBox('X', COLOR_X)} ${arrowConn(COLOR_B.line)} ${nodeBox('B', COLOR_B)} ${arrowConn(COLOR_B.line)} ${nodeBox('C', COLOR_C)}`, 'After: insert X between A and B')}
    `,
  body: {
    en: `<p>Say we have ${c('A &rarr; B &rarr; C')} and we want to place ${c('X')} between A and B.</p>
         <p>We create a new node X, set ${c('X.Next = B')}, then ${c('A.Next = X')}.</p>
         <p>Now we have ${c('A &rarr; X &rarr; B &rarr; C')}. <strong>No node ever had to move.</strong></p>`,
    ar: `<p>لو عندنا ${c('A &rarr; B &rarr; C')} وعايزين نحط ${c('X')} بين A و B.</p>
         <p>هنعمل Node جديدة X، نخلي ${c('X.Next = B')}، وبعدين ${c('A.Next = X')}.</p>
         <p>فتبقى ${c('A &rarr; X &rarr; B &rarr; C')}. <strong>ولا احتجنا ننقل أي Node من مكانها.</strong></p>`
  }
},
// 17. Delete
{
  kicker: { en: 'Operation', ar: 'عملية' },
  title: { en: 'Deleting a node', ar: 'ولو شلنا Node؟' },
  visual: `
        ${visualBox(`${nodeBox('A', COLOR_A)} ${arrowConn(COLOR_A.line)} ${nodeBox('B', COLOR_B)} ${arrowConn(COLOR_B.line)} ${nodeBox('C', COLOR_C)}`, 'Before')}
        ${visualBox(`
            ${nodeBox('A', COLOR_A)}
            <div class="flex flex-col items-center mx-1">
                <div class="w-8 sm:w-10 h-1 bg-gray-300 relative -mb-1"><div class="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[7px] border-l-gray-300"></div></div>
                <span class="text-lg leading-none text-gray-300">&times;</span>
            </div>
            <div class="w-16 h-16 rounded-2xl border-[3px] border-dashed border-gray-300 bg-gray-50 text-gray-300 flex items-center justify-center font-bold text-xl flex-shrink-0 line-through">B</div>
            ${arrowConn(COLOR_A.line)}
            ${nodeBox('C', COLOR_C)}
        `, 'After: A points directly to C')}
    `,
  body: {
    en: `<p>Say we have ${c('A &rarr; B &rarr; C')} and want to remove ${c('B')}.</p>
         <p>Instead of ${c('A.Next')} pointing to B, we make it point directly to C.</p>
         <p>Now we have ${c('A &rarr; C')}. Again &mdash; <strong>no node had to move.</strong></p>`,
    ar: `<p>مثلًا ${c('A &rarr; B &rarr; C')} وهنشيل ${c('B')}.</p>
         <p>بدل ما ${c('A.Next')} يشاور على B، هيشاور مباشرة على C.</p>
         <p>فتبقى ${c('A &rarr; C')}. وبرضه ولا نقلنا أي عنصر.</p>`
  }
},
// 18. Summary
{
  kicker: { en: 'Recap', ar: 'ملخص' },
  title: { en: 'Summary', ar: 'ملخص الرسمة' },
  visual: fullChainVisual(true),
  body: {
    en: `<ul class="list-disc list-inside space-y-2">
            <li><strong>Head</strong>: a pointer to the first node.</li>
            <li>Every <strong>Node</strong> has two parts: <strong>Data</strong> (the value) and <strong>Next</strong> (the address of the following node).</li>
            <li>The <strong>last node</strong> must have ${c('Next = NULL')}, so we know the list has ended.</li>
            <li>Nodes <strong>don't need to be next to each other</strong> in memory &mdash; they're linked purely through pointers.</li>
            <li>To reach any element, you must start at <strong>Head</strong> and walk node by node using <strong>Next</strong>.</li>
         </ul>`,
    ar: `<ul class="list-disc list-inside space-y-2">
            <li><strong>Head</strong>: Pointer على أول Node.</li>
            <li>كل <strong>Node</strong> فيها جزئين: <strong>Data</strong> (القيمة) و <strong>Next</strong> (عنوان الـ Node اللي بعدها).</li>
            <li><strong>آخر Node</strong> لازم يكون ${c('Next = NULL')} عشان نعرف إن القائمة انتهت.</li>
            <li>الـ Nodes <strong>مش لازم تكون متجاورة في الذاكرة</strong>؛ الربط بينهم بيتم عن طريق الـ Pointers.</li>
            <li>للوصول لأي عنصر، لازم تبدأ من <strong>Head</strong> وتمشي Node بـ Node باستخدام <strong>Next</strong>.</li>
         </ul>`
  }
},
// 19. Next up
{
  kicker: { en: "What's next", ar: 'الجزء الجاي' },
  title: { en: 'Linked List Operations', ar: 'عمليات الـ Linked List' },
  visual: `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#128269;</div>
            <div class="text-xs font-bold text-brand-dark">Traversal</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#128270;</div>
            <div class="text-xs font-bold text-brand-dark">Find</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#10133;</div>
            <div class="text-xs font-bold text-brand-dark">Insert</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#10134;</div>
            <div class="text-xs font-bold text-brand-dark">Delete</div>
        </div>
    </div>`,
  body: {
    en: `<p>In the next part, we'll cover the core Linked List operations &mdash; <strong>Traversal</strong>, <strong>Find</strong>, <strong>Insert</strong>, <strong>Delete</strong> &mdash; with step-by-step diagrams, understanding exactly what happens in memory for each one.</p>`,
    ar: `<p>في الجزء اللي بعده هنبدأ نشرح عمليات الـ Linked List (<strong>Traversal</strong>، <strong>Find</strong>، <strong>Insert</strong>، <strong>Delete</strong>) برسومات خطوة بخطوة ونفهم كل عملية بتحصل في الذاكرة إزاي.</p>`
  }
},
// 20. Lesson 2 intro
{
  kicker: { en: 'Lesson 2 &middot; Core Operation', ar: 'الدرس الثاني · أهم عملية' },
  title: { en: 'Traversal', ar: 'Traversal (المشي داخل الـ Linked List)' },
  visual: numberChainVisual({ headOn: true }),
  body: {
    en: `<p>Now we start the most important part of Linked Lists: <strong>how do we walk through it (Traversal)?</strong></p>
         <p>Every other operation &mdash; Search, Delete, Insert &mdash; is built on top of this one.</p>
         <p>Suppose we have this list: the first node holds ${c('10')}, then ${c('20')}, then ${c('30')}, then ${c('NULL')}.</p>`,
    ar: `<p>ممتاز. دلوقتي هنبدأ أهم جزء في الـ Linked List، وهو <strong>إزاي نمشي فيها (Traversal)</strong>، لأن كل العمليات التانية (Search - Delete - Insert) مبنية عليه.</p>
         <p>نفترض عندنا الـ List دي: أول Node فيها ${c('10')}، بعدها ${c('20')}، بعدها ${c('30')}، بعدها ${c('NULL')}.</p>`
  }
},
// 21. The problem: no index
{
  kicker: { en: 'The problem', ar: 'أول سؤال' },
  title: { en: 'There is no index', ar: 'مفيش Index' },
  visual: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <div class="font-mono text-lg text-emerald-700 mb-1">arr[2]</div>
            <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Array &mdash; direct access &#10003;</div>
        </div>
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-5 text-center">
            <div class="font-mono text-lg text-rose-400 mb-1 line-through">list[2]</div>
            <div class="text-xs font-bold text-rose-600 uppercase tracking-wider">Linked List &mdash; no index &#10007;</div>
        </div>
    </div>`,
  body: {
    en: `<p>Say I ask you: <strong>give me the last element.</strong></p>
         <p>In an array, that's easy: ${c('arr[2]')} and we're done.</p>
         <p>But here? There's no index. There's no ${c('list[2]')}.</p>
         <p>So what do we do? We have to walk through it <strong>one node at a time</strong>.</p>`,
    ar: `<p>لو قلتلك: <strong>هاتلي آخر عنصر.</strong></p>
         <p>في Array الموضوع سهل: ${c('arr[2]')}. خلصنا.</p>
         <p>لكن هنا؟ مفيش Index. مفيش ${c('list[2]')}.</p>
         <p>يبقى هنعمل إيه؟ لازم نمشي واحدة واحدة.</p>`
  }
},
// 22. Where do we start
{
  kicker: { en: 'Starting point', ar: 'هنبدأ منين؟' },
  title: { en: 'Always from Head', ar: 'دايماً من الـ Head' },
  visual: numberChainVisual({ headOn: true, currentAt: 0 }) + codeBlock(`current = Head;`),
  body: {
    en: `<p>We always start from ${c('Head')}, because it's the only node whose location we actually know.</p>
         <p>So the first step is: ${c('current = Head')}.</p>`,
    ar: `<p>دايماً... من الـ Head. لأن Head هو الوحيد اللي نعرف مكانه.</p>
         <p>يعني أول خطوة: ${c('current = Head')}.</p>`
  }
},
// 23. Why current, not Head
{
  kicker: { en: 'Why a separate pointer?', ar: 'ليه عملنا current؟' },
  title: { en: 'Head must stay put', ar: 'ليه عملنا current؟' },
  visual: codeBlock(
    `<span class="text-rose-400">// &#10007; never do this</span>
Head = Head-&gt;next;`,
    `<span class="text-rose-400">// &#10007; never do this</span>
Head = Head.next;`
  ),
  body: {
    en: `<p>Why not just use ${c('Head')} itself? Because ${c('Head')} must stay fixed.</p>
         <p>If we changed it &mdash; ${codeInline('Head = Head-&gt;next;', 'Head = Head.next;')} &mdash; Head would now point to node 20, and we'd have lost the first element forever.</p>
         <p>Think of it like your home address. Do you erase it every time you step outside? No &mdash; you leave it fixed, and send a <em>person</em> out walking instead. That person is ${c('current')}.</p>`,
    ar: `<p>ليه مش نستخدم Head نفسه؟ لأن Head لازم يفضل ثابت.</p>
         <p>لو غيرناه &mdash; ${codeInline('Head = Head-&gt;next;', 'Head = Head.next;')} &mdash; بقى Head بيشاور على Node 20. وضاع أول عنصر.</p>
         <p>تخيل عندك عنوان بيتك. هل كل مرة تخرج من البيت تمسح العنوان؟ لا. بتسيبه ثابت، وتستخدم شخص ماشي. وده هو ${c('current')}.</p>`
  }
},
// 24. Node* current = Head
{
  kicker: { en: 'Setting it up', ar: 'الإعداد' },
  title: { en: 'A new pointer, starting at Head', ar: 'اعمل Pointer جديد يبدأ من أول Node' },
  visual: numberChainVisual({ headOn: true, currentAt: 0 }) + codeBlock(
    `<span class="text-brand-purple">Node*</span> current = Head;`,
    `<span class="text-brand-purple">Node</span> current = Head;`
  ),
  body: {
    en: `<p>${codeInline('Node* current = Head;', 'Node current = Head;')}</p>
         <p>In plain words: <em>create a new pointer that starts at the first node.</em></p>`,
    ar: `<p>${codeInline('Node* current = Head;', 'Node current = Head;')}</p>
         <p>يعني: <em>اعمل Pointer جديد يبدأ من أول Node.</em></p>`
  }
},
// 25. current at first node, print
{
  kicker: { en: 'Reading data', ar: 'أول Node' },
  title: { en: 'current is on the first node', ar: 'current بيشاور هنا' },
  visual: numberChainVisual({ headOn: true, currentAt: 0 }) + codeBlock(
    `cout &lt;&lt; current-&gt;data;`,
    `System.out.println(current.data);`
  ) + `<div class="bg-gray-900 text-emerald-400 rounded-lg p-3 font-mono text-sm text-center" dir="ltr">10</div>`,
  body: {
    en: `<p>${c('current')} is pointing here. If we print it with ${codeInline('cout &lt;&lt; current-&gt;data;', 'System.out.println(current.data);')}, it prints ${c('10')}.</p>`,
    ar: `<p>current بيشاور هنا. لو عايز أطبعها ${codeInline('cout &lt;&lt; current-&gt;data;', 'System.out.println(current.data);')} هيطبع ${c('10')}.</p>`
  }
},
// 26. Move to next (20)
{
  kicker: { en: 'Moving forward', ar: 'بعدها؟' },
  title: { en: codeText('current = current-&gt;next', 'current = current.next'), ar: codeText('current = current-&gt;next', 'current = current.next') },
  visual: numberChainVisual({ headOn: true, currentAt: 1 }) + codeBlock(`current = current-&gt;next;`, `current = current.next;`),
  body: {
    en: `<p>I want to move to the next node. How? Use ${codeInline('current-&gt;next', 'current.next')}, because ${c('next')} holds the address of what comes after.</p>
         <p>So: ${codeInline('current = current-&gt;next;', 'current = current.next;')}</p>
         <p>Notice: we did <strong>not</strong> change Head. We changed ${c('current')}.</p>`,
    ar: `<p>عايز أروح للـ Node اللي بعدها. إزاي؟ أستخدم ${codeInline('current-&gt;next', 'current.next')}، لأن next فيها عنوان اللي بعدها.</p>
         <p>فنقول: ${codeInline('current = current-&gt;next;', 'current = current.next;')}</p>
         <p>لاحظ. مش غيرنا Head. إحنا غيرنا current.</p>`
  }
},
// 27. print 20
{
  kicker: { en: 'Reading data', ar: 'نطبع القيمة' },
  title: {
    en: `${codeText('current-&gt;data', 'current.data')} is now 20`,
    ar: `${codeText('current-&gt;data', 'current.data')} دلوقتي 20`
  },
  visual: numberChainVisual({ headOn: true, currentAt: 1 }) + codeBlock(
    `cout &lt;&lt; current-&gt;data;`,
    `System.out.println(current.data);`
  ) + `<div class="bg-gray-900 text-emerald-400 rounded-lg p-3 font-mono text-sm text-center" dir="ltr">20</div>`,
  body: {
    en: `<p>If we print ${codeInline('current-&gt;data', 'current.data')} now, it prints ${c('20')}.</p>`,
    ar: `<p>لو طبعنا ${codeInline('current-&gt;data', 'current.data')} هتطلع ${c('20')}.</p>`
  }
},
// 28. move to 30
{
  kicker: { en: 'Moving forward', ar: 'بعدها' },
  title: { en: `One more step: ${codeText('current-&gt;next', 'current.next')}`, ar: 'بعدها' },
  visual: numberChainVisual({ headOn: true, currentAt: 2 }) + codeBlock(`current = current-&gt;next;`, `current = current.next;`) + `<div class="bg-gray-900 text-emerald-400 rounded-lg p-3 font-mono text-sm text-center mt-2" dir="ltr">${codeText('current-&gt;data', 'current.data')} &rarr; 30</div>`,
  body: {
    en: `<p>${codeInline('current = current-&gt;next;', 'current = current.next;')} again, and now ${c('current')} is on the last real node. Printing it gives ${c('30')}.</p>`,
    ar: `<p>${codeInline('current = current-&gt;next;', 'current = current.next;')} تاني، ودلوقتي current بقى على آخر Node حقيقية. لو طبعنا ${codeText('current-&gt;data', 'current.data')} هيطلع ${c('30')}.</p>`
  }
},
// 29. move to NULL
{
  kicker: { en: 'One step too far', ar: 'وبعدها' },
  title: { en: `current becomes ${codeText('NULL', 'null')}`, ar: `current بقى ${codeText('NULL', 'null')}` },
  visual: numberChainVisual({ headOn: true, currentAt: 'null' }) + codeBlock(`current = current-&gt;next;`, `current = current.next;`),
  body: {
    en: `<p>${codeInline('current = current-&gt;next;', 'current = current.next;')} one more time.</p>
         <p>Notice: ${c('current')} is now ${codeInline('NULL', 'null')}.</p>`,
    ar: `<p>${codeInline('current = current-&gt;next;', 'current = current.next;')} تاني.</p>
         <p>لاحظ. current بقى ${codeInline('NULL', 'null')}.</p>`
  }
},
// 30. when do we stop
{
  kicker: { en: 'Stopping condition', ar: 'إمتى نوقف؟' },
  title: { en: `When current becomes ${codeText('NULL', 'null')}`, ar: `أول ما current يبقى ${codeText('NULL', 'null')}` },
  visual: codeBlock(
    `<span class="text-brand-purple">while</span>(current != <span class="text-orange-400">NULL</span>)`,
    `<span class="text-brand-purple">while</span> (current != <span class="text-orange-400">null</span>)`
  ) + codeBlock(
    `<span class="text-brand-purple">while</span>(current)`,
    `<span class="text-gray-500 italic">// Java always requires the explicit check</span>
<span class="text-brand-purple">while</span> (current != <span class="text-orange-400">null</span>)`
  ),
  body: {
    en: `<p>We stop the moment ${c('current')} becomes ${codeInline('NULL', 'null')}.</p>
         <p>That's: ${codeInline('while(current != NULL)', 'while (current != null)')}<span class="code-cpp">, or simply ${codeInline('while(current)')}</span><span class="code-java"> &mdash; Java has no shorthand for this, the explicit check is required.</span></p>
         <p>Each loop: <strong>print the data</strong>, then <strong>go to the next one</strong>.</p>`,
    ar: `<p>أول ما current يبقى ${codeInline('NULL', 'null')}.</p>
         <p>يعني ${codeInline('while(current != NULL)', 'while (current != null)')}<span class="code-cpp"> أو ${codeInline('while(current)')}</span><span class="code-java"> &mdash; في Java مفيش اختصار، لازم نكتب الشرط صريح.</span></p>
         <p>كل لفة: اطبع البيانات، ثم روح للي بعدها.</p>`
  }
},
// 31. Full code
{
  kicker: { en: 'Putting it together', ar: 'الكود الكامل' },
  title: { en: 'The full traversal code', ar: 'الكود الكامل' },
  visual: codeBlock(
    `<span class="text-brand-purple">Node*</span> current = Head;

<span class="text-brand-purple">while</span>(current != <span class="text-orange-400">NULL</span>)
{
    cout &lt;&lt; current-&gt;data &lt;&lt; endl;

    current = current-&gt;next;
}`,
    `<span class="text-brand-purple">Node</span> current = Head;

<span class="text-brand-purple">while</span> (current != <span class="text-orange-400">null</span>) {
    System.out.println(current.data);

    current = current.next;
}`
  ),
  body: {
    en: `<p>This is the most famous piece of code in all of Linked Lists.</p>`,
    ar: `<p>وده أشهر كود في Linked List كلها.</p>`
  }
},
// 32. Step by step recap
{
  kicker: { en: 'Tracing it', ar: 'نمشي عليه خطوة خطوة' },
  title: { en: 'Walking through it, step by step', ar: 'نمشي عليه خطوة خطوة' },
  visual: `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <div class="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-1">Step 1</div>
            <div class="font-mono font-bold text-orange-600 text-lg">10</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-[10px] font-bold text-brand-purple uppercase tracking-wider mb-1">Step 2</div>
            <div class="font-mono font-bold text-brand-dark text-lg">20</div>
        </div>
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
            <div class="text-[10px] font-bold text-teal-500 uppercase tracking-wider mb-1">Step 3</div>
            <div class="font-mono font-bold text-teal-600 text-lg">30</div>
        </div>
        <div class="bg-gray-100 border border-gray-300 rounded-xl p-4 text-center">
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Step 4</div>
            <div class="font-mono font-bold text-gray-500 text-lg">${codeText('NULL', 'null')} &mdash; stop</div>
        </div>
    </div>`,
  body: {
    en: `<p><strong>Start:</strong> current &rarr; 10. Print ${c('10')}, then ${codeInline('current = current-&gt;next;', 'current = current.next;')}</p>
         <p><strong>Second:</strong> current &rarr; 20. Print ${c('20')}, then move on.</p>
         <p><strong>Third:</strong> current &rarr; 30. Print ${c('30')}, then move on.</p>
         <p><strong>Fourth:</strong> current &rarr; ${codeText('NULL', 'null')}. The ${c('while')} stops.</p>`,
    ar: `<p><strong>البداية:</strong> current &larr; 10. يطبع ${c('10')}، ثم ${codeInline('current = current-&gt;next;', 'current = current.next;')}</p>
         <p><strong>الثانية:</strong> current &larr; 20. يطبع ${c('20')}، ثم يكمل.</p>
         <p><strong>الثالثة:</strong> current &larr; 30. يطبع ${c('30')}، ثم يكمل.</p>
         <p><strong>الرابعة:</strong> current &larr; ${codeText('NULL', 'null')}. الـ while تقف.</p>`
  }
},
// 33. Output
{
  kicker: { en: 'Result', ar: 'الناتج' },
  title: { en: 'Output', ar: 'الناتج' },
  visual: codeBlock(`10
20
30`),
  body: {
    en: `<p>That's the full result of the traversal.</p>`,
    ar: `<p>وده الناتج الكامل للـ Traversal.</p>`
  }
},
// 34. Why not current++
{
  kicker: { en: 'A very important question', ar: 'سؤال مهم جدًا' },
  title: { en: "Why can't we do current++?", ar: 'ليه ماينفعش أعمل current++؟' },
  visual: `<div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4 overflow-x-auto">
        <table class="w-full text-sm font-mono min-w-[280px]">
            <thead><tr class="text-gray-400 text-xs uppercase"><th class="text-left pb-2">Node</th><th class="text-left pb-2">Address</th></tr></thead>
            <tbody class="text-gray-700">
                <tr class="border-t border-gray-200"><td class="py-2 font-bold text-orange-600">10</td><td class="py-2">1000</td></tr>
                <tr class="border-t border-gray-200"><td class="py-2 font-bold text-brand-dark">20</td><td class="py-2">50000</td></tr>
                <tr class="border-t border-gray-200"><td class="py-2 font-bold text-teal-600">30</td><td class="py-2">900</td></tr>
            </tbody>
        </table>
    </div>
    <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
        <div class="font-mono text-sm text-rose-500">current++ &rarr; address 1001 &mdash; &#9888;&#65039; probably not a node</div>
    </div>`,
  body: {
    en: `<p>Because the nodes aren't next to each other. Suppose memory looks like this: node ${c('10')} is at address ${c('1000')}, node ${c('20')} at ${c('50000')}, node ${c('30')} at ${c('900')}.</p>
         <p>See? They're not adjacent. So if you did ${c('current++')}, you'd jump to address ${c('1001')} &mdash; which probably has no node at all. The program crashes.</p>
         <p>The only correct way is ${codeInline('current = current-&gt;next;', 'current = current.next;')}, because ${c('next')} holds the real, correct address.</p>`,
    ar: `<p>لأن الـ Nodes مش جنب بعض. افترض إن الذاكرة كده: Node ${c('10')} في العنوان ${c('1000')}، Node ${c('20')} في ${c('50000')}، Node ${c('30')} في ${c('900')}.</p>
         <p>شايفة؟ مش متجاورين. يعني لو عملت ${c('current++')} هتروح للعنوان ${c('1001')}، وده غالبًا مفيهوش Node أصلًا. فالبرنامج هيبوظ.</p>
         <p>الطريقة الوحيدة هي ${codeInline('current = current-&gt;next;', 'current = current.next;')}، لأن next فيها العنوان الصح.</p>`
  }
},
// 35. Treasure hunt analogy
{
  kicker: { en: "An analogy you'll never forget", ar: 'تشبيه يخليك مستحيل تنسى' },
  title: { en: 'The Treasure Hunt', ar: 'Treasure Hunt' },
  visual: `<div class="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
        <div class="text-3xl mb-2">&#128506;&#65039;</div>
        <div class="text-sm text-amber-800 font-medium">Head &rarr; note 1 &rarr; note 2 &rarr; note 3 &rarr; treasure</div>
    </div>`,
  body: {
    en: `<p>Imagine you're in a treasure hunt game. Every note says:</p>
         <p class="italic">"The next treasure is on such-and-such street, house number so-and-so."</p>
         <p>The first note you have is <strong>Head</strong>. You go to the place written on it. You find the next note. That note tells you where the third one is. And so on.</p>
         <p>You never, ever, know the location of the next note by yourself &mdash; each note has to tell you. That's exactly the role of the <strong>Next pointer</strong>.</p>`,
    ar: `<p>تخيلي إنك في لعبة Treasure Hunt. كل ورقة مكتوب عليها:</p>
         <p class="italic">"الكنز اللي بعدي موجود في شارع كذا، بيت رقم كذا."</p>
         <p>أول ورقة معاك هي الـ <strong>Head</strong>. تروحي للمكان المكتوب. تلاقي الورقة التانية. الورقة التانية تقولك مكان التالتة. وهكذا.</p>
         <p>أنتِ عمرك ما تعرفي مكان الورقة اللي بعدها بنفسك، لازم كل ورقة تدلك على اللي بعدها. وده بالظبط هو دور <strong>Next Pointer</strong>.</p>`
  }
},
// 36. Summary
{
  kicker: { en: 'Recap', ar: 'ملخص مهم تحفظيه' },
  title: { en: 'Summary', ar: 'ملخص مهم تحفظيه' },
  visual: numberChainVisual({ headOn: true }),
  body: {
    en: `<ul class="list-disc list-inside space-y-2">
            <li>Any operation on a Linked List starts from <strong>Head</strong>.</li>
            <li>We use a pointer called ${c('current')} so we never change Head.</li>
            <li>We read data via ${codeInline('current-&gt;data', 'current.data')}.</li>
            <li>We move to the next node via ${codeInline('current = current-&gt;next', 'current = current.next')}.</li>
            <li>We repeat until ${codeInline('current == NULL', 'current == null')}.</li>
            <li>Because nodes live in scattered memory locations, <strong>we can never use ${c('current++')}</strong> like we would with an array.</li>
         </ul>`,
    ar: `<ul class="list-disc list-inside space-y-2">
            <li>أي عملية على Linked List بتبدأ من <strong>Head</strong>.</li>
            <li>بنستخدم Pointer اسمه ${c('current')} علشان منغيرش قيمة Head.</li>
            <li>بنقرأ البيانات من ${codeInline('current-&gt;data', 'current.data')}.</li>
            <li>بننتقل للعنصر اللي بعده باستخدام ${codeInline('current = current-&gt;next', 'current = current.next')}.</li>
            <li>بنكرر لحد ما ${codeInline('current == NULL', 'current == null')}.</li>
            <li>لأن الـ Nodes موجودة في أماكن متفرقة في الذاكرة، <strong>مينفعش نستخدم ${c('current++')}</strong> زي الـ Array.</li>
         </ul>`
  }
},
// 37. Teaser next
{
  kicker: { en: "What's next", ar: 'الجزء الجاي' },
  title: { en: 'Find, Insert &amp; Delete', ar: 'Find و Insert و Delete' },
  visual: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-2">
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#128270;</div>
            <div class="text-xs font-bold text-brand-dark">Find (Search)</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#10133;</div>
            <div class="text-xs font-bold text-brand-dark">Insert</div>
        </div>
        <div class="bg-brand-light border border-brand-purple/20 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">&#10134;</div>
            <div class="text-xs font-bold text-brand-dark">Delete</div>
        </div>
    </div>`,
  body: {
    en: `<p>The next part will be <strong>Find (Search)</strong>, and you'll see it's really just Traversal with one extra condition. After that, we'll dive into <strong>Insert</strong> and <strong>Delete</strong>, with step-by-step diagrams.</p>`,
    ar: `<p>الجزء اللي بعده هيكون <strong>Find (البحث)</strong>، وهتشوفي إنه مجرد Traversal مع شرط إضافي، وبعدها هنبدأ ندخل على عمليات <strong>Insert</strong> و <strong>Delete</strong> برسومات خطوة بخطوة.</p>`
  }
},
];

export const LINKED_LIST_LESSONS: Lesson[] = [
  {
    icon: '&#128279;',
    title: { en: 'Linked List Basics', ar: 'أساسيات الـ Linked List' },
    description: {
      en: 'Head, Node, Data, Next, and NULL &mdash; the core building blocks, plus how Insert and Delete work without moving anything in memory.',
      ar: 'Head و Node و Data و Next و NULL &mdash; أساسيات الفكرة، وإزاي عمليات الإضافة والحذف بتتم من غير ما ننقل أي حاجة في الذاكرة.'
    },
    start: 0,
    end: 19
  },
  {
    icon: '&#128694;',
    title: { en: 'Traversal', ar: 'Traversal' },
    description: {
      en: 'How to walk through a linked list node by node using a current pointer &mdash; the operation every other one depends on.',
      ar: 'إزاي تمشي جوه الـ Linked List Node بـ Node باستخدام current &mdash; العملية اللي كل حاجة تانية مبنية عليها.'
    },
    start: 19,
    end: 37
  }
];
