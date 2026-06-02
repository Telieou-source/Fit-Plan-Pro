import { Linking } from 'react-native';

const YT_SEARCH = 'https://www.youtube.com/results?search_query=';

/**
 * Craft a tight search query that reliably surfaces a tutorial video at the top of results.
 * Search URLs never break (unlike hardcoded video IDs) and always stay current.
 */
const SEARCH_QUERIES: Record<string, string> = {
  // ── Chest ────────────────────────────────────────────────────────────
  'bench press':               'how to bench press proper form',
  'bench press paused':        'paused bench press tutorial',
  'incline barbell press':     'incline barbell press technique',
  'incline db press':          'incline dumbbell press how to',
  'db chest press':            'dumbbell chest press tutorial',
  'machine chest press':       'machine chest press how to',
  'chest fly machine':         'chest fly machine proper form',
  'pec deck machine':          'pec deck machine how to',
  'cable fly':                 'cable fly chest tutorial',
  'cable crossover':           'cable crossover chest exercise',
  'push-ups':                  'perfect push up form tutorial',
  'push-up':                   'perfect push up form tutorial',
  'dips':                      'chest dips proper form tutorial',
  'weighted dips':             'weighted dips how to',
  'dips bench-assisted':       'bench dips how to beginners',
  'decline bench press':       'decline bench press form',
  'db pullovers':              'dumbbell pullover exercise tutorial',
  'ring push-ups':             'ring push ups tutorial',
  'explosive push-ups':        'explosive plyometric push ups tutorial',
  // ── Back ─────────────────────────────────────────────────────────────
  'deadlift':                  'how to deadlift proper form',
  'barbell row':               'barbell row proper form tutorial',
  'pendlay row':               'pendlay row how to',
  'lat pulldown':              'lat pulldown proper form tutorial',
  'lat pulldown wide':         'wide grip lat pulldown technique',
  'seated cable row':          'seated cable row proper form',
  'cable row single-arm':      'single arm cable row tutorial',
  'single-arm db row':         'single arm dumbbell row proper form',
  'db row':                    'dumbbell row proper form',
  'pull-ups':                  'how to do pull ups proper form',
  'pull-up':                   'how to do pull ups proper form',
  'weighted pull-ups':         'weighted pull ups how to',
  'chin-ups':                  'chin up proper form tutorial',
  'weighted chin-ups':         'weighted chin ups tutorial',
  'face pull':                 'cable face pull proper form',
  'meadows row':               'meadows row tutorial john meadows',
  't-bar row':                 't bar row proper form tutorial',
  'seal row':                  'seal row tutorial proper form',
  'band pull-apart':           'band pull apart exercise tutorial',
  'inverted row':              'inverted row tutorial bodyweight',
  'ring rows':                 'ring row exercise tutorial',
  'ring row':                  'ring row exercise tutorial',
  'assisted pull-up band':     'band assisted pull ups tutorial',
  'kipping pull-ups':          'crossfit kipping pull ups tutorial',
  'chest-to-bar pull-ups':     'chest to bar pull ups technique',
  'strict chest-to-bar pull-ups': 'strict chest to bar pull ups',
  'ctb pull-ups':              'chest to bar pull ups technique',
  'l-pull-ups':                'l sit pull ups tutorial',
  // ── Shoulders ────────────────────────────────────────────────────────
  'overhead press':            'overhead press proper form tutorial',
  'db shoulder press':         'dumbbell shoulder press form',
  'arnold press':              'arnold press shoulder exercise tutorial',
  'lateral raise':             'lateral raise proper form tutorial',
  'machine lateral raise':     'machine lateral raise tutorial',
  'cable lateral raise':       'cable lateral raise shoulder tutorial',
  'lateral raise drop set':    'lateral raise drop set technique',
  'front raise':               'front raise shoulder exercise',
  'barbell shrugs':            'barbell shrug trap exercise form',
  'rear delt fly':             'rear delt fly proper form',
  'upright row':               'upright row proper form tutorial',
  'push press':                'push press barbell tutorial',
  'snatch-grip high pull':     'snatch grip high pull tutorial',
  // ── Biceps ───────────────────────────────────────────────────────────
  'barbell curl':              'barbell curl bicep proper form',
  'db curl':                   'dumbbell curl bicep form tutorial',
  'hammer curl':               'hammer curl bicep tutorial',
  'cable curl':                'cable bicep curl tutorial',
  'cable curl single':         'single arm cable curl tutorial',
  'preacher curl':             'preacher curl bicep tutorial',
  'incline db curl':           'incline dumbbell curl tutorial',
  'spider curl':               'spider curl bicep exercise tutorial',
  'reverse curl':              'reverse curl forearm bicep tutorial',
  // ── Triceps ──────────────────────────────────────────────────────────
  'tricep pushdown':           'tricep pushdown proper form tutorial',
  'skull crushers':            'skull crusher tricep exercise form',
  'overhead tricep extension': 'overhead tricep extension dumbbell tutorial',
  'close-grip bench press':    'close grip bench press tricep tutorial',
  'rope pushdown':             'rope tricep pushdown exercise tutorial',
  'french press':              'french press tricep exercise tutorial',
  'tate press':                'tate press tricep exercise tutorial',
  // ── Legs ─────────────────────────────────────────────────────────────
  'barbell squat':             'barbell squat proper form tutorial',
  'back squat':                'back squat proper form tutorial',
  'low-bar squat':             'low bar squat tutorial form',
  'pause squat':               'pause squat tutorial powerlifting',
  'front squat':               'front squat proper form tutorial',
  'goblet squat':              'goblet squat beginner tutorial',
  'box squat':                 'box squat proper form tutorial',
  'overhead squat':            'overhead squat tutorial form',
  'romanian deadlift':         'romanian deadlift proper form',
  'db romanian deadlift':      'dumbbell romanian deadlift tutorial',
  'sumo deadlift':             'sumo deadlift proper form tutorial',
  'db deadlift':               'dumbbell deadlift tutorial beginners',
  'leg press':                 'leg press machine proper form',
  'leg press single-leg':      'single leg press machine tutorial',
  'leg curl machine':          'leg curl machine hamstring tutorial',
  'lying leg curl':            'lying leg curl hamstring exercise',
  'leg extension':             'leg extension machine quad tutorial',
  'standing calf raise':       'standing calf raise exercise tutorial',
  'seated calf raise':         'seated calf raise exercise tutorial',
  'donkey calf raise':         'donkey calf raise exercise tutorial',
  'hip thrust':                'barbell hip thrust glute tutorial',
  'bulgarian split squat':     'bulgarian split squat tutorial',
  'walking lunges':            'walking lunge exercise tutorial',
  'jumping lunges':            'jumping lunge plyometric tutorial',
  'hack squat':                'hack squat machine tutorial',
  'nordic hamstring curl':     'nordic hamstring curl tutorial',
  'box step-ups':              'box step up exercise tutorial',
  'box step-up':               'box step up exercise tutorial',
  'pistol squats':             'pistol squat tutorial how to',
  'squat jumps':               'squat jump plyometric tutorial',
  'tuck jumps':                'tuck jump plyometric exercise',
  'single-leg bounds':         'single leg bounds plyometric tutorial',
  // ── Core ─────────────────────────────────────────────────────────────
  'plank':                     'plank exercise proper form tutorial',
  'crunches':                  'crunch exercise proper form ab',
  'bird dog':                  'bird dog exercise core tutorial',
  'dead bug':                  'dead bug exercise core stability',
  'cable crunch':              'cable crunch abs tutorial',
  'russian twist':             'russian twist core exercise tutorial',
  'hanging knee raise':        'hanging knee raise ab tutorial',
  'hanging leg raise':         'hanging leg raise ab tutorial',
  'ab wheel rollout':          'ab wheel rollout tutorial',
  'l-sit hold':                'l sit hold gymnastics tutorial',
  'dragon flag':               'dragon flag exercise tutorial bruce lee',
  'pallof press':              'pallof press core stability tutorial',
  'hollow body hold':          'hollow body hold gymnastics core tutorial',
  'hollow rocks':              'hollow rock exercise gymnastics',
  'superman hold':             'superman hold back extension exercise',
  'toes-to-bar':               'toes to bar crossfit tutorial',
  'toes-to-bar strict':        'strict toes to bar tutorial',
  'knees-to-elbows':           'knees to elbows crossfit tutorial',
  'ghd sit-ups':               'GHD sit ups crossfit tutorial',
  'ghd sit-up':                'GHD sit ups crossfit tutorial',
  'l-sit':                     'l sit tutorial gymnastics rings',
  // ── Olympic / CrossFit Barbell ────────────────────────────────────────
  'power clean':               'power clean barbell tutorial crossfit',
  'hang power clean':          'hang power clean tutorial',
  'db hang power clean':       'dumbbell hang power clean tutorial',
  'clean & jerk':              'clean and jerk olympic lifting tutorial',
  'clean & jerk complex':      'clean and jerk complex tutorial',
  'squat clean':               'squat clean tutorial olympic lifting',
  'hang power snatch':         'hang power snatch tutorial',
  'snatch pull':               'snatch pull olympic lifting tutorial',
  'clean pull':                'clean pull weightlifting tutorial',
  'snatch balance':            'snatch balance tutorial olympic lifting',
  'power snatch + ohs':        'power snatch overhead squat complex tutorial',
  'split jerk':                'split jerk olympic lifting tutorial',
  'push jerk':                 'push jerk barbell tutorial',
  'db push press':             'dumbbell push press tutorial',
  'db thruster':               'dumbbell thruster exercise tutorial',
  'thrusters':                 'barbell thruster crossfit tutorial',
  'thruster':                  'barbell thruster crossfit tutorial',
  'thruster heavy':            'barbell thruster crossfit tutorial',
  'kb sumo deadlift':          'kettlebell sumo deadlift tutorial',
  // ── CrossFit Gymnastics ───────────────────────────────────────────────
  'bar muscle-ups':            'bar muscle up crossfit tutorial',
  'bar muscle-up progressions':'bar muscle up progressions tutorial',
  'ring muscle-ups':           'ring muscle up tutorial crossfit',
  'muscle-up':                 'muscle up crossfit tutorial',
  'hspu box or wall':          'handstand push up box wall tutorial',
  'strict hspu':               'strict handstand push up tutorial',
  'freestanding hspu':         'freestanding handstand push up tutorial',
  'hspu':                      'handstand push up tutorial crossfit',
  'ring dips':                 'ring dips tutorial gymnastics',
  'pike push-up':              'pike push up shoulder exercise tutorial',
  'handstand walk':            'handstand walk tutorial crossfit',
  'iron cross progressions':   'iron cross rings gymnastics progressions',
  // ── Conditioning / CrossFit Metcon ────────────────────────────────────
  'kettlebell swings':         'kettlebell swing proper form tutorial',
  'kb swings':                 'kettlebell swing proper form tutorial',
  'kb swing':                  'kettlebell swing proper form tutorial',
  'kb swings heavy':           'heavy kettlebell swing tutorial',
  'wall ball shots':           'wall ball shot crossfit tutorial',
  'wall ball':                 'wall ball crossfit tutorial',
  'box jumps':                 'box jump crossfit tutorial proper form',
  'box jump':                  'box jump crossfit tutorial proper form',
  'box jumps 30+':             'box jump crossfit tutorial',
  'burpees':                   'burpee exercise proper form tutorial',
  'burpee':                    'burpee exercise proper form tutorial',
  'burpee box jump-overs':     'burpee box jump over crossfit tutorial',
  'burpee box jump-over':      'burpee box jump over crossfit tutorial',
  'box jump burpees':          'burpee box jump tutorial crossfit',
  'modified burpee no jump':   'modified burpee no jump beginner',
  'double-unders':             'double under jump rope tutorial',
  'double-under attempts':     'double under tutorial beginners',
  'double-under':              'double under jump rope tutorial',
  'double-under practice':     'double under jump rope tutorial',
  'jump rope':                 'jump rope tutorial crossfit',
  'jump rope singles':         'jump rope single unders tutorial',
  'jump rope intervals':       'jump rope interval training tutorial',
  'med ball slam':             'medicine ball slam exercise tutorial',
  'farmer carry':              'farmers carry exercise tutorial',
  'yoke carry':                'yoke carry strongman tutorial',
  'sandbag carry':             'sandbag carry exercise tutorial',
  'sled push':                 'sled push exercise tutorial',
  'sled push light':           'sled push exercise tutorial',
  'sled pull':                 'sled pull exercise tutorial',
  'bear crawl':                'bear crawl exercise tutorial',
  'row erg':                   'rowing machine technique tutorial concept2',
  'row erg easy':              'rowing machine form tutorial concept2',
  'row erg intervals':         'rowing machine interval tutorial crossfit',
  'row erg 2k tt':             '2000m rowing technique strategy',
  'rowing machine':            'rowing machine proper technique tutorial',
  'open water row sim':        'rowing machine technique tutorial',
  'row sprints':               'rowing machine sprint intervals tutorial',
  'ski erg intervals':         'ski erg technique intervals tutorial',
  'assault bike':              'assault bike technique tutorial',
  'assault bike tabata':       'assault bike tabata workout tutorial',
  'assault bike sprints':      'assault bike sprint intervals tutorial',
  'stationary bike':           'stationary bike cycling form technique',
  'stationary bike easy':      'stationary bike steady state cardio',
  'bike ride zone 2':          'zone 2 cycling training tutorial',
  'bike intervals easy':       'cycling interval training beginner tutorial',
  'bike sprints':              'cycling sprint intervals tutorial',
  'mountain climbers':         'mountain climbers exercise proper form',
  'high knees':                'high knees cardio exercise tutorial',
  'high knees low impact':     'low impact high knees exercise tutorial',
  'jumping jacks':             'jumping jacks exercise tutorial',
  'lateral shuffles':          'lateral shuffle agility drill tutorial',
  'skaters':                   'skater exercise cardio tutorial',
  'plank jacks':               'plank jacks exercise tutorial',
  'lateral bounds':            'lateral bounds plyometric exercise tutorial',
  'plyo box intervals':        'plyometric box jump intervals tutorial',
  'hill sprint repeats':       'hill sprint training tutorial',
  'all-out sprint intervals':  'sprint interval training tutorial',
  'sprint starts':             'sprint start technique tutorial',
  'standing bicycle crunch':   'standing bicycle crunch core tutorial',
  // ── Aerobics steady state ─────────────────────────────────────────────
  'walking':                   'power walking technique tutorial cardio',
  'easy jog':                  'jogging proper form beginners tutorial',
  'stationary bike easy':      'stationary bike technique beginners',
  'elliptical easy':           'elliptical machine proper form tutorial',
  'swimming easy laps':        'swimming laps technique tutorial',
  'stair walk':                'stair climbing exercise benefits technique',
  'tempo run':                 'tempo run pacing training tutorial',
  'elliptical':                'elliptical machine proper form tutorial',
  'stair climber':             'stair climber machine proper form',
  'long run':                  'long run endurance training tips',
  'long run moderate pace':    'long run aerobic base training',
  'bike ride zone 2':          'zone 2 cycling cardio tutorial',
  'fartlek run':               'fartlek run training tutorial',
  'stair climber moderate':    'stair climber cardio technique',
  // ── Aerobics HIIT ─────────────────────────────────────────────────────
  'walk-jog intervals':        'walk jog interval training beginners',
  'march intervals':           'marching intervals low impact cardio',
  'step-up cardio':            'step up cardio exercise tutorial',
  'swimming intervals':        'swimming interval training tutorial',
  'sprint intervals':          'sprint interval training HIIT tutorial',
  'lateral bounds':            'lateral bounds plyometric exercise tutorial',
  // ── Aerobics functional ───────────────────────────────────────────────
  'march in place':            'march in place cardio exercise tutorial',
  'side step':                 'side step aerobics tutorial',
  'arm circles':               'arm circles shoulder warm up exercise',
  'squat jumps':               'squat jump exercise tutorial plyometric',
  'jumping lunges':            'jump lunge plyometric exercise tutorial',
  'plank jacks':               'plank jacks exercise tutorial',
  'skaters':                   'skater exercise cardio tutorial',
  'box jump burpees':          'box jump burpee crossfit tutorial',
  'tuck jumps':                'tuck jump plyometric tutorial',
  'explosive push-ups':        'plyometric clap push up tutorial',
};

/**
 * Normalise an exercise name for lookup:
 * lowercase, strip text inside parens, collapse whitespace, remove punctuation except hyphens.
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/[^a-z0-9\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns a YouTube search URL for this exercise — always valid, never breaks. */
export function getExerciseVideoUrl(name: string): string {
  const key = normalize(name);

  if (SEARCH_QUERIES[key]) {
    return YT_SEARCH + encodeURIComponent(SEARCH_QUERIES[key]);
  }

  // Try prefix/suffix matching for variants (e.g. "KB Swings (Heavy)" → "kb swings heavy" → "kb swings")
  for (const k of Object.keys(SEARCH_QUERIES)) {
    if (key.startsWith(k) || k.startsWith(key)) {
      return YT_SEARCH + encodeURIComponent(SEARCH_QUERIES[k]);
    }
  }

  // Generic fallback
  return YT_SEARCH + encodeURIComponent('how to do ' + name + ' exercise tutorial');
}

/** Open the YouTube search in the app or browser. */
export async function openExerciseVideo(name: string): Promise<void> {
  const url = getExerciseVideoUrl(name);
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}
