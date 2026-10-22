import { SPRITES } from './sprites.js';

const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ASSETS = Object.create(null);
const AUDIO_ASSETS = Object.create(null);
const AUDIO_FILES = {
  flap: 'sounds/flap.mp3',
  point: 'sounds/point.mp3',
  hit: 'sounds/hit.mp3',
  die: 'sounds/die.mp3',
  button: 'sounds/button.mp3',
  unlock: 'sounds/unlock.mp3',
  squawk: 'sounds/squawk.mp3',
  explosion: 'sounds/explosion.mp3'
};

function loadImage(name, path) {
  const image = new Image();
  image.src = path;
  image.addEventListener('load', () => { ASSETS[name] = image; });
  return image;
}

function loadAssets() {
  loadImage('backgrounds', 'images/backgrounds_sheet.png');
  loadImage('birdsSelect', 'images/birds_select_sheet.png');
  loadImage('birdsFly', 'images/birds_fly_sheet.png');
  loadImage('birdsFly2', 'images/birds_fly_sheet2.png');
  loadImage('pipes', 'images/pipes_sheet.png');
  loadImage('ui', 'images/ui_sheet.png');
  loadImage('effects', 'images/effects_sheet.png');
  loadImage('logo', 'images/logo.png');
  Object.entries(AUDIO_FILES).forEach(([name, path]) => {
    const audio = new Audio(path);
    audio.preload = 'auto';
    AUDIO_ASSETS[name] = audio;
  });
}

function playSound(name, fallbackFrequency) {
  if (!save.sound) return;
  const source = AUDIO_FILES[name];
  if (source) {
    try {
      const sound = new Audio(source);
      sound.preload = 'auto';
      sound.currentTime = 0;
      sound.volume = name === 'button' ? .45 : .7;
      const promise = sound.play();
      if (promise && promise.catch) {
        promise.catch(err => {
          console.warn('Audio playback failed for', name, err);
          tone(fallbackFrequency);
        });
      }
    } catch (err) {
      console.warn('Audio creation failed for', name, err);
      tone(fallbackFrequency);
    }
    return;
  }
  tone(fallbackFrequency);
}

loadAssets();

const W = canvas.width;
const H = canvas.height;
const GROUND = 92;
const birds = [
  { id: 'cockatiel', nameEn: 'Cockatiel', nameAr: 'كوكتيل', unlock: 0, sprite: 5, colors: ['#f2d34d', '#60646a'], factsEn: ['Cockatiels live 15–20 years in captivity and feed mainly on seeds, leafy greens, and fruit.', 'Native to Australia, they use a mobile crest to signal mood and alertness.', 'They have a crop to store food before digestion and prefer a high-fiber diet.', 'These parrots can learn complex whistles and imitate up to 20 words.'], factsAr: ['الكوكتيل يعيش 15-20 سنة في الأسر ويتغذى أساسًا على البذور والخضار الورقية والفواكه.', 'موطنه أستراليا ويستخدم عرفه للتعبير عن الحالة المزاجية وال يقظة.', 'لديه كيس طعام لتخزين الطعام قبل الهضم ويفضل نظامًا غنيًا بالألياف.', 'يمكن لهذا الببغاء تعلم صفارات معقدة وتقليد حتى 20 كلمة.'] },
  { id: 'blue-budgie', nameEn: 'Blue Budgie', nameAr: 'بادجي أزرق', unlock: 20, sprite: 2, colors: ['#74c8e6', '#ebf5f5'], factsEn: ['Budgerigars typically live 5–8 years in the wild and eat grass seeds, shoots, and herbs.', 'Their slender beak is adapted for husking small dry seeds with precision.', 'They are highly social and form large nomadic flocks across open plains.', 'Blue budgies have ultraviolet-reflective plumage important for mate selection.'], factsAr: ['البادجي يعيش عادة 5-8 سنوات في البرية ويتغذى على بذور الأعشاب والبراعم والأعشاب.', 'منقاره النحيف متكيف لتقشير البذور الجافة الدقيقة بدقة.', 'هو اجتماعي للغاية ويشكل أسرابًا رحالة كبيرة عبر السهول المفتوحة.', 'ريشه الأزرق يعكس الضوء فوق البنفسجي وهو مهم في اختيار الزوج.'] },
  { id: 'canary', nameEn: 'Canary', nameAr: 'كناري', unlock: 30, sprite: 7, colors: ['#f6ce47', '#f2a84d'], factsEn: ['Canaries are granivores that eat seeds, greens, and sometimes insects.', 'Wild canaries live 10–12 years and are native to the Macaronesian islands.', 'Male canaries learn and repeat complex song patterns to attract mates.', 'These birds were historically used in coal mines as toxic gas detectors.'], factsAr: ['الكناري يتغذى على البذور والخضروات وأحيانًا الحشرات.', 'يعيش الكاناري البري 10-12 سنة وموطنه جزر الماكارونيز.', 'الذكور تتعلم وتكرر أنماط أغاني معقدة لجذب الأزواج.', 'استُخدم هذا الطائر تاريخيًا في المناجم للكشف عن الغازات السامة.'] },
  { id: 'java-sparrow', nameEn: 'Java Sparrow', nameAr: 'عصفور جاوا', unlock: 45, sprite: 6, colors: ['#4d4e55', '#d7706b'], factsEn: ['Java Sparrows are seed specialists that prefer rice, millet, and grass seeds.', 'They inhabit open grasslands across Southeast Asia and may live 7–10 years.', 'These birds form lifelong pairs and nest in reed or tree cavities.', 'Their stout bill is specially shaped to crack hard seeds and grain husks.'], factsAr: ['عصافير جاوا متخصصة في البذور وتفضل الأرز والدخن وبذور الأعشاب.', 'تسكن السهول العشبية المفتوحة في جنوب شرق آسيا وقد تعيش 7-10 سنوات.', 'تشكل هذه الطيور أزواجًا دائمة وتتعشش في القصب أو تجاويف الأشجار.', 'منقارها القصير متكيف لتكسير البذور الصلبة وقشور الحبوب.'] },
  { id: 'green-budgie', nameEn: 'Green Budgie', nameAr: 'بادجي أخضر', unlock: 65, sprite: 11, colors: ['#8bc746', '#f2d250'], factsEn: ['Green budgies are the wild form of the pet budgie and feed on wild grasses and herbs.', 'Native to arid Australia, they store fat reserves for dry seasons.', 'In the wild they can live around 9 years with steady water access.', 'Their vocal repertoire includes calls used to coordinate large flocks.'], factsAr: ['البادجي الأخضر هو الشكل البري للبادجي الأليف ويتغذى على الأعشاب والأعشاب البرية.', 'موطنه أستراليا الجافة ويخزن احتياطيات دهنية لمواسم الجفاف.', 'في البرية يمكن أن يعيش حوالي 9 سنوات مع توفر الماء.', 'تشمل مجموعه الصوتي نداءات لتنسيق أسراب كبيرة.'] },
  { id: 'rose', nameEn: 'Rose Lovebird', nameAr: 'روز', unlock: 80, sprite: 1, colors: ['#57a73f', '#ef8a36'], factsEn: ['Rose Lovebirds eat seeds, berries, fruits, and leaf buds in African scrubland.', 'They live 10–15 years and form extremely strong pair bonds.', 'Their diet is fiber-rich and they require fresh vegetation daily.', 'They nest in tree hollows or cavities excavated by other animals.'], factsAr: ['طيور الحب الوردية تأكل البذور والتوت والفواكه وبراعم الأوراق في الأدغال الأفريقية.', 'تعيش 10-15 سنة وتشكل روابط زوجية قوية جدًا.', 'نظامها الغذائي غني بالألياف وتحتاج خضروات طازجة يوميًا.', 'تعشش في تجاويف الأشجار أو تجاويف حفرها حيوانات أخرى.'] },
  { id: 'bourke', nameEn: "Bourke's Parakeet", nameAr: 'ببغاء بورك', unlock: 105, sprite: 0, colors: ['#ef777c', '#b84456'], factsEn: ['Bourke’s Parakeets are crepuscular, feeding at dawn and dusk on grass seeds and flowers.', 'They inhabit dry Australian scrubland and live 10–12 years.', 'Their soft rosy plumage provides camouflage in dry grasses.', 'They forage on the ground and in low shrubs for seeds and buds.'], factsAr: ['ببغاوات بورك نشطة عند الفجر والغسق وتتغذى على بذور الأعشاب والزهور.', 'تسكن المناطق الشائكة الجافة في أستراليا وتعيش 10-12 سنة.', 'ريشها الوردية الناعمة يمنحها تمويهًا في الأعشاب الجافة.', 'تبحث عن البذور والبراعم على الأرض وفي الشجيرات المنخفضة.'] },
  { id: 'amazon', nameEn: 'Amazon Parrot', nameAr: 'أمازون', unlock: 125, sprite: 4, colors: ['#62a94e', '#f2d34d'], factsEn: ['Amazon parrots live 40–70 years and eat fruits, nuts, seeds, and leafy vegetation.', 'Their strong, curved beak slices fruit and cracks hard nuts with ease.', 'They nest in tree cavities and defend territories with loud vocal displays.', 'These parrots are among the best vocal learners in the parrot family.'], factsAr: ['الببغاوات الأمازونية تعيش 40-70 سنة وتتغذى على الفواكه والمكسرات والبذور والخضار الورقية.', 'منقارها القوي والمنحني يقطع الفاكهة ويكسر المكسرات الصلبة بسهولة.', 'تعشش في تجاويف الأشجار وتدافع عن أراضيها بصيحات صوتية عالية.', 'هذه الببغاوات من أفضل المتعلمين الصوتيين في عائلة الببغاوات.'] },
  { id: 'blue-macaw', nameEn: 'Blue-and-yellow Macaw', nameAr: 'مكاو أزرق', unlock: 165, sprite: 8, colors: ['#3d8ac5', '#f2bf3e'], factsEn: ['Blue-and-yellow macaws can live over 50 years and eat seeds, nuts, and fruit pulp.', 'Their enormous wingspan lets them glide through rainforest canopy gaps.', 'Their powerful beak can crack Brazil nuts and hard palm seeds.', 'They form long-term pair bonds and forage in family groups.'], factsAr: ['المكاو الأزرق والأصفر يمكن أن يعيش أكثر من 50 سنة ويتغذى على البذور والمكسرات ولب الفاكهة.', 'امتداد أجنحته الضخم يسمح له بالانزلاق عبر فتحات تاج الغابة.', 'منقاره القوي يكسر مكسرات البرازيل وبذور النخيل الصلبة.', 'يشكل روابط زوجية طويلة الأمد ويتغذى ضمن مجموعات عائلية.'] },
  { id: 'scarlet-macaw', nameEn: 'Scarlet Macaw', nameAr: 'مكاو قرمزي', unlock: 195, sprite: 9, colors: ['#e94c38', '#f1c343'], factsEn: ['Scarlet macaws live 40–50 years and eat fruits, nuts, and seeds.', 'Their bright plumage is produced by carotenoid pigments in their diet.', 'They nest in tree cavities and use heavy bills to open tough shells.', 'They are social birds that roost in noisy, communal flocks.'], factsAr: ['المكاو القرمزي يعيش 40-50 سنة ويتغذى على الفواكه والمكسرات والبذور.', 'لون ريشه الزاهي ينتج عن صبغات الكاروتينويد في نظامه الغذائي.', 'تعشش في تجاويف الأشجار وتستخدم منقاراتها الثقيلة لفتح القشور القاسية.', 'هي طيور اجتماعية تنام في أسراب مشتركة صاخبة.'] },
  { id: 'cockatoo', nameEn: 'White Cockatoo', nameAr: 'كوكاتو', unlock: 235, sprite: 3, colors: ['#f8f5e8', '#edc94a'], factsEn: ['White cockatoos can live 40–60 years and eat seeds, berries, nuts, and roots.', 'They display a dramatic crest when excited, alarmed, or courting.', 'Their strong beak digs for tubers and cracks hard seeds.', 'They have advanced cognitive needs and require mental enrichment.'], factsAr: ['الكوكاتو الأبيض يمكن أن يعيش 40-60 سنة ويتغذى على البذور والتوت والمكسرات والجذور.', 'يعرض عرفه الدرامي عند الإثارة أو الإنذار أو التودد.', 'منقاره القوي يحفر للدرنات ويكسر البذور الصلبة.', 'لديه احتياجات معرفية متقدمة ويتطلب تحفيزًا ذهنيًا.'] },
  { id: 'toucan', nameEn: 'Toco Toucan', nameAr: 'طوقان', unlock: 300, sprite: 10, colors: ['#303238', '#f0a83d'], factsEn: ['Toco toucans have oversized bills that help peel fruit and regulate temperature.', 'They eat fruit, insects, and small reptiles in tropical forests.', 'Their bill is surprisingly lightweight despite its large size.', 'They nest in tree cavities and often roost communally with other toucans.'], factsAr: ['الطوقان الطوقي لديه منقار ضخم يساعده على تقشير الفاكهة وتنظيم درجة الحرارة.', 'يتغذى على الفاكهة والحشرات والزواحف الصغيرة في الغابات الاستوائية.', 'منقاره خفيف الوزن بشكل مدهش بالرغم من حجمه الكبير.', 'يعشش في تجاويف الأشجار وغالبًا ما ينام مع طوقانات أخرى.'] }
];
const copy = value => JSON.parse(JSON.stringify(value));
const defaults = { language: 'en', difficulty: 'normal', sound: true, extras: true, selected: 'cockatiel', best: { easy: 0, normal: 0, hard: 0 }, total: 0, plays: 0, squawk: 0, squawkAcquired: false, seenBirds: { cockatiel: true } };
let save = loadSave();
if (!save.seenBirds) save.seenBirds = { [save.selected]: true };
if (!birds.some(bird => bird.id === save.selected)) {
  save.selected = 'cockatiel';
  save.seenBirds = { cockatiel: true };
  localStorage.setItem('flappy-parrots', JSON.stringify(save));
}
let screen = 'menu';
let scroll = 0;
let pointer = { x: -1, y: -1, down: false };
let game = freshGame();
let particles = [];
let previous = performance.now();
let flapFrameTime = 0;

const text = {
  en: { title: 'FLAPPY PARROTS', start: 'START', birds: 'BIRDS', settings: 'SETTINGS', stats: 'STATS', howToPlay: 'HOW TO PLAY', choose: 'CHOOSE YOUR BIRD', back: 'BACK', locked: 'Reach {score}', easy: 'EASY', normal: 'NORMAL', hard: 'HARD', sound: 'SOUND', extras: 'BONUS ITEMS', on: 'ON', off: 'OFF', language: 'العربية', score: 'SCORE', best: 'BEST', tap: 'Tap / Space to fly', paused: 'PAUSED', resume: 'RESUME', menu: 'MENU', over: 'GAME OVER', again: 'PLAY AGAIN', unlocked: 'NEW BIRD UNLOCKED!', total: 'TOTAL SCORE', plays: 'GAMES PLAYED', shield: 'Shield: 5 seconds of safety', bonusStar: 'Risk Star: +3 points', glide: 'Feather: slow fall for 5 seconds', bomb: 'Bomb: destroys 3 pipes and gives +15% speed for 3 seconds', squawk: 'Squawk: collectible once, prevents death once, and pauses for 3 seconds', slow: 'Wind: slows pipes for 4 seconds', guideMove: 'Tap, click, Space, or Up to flap.', guideAvoid: 'Pass through pipe gaps to score.', guideExtras: 'Bonus items are optional and can be disabled in Settings.'},
  ar: { title: 'فلاپي باروتس', start: 'ابدأ', birds: 'الطيور', settings: 'الإعدادات', stats: 'الإحصائيات', howToPlay: 'طريقة اللعب', choose: 'اختر طائرك', back: 'رجوع', locked: 'حقق {score}', easy: 'سهل', normal: 'عادي', hard: 'صعب', sound: 'الصوت', extras: 'العناصر الإضافية', on: 'تشغيل', off: 'إيقاف', language: 'English', score: 'النتيجة', best: 'الأفضل', tap: 'المس الشاشة أو Space للطيران', paused: 'إيقاف مؤقت', resume: 'استمرار', menu: 'القائمة', over: 'انتهت اللعبة', again: 'العب مجددًا', unlocked: 'تم فتح طائر جديد!', total: 'إجمالي النقاط', plays: 'عدد الجولات', shield: 'درع: حماية لمدة 5 ثوانٍ', bonusStar: 'نجمة مخاطرة: +3 نقاط', glide: 'ريشة: سقوط أبطأ لمدة 5 ثوانٍ', bomb: 'قنبلة: تدمر 3 أنابيب وتزيد السرعة 15% لمدة 3 ثوانٍ', squawk: 'صرخة العودة: تمنع الموت مرة واحدة وتتوقف لمدة 3 ثوانٍ ويمكن حمل واحدة فقط', slow: 'رياح: تبطئ الأنابيب 4 ثوانٍ', guideMove: 'المس أو انقر أو اضغط Space أو ↑ للرفرفة.', guideAvoid: 'مر بين فجوات الأنابيب لتحصل على النقاط.', guideExtras: 'العناصر الإضافية اختيارية ويمكن إيقافها من الإعدادات.'}
};
const t = (key, params = {}) => Object.entries(params).reduce((value, [name, replacement]) => value.replace(`{${name}}`, replacement), text[save.language][key] || key);
const isAr = () => save.language === 'ar';

function loadSave() { try { return { ...copy(defaults), ...JSON.parse(localStorage.getItem('flappy-parrots') || '{}'), best: { ...defaults.best, ...(JSON.parse(localStorage.getItem('flappy-parrots') || '{}').best || {}) } }; } catch { return copy(defaults); } }
function persist() { localStorage.setItem('flappy-parrots', JSON.stringify(save)); }
function freshGame() { return { bird: { x: 128, y: 290, vy: 0, rotation: 0 }, pipes: [], items: [], score: 0, elapsed: 0, spawn: 0, trail: 0, shield: 0, glide: 0, bomb: 0, bombQueue: 0, bombFlash: 0, countdown: 0, running: false, dead: false, message: '', fact: '' }; }
function difficulty() { return { easy: { gap: 222, speed: 154, gravity: 1280, flap: -390 }, normal: { gap: 184, speed: 190, gravity: 1560, flap: -430 }, hard: { gap: 150, speed: 236, gravity: 1840, flap: -465 } }[save.difficulty]; }
function selectedBird() { return birds.find(bird => bird.id === save.selected) || birds[0]; }
function selectedBirdFact() { const bird = selectedBird(); const facts = isAr() ? bird.factsAr : bird.factsEn; return facts[Math.floor(Math.random() * facts.length)] || (isAr() ? bird.factAr : bird.factEn); }
function unlocked(bird) { return save.total >= bird.unlock; }
function say(message) { document.querySelector('#liveRegion').textContent = message; }

function tone(frequency, duration = .07, type = 'square') {
  if (!save.sound || !window.AudioContext) return;
  const audio = tone.context || (tone.context = new AudioContext());
  const oscillator = audio.createOscillator(); const gain = audio.createGain();
  oscillator.type = type; oscillator.frequency.value = frequency; gain.gain.setValueAtTime(.05, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
  oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + duration);
}

function startGame() { game = freshGame(); particles = []; game.countdown = 3.1; screen = 'playing'; save.plays++; persist(); say(t('tap')); }
function emitEffect(type, x, y, count = 1) {
  for (let index = 0; index < count; index++) particles.push({ type, x, y, vx: (Math.random() - .5) * 76, vy: (Math.random() - .5) * 70, age: 0, life: .42 + Math.random() * .28, size: 16 + Math.random() * 12 });
}
function updateParticles(dt) {
  particles = particles.filter(particle => { particle.age += dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vx *= Math.pow(.04, dt); particle.vy += 20 * dt; return particle.age < particle.life; });
}
function addItem(type, x, y) { game.items.push({ type, x, y, bob: Math.random() * Math.PI * 2, radius: 16 }); }
function destroyUpcomingPipes(count) {
  let removed = 0;
  game.pipes = game.pipes.filter(pipe => {
    if (removed < count && pipe.x + 58 > game.bird.x) {
      emitEffect('burst', pipe.x + 29, pipe.middle, 10);
      playSound('explosion', 520);
      removed++;
      return false;
    }
    return true;
  });
  return removed;
}
function destroyPreviousPipe() {
  let targetIndex = -1;
  let closestDistance = Infinity;
  game.pipes.forEach((pipe, index) => {
    const distance = game.bird.x - (pipe.x + 58);
    if (distance >= 0 && distance < closestDistance) {
      closestDistance = distance;
      targetIndex = index;
    }
  });
  if (targetIndex < 0) return false;
  const pipe = game.pipes[targetIndex];
  emitEffect('burst', pipe.x + 29, pipe.middle, 8);
  playSound('explosion', 520);
  game.pipes.splice(targetIndex, 1);
  return true;
}
function collectItem(item) {
  if (item.type === 'shield') { game.shield = 5; emitEffect('shield', item.x, item.y, 10); }
  if (item.type === 'star') { game.score += 3; emitEffect('spark', item.x, item.y, 14); playSound('point', 920); }
  if (item.type === 'feather') { game.glide = 5; emitEffect('feather', item.x, item.y, 9); }
  if (item.type === 'bomb') {
    const removed = destroyUpcomingPipes(3);
    game.bombQueue += Math.max(0, 3 - removed);
    game.bomb = 3;
    game.bombFlash = 0.6;
    emitEffect('burst', item.x, item.y, 16);
    emitEffect('spark', item.x, item.y, 14);
    playSound('explosion', 520);
  }
  if (item.type === 'squawk') {
    if (!(save.squawk > 0)) {
      save.squawk = 1;
      save.squawkAcquired = true;
      persist();
      emitEffect('spark', item.x, item.y, 18);
    } else {
      emitEffect('spark', item.x, item.y, 8);
    }
  }
  if (item.type === 'shield' || item.type === 'feather' || item.type === 'squawk') playSound('button', 650);
}
function flap() { if (screen !== 'playing' || game.dead) return; if (game.countdown > 0) { game.countdown = 0; game.running = true; } game.running = true; game.bird.vy = difficulty().flap; flapFrameTime = .12; emitEffect('wind', game.bird.x - 28, game.bird.y + 6, 2); playSound('flap', 520); }
function die() {
  if (game.dead) return;
  if (game.shield > 0) return;
  // if player has a squawk charge, consume it to prevent death once
  if ((save.squawk || 0) > 0) {
    save.squawk = Math.max(0, save.squawk - 1);
    persist();
    destroyUpcomingPipes(1);
    destroyPreviousPipe();
    // pause the game for 3 seconds and play squawk sound
    game.running = false; game.countdown = 3; emitEffect('spark', game.bird.x, game.bird.y, 12); playSound('squawk', 760);
    return;
  }
  game.dead = true; game.running = false; save.best[save.difficulty] = Math.max(save.best[save.difficulty], game.score); save.total += game.score; persist(); game.fact = selectedBirdFact(); emitEffect('burst', game.bird.x, game.bird.y, 8); playSound('hit', 110); window.setTimeout(() => playSound('die', 90), 30); const newly = birds.find(bird => bird.unlock && bird.unlock <= save.total && bird.unlock > save.total - game.score); game.message = newly ? newly : null; if (newly) { emitEffect('spark', W / 2, H / 2, 18); playSound('unlock', 900); } say(t('over'));
}

function update(dt) {
  updateParticles(dt);
  if (flapFrameTime > 0) flapFrameTime = Math.max(0, flapFrameTime - dt);
  if (screen !== 'playing') return;
  if (game.countdown > 0) { game.countdown -= dt; if (game.countdown <= 0) game.running = true; return; }
  if (!game.running || game.dead) return;
  const config = difficulty(); const bird = game.bird;
  game.shield = Math.max(0, game.shield - dt); game.glide = Math.max(0, game.glide - dt);
  bird.vy = Math.min(bird.vy + config.gravity * (game.glide > 0 ? .58 : 1) * dt, 690); bird.y += bird.vy * dt;
  if (game.shield > 0) bird.y = Math.max(17, Math.min(H - GROUND - 17, bird.y));
  const targetRotation = Math.max(-.45, Math.min(1.15, bird.vy / 650)); bird.rotation += (targetRotation - bird.rotation) * (1 - Math.exp(-10 * dt));
  game.trail -= dt; if (game.trail <= 0) { emitEffect('wind', bird.x - 28, bird.y + 8, 1); game.trail = .12; }
  game.spawn -= dt;
  if (game.spawn <= 0) {
    const margin = 82; const middle = margin + Math.random() * (H - GROUND - config.gap - margin * 2) + config.gap / 2; const pipe = { x: W + 42, middle, passed: false };
    if (game.bombQueue > 0) {
      emitEffect('burst', pipe.x + 29, pipe.middle, 12);
      playSound('explosion', 520);
      game.bombQueue -= 1;
    } else {
      game.pipes.push(pipe);
    }
    if (save.extras && Math.random() < .3375) {
      const roll = Math.random();
      let type;
      if (roll < 0.25) type = 'bomb';
      else if (roll < 0.50 && !save.squawkAcquired) type = 'squawk';
      else if (roll < 0.70) type = 'star';
      else if (roll < 0.90) type = 'shield';
      else type = 'feather';
      if (!type) type = 'star';
      const edgeOffset = type === 'star' ? (Math.random() < .5 ? -1 : 1) * (config.gap / 2 - 34) : (Math.random() - .5) * (config.gap * .36);
      addItem(type, pipe.x + 96, middle + edgeOffset);
    }
    game.spawn = 0.95;
  }
  const shieldBoost = game.shield > 0 ? 1.4 : 1;
  const bombBoost = game.bomb > 0 ? 1.15 : 1;
  const speed = config.speed * shieldBoost * bombBoost;
  for (const pipe of game.pipes) { pipe.x -= speed * dt; if (!pipe.passed && pipe.x + 58 < bird.x) { pipe.passed = true; game.score++; emitEffect('spark', pipe.x + 28, bird.y, 6); playSound('point', 780); } }
  game.items = game.items.filter(item => {
    item.x -= speed * dt; item.bob += dt * 5;
    if (Math.hypot(item.x - bird.x, item.y - bird.y) < item.radius + 15) { collectItem(item); return false; }
    return item.x > -40;
  });
  game.bomb = Math.max(0, game.bomb - dt);
  game.bombFlash = Math.max(0, game.bombFlash - dt);
  game.pipes = game.pipes.filter(pipe => pipe.x > -70);
  const hit = { x: bird.x - 16, y: bird.y - 13, w: 32, h: 29 };
  if (game.shield <= 0 && (hit.y < 0 || hit.y + hit.h > H - GROUND || game.pipes.some(pipe => hit.x < pipe.x + 58 && hit.x + hit.w > pipe.x && (hit.y < pipe.middle - config.gap / 2 || hit.y + hit.h > pipe.middle + config.gap / 2)))) die();
}

function rect(x, y, w, h, color, border = null) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); if (border) { ctx.strokeStyle = border; ctx.lineWidth = 3; ctx.strokeRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); } }
function label(value, x, y, size = 24, color = '#fff', align = 'center') { ctx.save(); ctx.font = `700 ${size}px ${isAr() ? 'Tajawal' : 'Pixelify Sans'}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(value, x, y); ctx.restore(); }
function drawWrappedText(text, x, y, maxWidth, lineHeight, size = 18, color = '#fff', align = 'center') {
  ctx.save(); ctx.font = `700 ${size}px ${isAr() ? 'Tajawal' : 'Pixelify Sans'}`; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'top';
  const words = text.split(' ');
  let line = '';
  let lineY = y;
  for (let word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, lineY);
  ctx.restore();
}
function button(item, x, y, width = 250, height = 53, variant = 'gold') {
  const hover = pointer.x >= x && pointer.x <= x + width && pointer.y >= y && pointer.y <= y + height;
  const source = SPRITES.ui[`${variant}Button`] || SPRITES.ui.goldButton;
  if (ASSETS.ui) { ctx.globalAlpha = hover ? 1 : .92; ctx.drawImage(ASSETS.ui, source.x, source.y, source.width, source.height, x, y, width, height); ctx.globalAlpha = 1; }
  else { rect(x, y + 5, width, height, '#a96b22'); rect(x, y, width, height, hover ? '#ffe16b' : '#ffd24a', '#633e18'); }
  label(item, x + width / 2, y + height / 2, Math.min(25, height * .5), '#392310');
  return hover && pointer.down;
}
function drawSky() {
  const phase = Math.floor(game.score / 20) % 3;
  const progress = game.score % 20;
  const blend = progress >= 15 ? (progress - 15) / 5 : 0;
  const nextPhase = (phase + 1) % 3;
  const source = SPRITES.backgrounds;
  if (ASSETS.backgrounds) {
    ctx.save();
    ctx.globalAlpha = 1 - blend;
    ctx.drawImage(ASSETS.backgrounds, source.x + source.width * phase, source.y, source.width, source.height, 0, 0, W, H);
    if (blend > 0) {
      ctx.globalAlpha = blend;
      ctx.drawImage(ASSETS.backgrounds, source.x + source.width * nextPhase, source.y, source.width, source.height, 0, 0, W, H);
    }
    ctx.restore();
    return;
  }
  const skyColors = [['#68d6ff', '#b5edff'], ['#f29473', '#f4bd7c'], ['#1c315b', '#263764']];
  const drawGradient = (colors) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
  };
  ctx.save();
  ctx.globalAlpha = 1 - blend;
  drawGradient(skyColors[phase]);
  if (blend > 0) {
    ctx.globalAlpha = blend;
    drawGradient(skyColors[nextPhase]);
  }
  ctx.restore();
}
function drawGround() {
  if (ASSETS.backgrounds) return;
  rect(0, H - GROUND, W, GROUND, '#c7a65a'); rect(0, H - GROUND, W, 15, '#69b85a'); rect(0, H - GROUND + 14, W, 7, '#387d42');
}
function drawPipe(pipe) {
  const gap = difficulty().gap; const top = pipe.middle - gap / 2; const bottom = pipe.middle + gap / 2;
  if (ASSETS.pipes) {
    const sourceX = SPRITES.pipes.colors[save.difficulty]; const { cap, shaft } = SPRITES.pipes;
    ctx.drawImage(ASSETS.pipes, sourceX + shaft.offsetX, shaft.y, shaft.width, shaft.height, pipe.x, 0, 58, top);
    ctx.drawImage(ASSETS.pipes, sourceX + shaft.offsetX, shaft.y, shaft.width, shaft.height, pipe.x, bottom, 58, H - GROUND - bottom);
    ctx.save(); ctx.translate(pipe.x + 29, top); ctx.scale(1, -1); ctx.drawImage(ASSETS.pipes, sourceX, cap.y, cap.width, cap.height, -37, 0, 74, 37); ctx.restore();
    ctx.drawImage(ASSETS.pipes, sourceX, cap.y, cap.width, cap.height, pipe.x - 8, bottom, 74, 37);
    return;
  }
  const pipeColor = save.difficulty === 'hard' ? '#e6a93b' : save.difficulty === 'easy' ? '#4f9fd2' : '#54b65b';
  for (const [y, h, capY] of [[0, top, top - 18], [bottom, H - GROUND - bottom, bottom]]) { rect(pipe.x, y, 58, h, pipeColor, '#28683b'); rect(pipe.x - 7, capY, 72, 18, pipeColor, '#28683b'); rect(pipe.x + 10, y, 8, h, '#8ee07a'); }
}
function trimmedSource(sheet, source, cacheKey) {
  if (ASSETS[cacheKey]) return ASSETS[cacheKey];
  const buffer = document.createElement('canvas'); buffer.width = source.width; buffer.height = source.height;
  const bufferContext = buffer.getContext('2d', { willReadFrequently: true }); bufferContext.drawImage(sheet, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  const data = bufferContext.getImageData(0, 0, source.width, source.height).data;
  let left = source.width, top = source.height, right = -1, bottom = -1;
  for (let y = 0; y < source.height; y++) for (let x = 0; x < source.width; x++) if (data[(y * source.width + x) * 4 + 3] > 10) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  const padding = 2;
  const trimmed = right < 0 ? source : { x: source.x + Math.max(0, left - padding), y: source.y + Math.max(0, top - padding), width: Math.min(source.width - Math.max(0, left - padding), right - left + 1 + padding * 2), height: Math.min(source.height - Math.max(0, top - padding), bottom - top + 1 + padding * 2) };
  ASSETS[cacheKey] = trimmed; return trimmed;
}
function drawEffectFromSheet(source, x, y, w, h, round = true) {
  if (!ASSETS.effects) return;
  ctx.save();
  if (round) {
    const cx = x + w / 2; const cy = y + h / 2; const r = Math.min(w, h) / 2;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
  }
  ctx.drawImage(ASSETS.effects, source.x, source.y, source.width, source.height, x, y, w, h);
  ctx.restore();
}
function drawBird(x, y, rotation = 0, scale = 1, selection = false) {
  const bird = selectedBird(); const index = bird.sprite;
  const sheet = selection ? ASSETS.birdsSelect : flapFrameTime > 0 ? ASSETS.birdsFly2 : ASSETS.birdsFly;
  if (sheet) {
    const cacheKey = `${selection ? 'select' : flapFrameTime > 0 ? 'fly2' : 'fly'}-${index}`;
    let sprite = ASSETS[cacheKey];
    if (!sprite) {
      const rawSource = selection ? SPRITES.birds.select.rects[index] : SPRITES.birds.fly.rects[index];
      const source = trimmedSource(sheet, rawSource, `bird-bounds-${selection ? 'select' : 'fly'}-${index}`);
      sprite = document.createElement('canvas'); sprite.width = 148; sprite.height = 148;
      const spriteContext = sprite.getContext('2d', { willReadFrequently: true }); spriteContext.imageSmoothingEnabled = false;
      const ratio = Math.min(134 / source.width, 134 / source.height); const width = source.width * ratio; const height = source.height * ratio;
      spriteContext.drawImage(sheet, source.x, source.y, source.width, source.height, (148 - width) / 2, (148 - height) / 2, width, height);
      ASSETS[cacheKey] = sprite;
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(scale, scale);
    ctx.drawImage(sprite, -37, -37, 74, 74);
    ctx.restore();
    return;
  }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.scale(scale, scale); ctx.fillStyle = bird.colors[0]; ctx.beginPath(); ctx.ellipse(0, 0, 23, 18, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = bird.colors[1]; ctx.beginPath(); ctx.ellipse(-7, 4, 14, 9, -.45, 0, Math.PI * 2); ctx.fill(); rect(16, -5, 13, 8, '#f2b445', '#a3582e'); rect(4, -13, 5, 5, '#1d2733'); ctx.restore();
}
function drawParticles() {
  for (const particle of particles) {
    const source = SPRITES.effects[particle.type]; const progress = particle.age / particle.life; const opacity = (1 - progress) * (1 - progress); const size = particle.size * (.55 + progress * .7);
    ctx.save(); ctx.globalAlpha = opacity;
    if (ASSETS.effects && source) drawEffectFromSheet(source, particle.x - size / 2, particle.y - size / 2, size, size, true);
    else { ctx.fillStyle = '#ffe15d'; ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4); }
    ctx.restore();
  }
}
function drawItem(item) {
  const source = SPRITES.effects[item.type === 'star' ? 'star' : item.type]; const size = item.type === 'shield' ? 38 : 31; const y = item.y + Math.sin(item.bob) * 5;
  ctx.save(); ctx.globalAlpha = .95;
  if (ASSETS.effects && source) drawEffectFromSheet(source, item.x - size / 2, y - size / 2, size, size, true);
  else { ctx.fillStyle = '#ffe15d'; ctx.beginPath(); ctx.arc(item.x, y, 12, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function drawBuffs() {
  let x = 22;
  if (game.bomb > 0) {
    const source = SPRITES.effects.bomb;
    if (ASSETS.effects && source) drawEffectFromSheet(source, x, 92, 24, 24, true);
    label(`${game.bomb.toFixed(1)}s`, x + 37, 105, 14, '#ffcc7f', 'left'); x += 88;
  }
  if ((save.squawk || 0) > 0) {
    const source = SPRITES.effects.squawk;
    if (ASSETS.effects && source) drawEffectFromSheet(source, x, 92, 24, 24, true);
    label(`x${save.squawk}`, x + 37, 105, 14, '#ffd8d8', 'left'); x += 88;
  }
  const buffs = [['shield', game.shield, '#b680ff'], ['feather', game.glide, '#c7efff']];
  buffs.forEach(([type, time, color]) => { if (time <= 0) return; const source = SPRITES.effects[type]; if (ASSETS.effects && source) drawEffectFromSheet(source, x, 92, 24, 24, true); label(`${time.toFixed(1)}s`, x + 37, 105, 14, color, 'left'); x += 88; });
}
function drawShield() {
  if (game.shield <= 0) return;
  const pulse = 39 + Math.sin(scroll * .16) * 3; const source = SPRITES.effects.shield;
  ctx.save(); ctx.globalAlpha = .48 + Math.sin(scroll * .15) * .14;
  if (ASSETS.effects) drawEffectFromSheet(source, game.bird.x - pulse, game.bird.y - pulse, pulse * 2, pulse * 2, true);
  else { ctx.strokeStyle = '#a776ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(game.bird.x, game.bird.y, pulse - 5, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function drawFooter() { label('Mostafa Alazazy 2026 · All rights preserved', W / 2, H - 39, 12, '#f7edc1'); }
function drawBombFlash() {
  const source = SPRITES.effects.bomb;
  if (!ASSETS.effects) return;
  const scale = 1 + (0.6 - game.bombFlash) * 1.2;
  ctx.save(); ctx.globalAlpha = game.bombFlash * 0.85;
  drawEffectFromSheet(source, game.bird.x - 48 * scale, game.bird.y - 48 * scale, 96 * scale, 96 * scale, true);
  ctx.restore();
}
function drawGame() { drawSky(); game.pipes.forEach(drawPipe); drawGround(); game.items.forEach(drawItem); drawBird(game.bird.x, game.bird.y, game.bird.rotation); drawShield(); if (game.bombFlash > 0) drawBombFlash(); drawParticles(); label(String(game.score), W / 2, 66, 48); drawBuffs(); if (game.countdown > 0) label(String(Math.ceil(game.countdown)), W / 2, H / 2, 72, '#ffe156'); if (!game.running && !game.dead && game.countdown <= 0) label(t('tap'), W / 2, H - GROUND - 34, 18); if (game.dead) drawGameOver(); }
function drawGameOver() {
  rect(56, 132, 368, 430, '#274359', '#152839'); label(t('over'), W / 2, 174, 38, '#ffe156'); label(`${t('score')}: ${game.score}`, W / 2, 225, 25); label(`${t('best')}: ${save.best[save.difficulty]}`, W / 2, 261, 23, '#ffe156');
  drawWrappedText(game.fact || selectedBirdFact(), W / 2, 295, 320, 20, 16, '#dce4ff', 'center');
  const medal = game.score >= 40 ? '#7de8f1' : game.score >= 25 ? '#f4c94d' : game.score >= 10 ? '#c9c4bb' : '#c17d47'; ctx.fillStyle = medal; ctx.beginPath(); ctx.arc(W / 2, 382, 36, 0, Math.PI * 2); ctx.fill(); label('★', W / 2, 383, 38, '#fff');
  if (game.message) { label(t('unlocked'), W / 2, 430, 20, '#7ce37f'); label(isAr() ? game.message.nameAr : game.message.nameEn, W / 2, 455, 18); }
  if (button(t('again'), 116, 483, 248, 46, 'green')) startGame();
  if (button(t('menu'), 116, 541, 248, 46, 'blue')) { game = freshGame(); particles = []; screen = 'menu'; playSound('button', 650); }
}
function drawMenu() {
  drawSky(); drawGround(); if (ASSETS.logo) ctx.drawImage(ASSETS.logo, 100, 8, 280, 184); else label(t('title'), W / 2, 80, 45, '#fff2a5');
  const creditX = W / 2;
  const creditY = 201;
  const creditWidth = 260;
  const creditHeight = 32;
  rect(creditX - creditWidth / 2, creditY - creditHeight / 2, creditWidth, creditHeight, 'rgba(0,0,0,0.58)', '#ffffff');
  label('by Mostafa Alazazy', creditX, creditY, 16, '#fff');
  drawBird(W / 2, 245 + Math.sin(scroll * .004) * 5, 0, 1.05); label(`${t('best')}: ${save.best[save.difficulty]}`, W / 2, 291, 19, '#fff');
  if (button(t('start'), 115, 316, 250, 44, 'green')) startGame();
  if (button(t('birds'), 115, 365, 250, 44, 'blue')) screen = 'birds';
  if (button(t('howToPlay'), 115, 414, 250, 44)) screen = 'howto';
  if (button(t('settings'), 115, 463, 250, 44, 'gold')) screen = 'settings';
  if (button(t('stats'), 115, 512, 250, 44, 'red')) screen = 'stats';
  drawFooter();
}
function drawBirds() {
  drawSky(); rect(22, 26, 436, 640, '#28455c', '#173044'); label(t('choose'), W / 2, 59, 29, '#ffe156');
  const columns = 3, startY = 94;
  birds.forEach((bird, index) => {
    const column = index % columns; const row = Math.floor(index / columns); const x = 42 + column * 137, y = startY + row * 124;
    const available = unlocked(bird); const selected = bird.id === save.selected;
    rect(x, y, 116, 106, available ? '#5c86a4' : '#3a4d5c', selected ? '#ffe156' : '#203c53');
    const current = save.selected; save.selected = bird.id; drawBird(x + 57, y + 38, 0, .7, true); save.selected = current;
    if (!available && ASSETS.ui) ctx.drawImage(ASSETS.ui, SPRITES.ui.lock.x, SPRITES.ui.lock.y, SPRITES.ui.lock.width, SPRITES.ui.lock.height, x + 42, y + 24, 32, 30);
    if (selected && ASSETS.ui) ctx.drawImage(ASSETS.ui, SPRITES.ui.check.x, SPRITES.ui.check.y, SPRITES.ui.check.width, SPRITES.ui.check.height, x + 86, y + 7, 23, 23);
    const name = isAr() ? bird.nameAr : bird.nameEn;
    const nameSize = name.length > 15 ? 11 : name.length > 11 ? 12 : 14;
    label(available ? name : t('locked', { score: bird.unlock }), x + 58, y + 80, available ? nameSize : 12, available ? '#fff' : '#becbd6');
    if (available && pointer.down && pointer.x >= x && pointer.x <= x + 116 && pointer.y >= y && pointer.y <= y + 106) {
      if (save.selected !== bird.id) {
        if (!save.seenBirds?.[bird.id]) { save.seenBirds = { ...save.seenBirds, [bird.id]: true }; playSound('unlock', 900); }
        else { playSound('button', 650); }
        save.selected = bird.id; persist();
      }
    }
  });
  if (button(t('back'), 115, 628)) screen = 'menu';
}
function drawSettings() {
  drawSky(); rect(48, 86, 384, 515, '#28455c', '#173044'); label(t('settings'), W / 2, 125, 36, '#ffe156');
  label(t('language'), W / 2, 176, 21); if (button(isAr() ? 'العربية ✓' : 'English ✓', 115, 194, 250, 42, 'blue')) { save.language = save.language === 'en' ? 'ar' : 'en'; document.documentElement.lang = save.language; document.documentElement.dir = isAr() ? 'rtl' : 'ltr'; persist(); playSound('button', 620); }
  label(t('sound'), W / 2, 259, 21); if (button(save.sound ? t('on') : t('off'), 115, 277, 250, 42, 'gold')) { save.sound = !save.sound; persist(); if (save.sound) playSound('button', 620); }
  label(t('extras'), W / 2, 342, 21); if (button(save.extras ? t('on') : t('off'), 115, 360, 250, 42, 'green')) { save.extras = !save.extras; persist(); playSound('button', 620); }
  label(`${t('easy')} / ${t('normal')} / ${t('hard')}`, W / 2, 431, 18); ['easy', 'normal', 'hard'].forEach((level, index) => { if (button(`${t(level)}${save.difficulty === level ? ' ✓' : ''}`, 65 + index * 120, 449, 110, 42, level === 'hard' ? 'red' : level === 'easy' ? 'green' : 'blue')) { save.difficulty = level; persist(); playSound('button', 620); } });
  if (button(t('back'), 115, 515, 250, 44, 'gold')) screen = 'menu'; drawFooter();
}
function drawGuideRow(type, y, labelKey) {
  const source = SPRITES.effects[type]; if (ASSETS.effects && source) drawEffectFromSheet(source, 72, y - 16, 32, 32, true);
  label(t(labelKey), 118, y, 15, '#fff8dc', 'left');
}
function drawHowToPlay() {
  drawSky(); rect(34, 48, 412, 575, '#28455c', '#173044'); label(t('howToPlay'), W / 2, 86, 35, '#ffe156');
  drawWrappedText(t('guideMove'), W / 2, 118, 360, 20, 16, '#fff8dc', 'center');
  drawWrappedText(t('guideAvoid'), W / 2, 142, 360, 20, 16, '#fff8dc', 'center');
  drawGuideRow('shield', 222, 'shield'); drawGuideRow('star', 270, 'bonusStar'); drawGuideRow('bomb', 318, 'bomb'); drawGuideRow('squawk', 366, 'squawk'); drawGuideRow('feather', 414, 'glide');
  drawWrappedText(t('guideExtras'), W / 2, 447, 360, 20, 15, '#e7f4ff', 'center');
  drawWrappedText(isAr() ? 'الخلفيات تتبدل كل 20 نقطة' : 'Backgrounds loop every 20 points', W / 2, 495, 360, 18, 15, '#fff8dc', 'center');
  if (button(t('back'), 115, 535, 250, 44, 'gold')) screen = 'menu'; drawFooter();
}
function drawStats() { drawSky(); rect(63, 163, 354, 324, '#28455c', '#173044'); label(t('stats'), W / 2, 204, 36, '#ffe156'); label(`${t('total')}: ${save.total}`, W / 2, 269, 25); label(`${t('plays')}: ${save.plays}`, W / 2, 310, 25); label(`${t('birds')}: ${birds.filter(unlocked).length}/${birds.length}`, W / 2, 351, 25); label(`${t('easy')}: ${save.best.easy}`, W / 2, 393, 19); label(`${t('normal')}: ${save.best.normal}`, W / 2, 422, 19); label(`${t('hard')}: ${save.best.hard}`, W / 2, 451, 19); if (button(t('back'), 115, 525)) screen = 'menu'; drawFooter(); }
function draw() { scroll += 1; if (screen === 'playing') drawGame(); else if (screen === 'birds') drawBirds(); else if (screen === 'settings') drawSettings(); else if (screen === 'stats') drawStats(); else if (screen === 'howto') drawHowToPlay(); else drawMenu(); }
function frame(now) { const dt = Math.min(.033, (now - previous) / 1000); previous = now; update(dt); draw(); pointer.down = false; requestAnimationFrame(frame); }
function coords(event) { const bound = canvas.getBoundingClientRect(); return { x: (event.clientX - bound.left) * W / bound.width, y: (event.clientY - bound.top) * H / bound.height }; }
canvas.addEventListener('pointerdown', event => { pointer = { ...coords(event), down: true }; if (screen === 'playing' && !game.dead) flap(); });
canvas.addEventListener('pointermove', event => { pointer = { ...pointer, ...coords(event) }; });
window.addEventListener('keydown', event => { if (['Space', 'ArrowUp'].includes(event.code)) { event.preventDefault(); if (screen === 'playing') flap(); else if (screen === 'menu') startGame(); } if (event.code === 'Escape' && screen === 'playing' && !game.dead) game.running = !game.running; });
requestAnimationFrame(frame);
