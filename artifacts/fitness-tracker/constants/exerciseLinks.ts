import { Linking } from 'react-native';

const YT = 'https://www.youtube.com/watch?v=';
const SEARCH = 'https://www.youtube.com/results?search_query=how+to+do+';

/** Direct video links for well-known exercises (YouTube video IDs). */
const DIRECT: Record<string, string> = {
  // ── Chest ───────────────────────────────────────────────────────────
  'bench press':               YT + 'dh6yIAuhtDo',
  'bench press paused':        YT + 'dh6yIAuhtDo',
  'incline barbell press':     YT + 'jPLdzuHckI8',
  'incline db press':          YT + '8iPEnn-ltC8',
  'db chest press':            YT + 'QsYre2wEmpg',
  'machine chest press':       YT + 'Z57CtFmRMxA',
  'chest fly machine':         YT + 'Z57CtFmRMxA',
  'pec deck machine':          YT + 'Z57CtFmRMxA',
  'cable fly':                 YT + 'Iwe6AmxVf7o',
  'cable crossover':           YT + 'taI4XduLpTk',
  'push-ups':                  YT + 'IODxDxX7oi4',
  'push-up':                   YT + 'IODxDxX7oi4',
  'dips':                      YT + '2z8JmcrW-As',
  'weighted dips':             YT + '2z8JmcrW-As',
  'dips bench-assisted':       YT + '2z8JmcrW-As',
  'decline bench press':       YT + 'LfyQTbUXWRA',
  'db pullovers':              YT + '0G5MkCYLiqw',
  'ring push-ups':             YT + 'aA8VsEG0fL4',
  'explosive push-ups':        YT + 'IODxDxX7oi4',
  // ── Back ────────────────────────────────────────────────────────────
  'deadlift':                  YT + 'op9kVnSso6Q',
  'barbell row':               YT + 'FWJR5Ve8bnQ',
  'pendlay row':               YT + 'TokPDmQn66I',
  'lat pulldown':              YT + 'CAwf7n6Luuc',
  'lat pulldown wide':         YT + 'CAwf7n6Luuc',
  'seated cable row':          YT + 'GZbfZ033f74',
  'cable row single-arm':      YT + 'GZbfZ033f74',
  'single-arm db row':         YT + 'roCP2zo5bJo',
  'db row':                    YT + 'roCP2zo5bJo',
  'pull-ups':                  YT + 'eGo4IYlbE5g',
  'pull-up':                   YT + 'eGo4IYlbE5g',
  'weighted pull-ups':         YT + 'eGo4IYlbE5g',
  'chin-ups':                  YT + '0fn4G0aVHG0',
  'weighted chin-ups':         YT + '0fn4G0aVHG0',
  'face pull':                 YT + 'V8dZ3zWIone',
  'meadows row':               YT + 'LHMl6bYgpik',
  't-bar row':                 YT + 'j3Cn_F7JMjY',
  'seal row':                  YT + 'qkozXPP5o4A',
  'band pull-apart':           YT + 's-vV__bRCEI',
  'inverted row':              YT + 'LsJfJ7tpAHY',
  'ring rows':                 YT + 'LsJfJ7tpAHY',
  'ring row':                  YT + 'LsJfJ7tpAHY',
  'assisted pull-up band':     YT + 'eGo4IYlbE5g',
  'kipping pull-ups':          YT + 'XB_7En-zf_M',
  'chest-to-bar pull-ups':     YT + 'V8qBMlgJ1Dk',
  'strict chest-to-bar pull-ups': YT + 'V8qBMlgJ1Dk',
  'ctb pull-ups':              YT + 'V8qBMlgJ1Dk',
  'l-pull-ups':                YT + 'IUZJoSP66HI',
  // ── Shoulders ───────────────────────────────────────────────────────
  'overhead press':            YT + '2yjwXTZbDtY',
  'db shoulder press':         YT + 'qEwKCR5JCog',
  'arnold press':              YT + '3ml7BH7mNwQ',
  'lateral raise':             YT + '3VcKaXpzqRo',
  'machine lateral raise':     YT + '3VcKaXpzqRo',
  'cable lateral raise':       YT + '3VcKaXpzqRo',
  'lateral raise drop set':    YT + '3VcKaXpzqRo',
  'front raise':               YT + 'gkh89jgbAR0',
  'barbell shrugs':            YT + 'cJRVVxmytaM',
  'rear delt fly':             YT + 'ea7cNVAr81M',
  'upright row':               YT + 'VG6RQZCLQ9M',
  'push press':                YT + 'iaBVBFB7J_M',
  'snatch-grip high pull':     YT + 'LHMl6bYgpik',
  // ── Biceps ──────────────────────────────────────────────────────────
  'barbell curl':              YT + 'LY1V6UbRHFM',
  'db curl':                   YT + 'av7-8igSXTs',
  'hammer curl':               YT + 'zC3nLlEvin4',
  'cable curl':                YT + 'NFzTWp2qpiE',
  'cable curl single':         YT + 'NFzTWp2qpiE',
  'preacher curl':             YT + '68LmyX8H2kQ',
  'incline db curl':           YT + 'soxrZlIl35U',
  'spider curl':               YT + 'ofLXRLCbHCY',
  'reverse curl':              YT + 'nkNXSGbEqtI',
  // ── Triceps ─────────────────────────────────────────────────────────
  'tricep pushdown':           YT + '2-LAMcpzODU',
  'skull crushers':            YT + 'Oa4fZbxY7oY',
  'overhead tricep extension': YT + 'Ev6NTvJUXxI',
  'close-grip bench press':    YT + 'nEF0bv2FW04',
  'rope pushdown':             YT + 'vB5OHsJ3EME',
  'french press':              YT + 'd_KZxkY_0cM',
  'tate press':                YT + '6kFJEjIPL7c',
  // ── Legs ────────────────────────────────────────────────────────────
  'barbell squat':             YT + 'ultWZbUMPL8',
  'back squat':                YT + 'ultWZbUMPL8',
  'low-bar squat':             YT + 'ultWZbUMPL8',
  'pause squat':               YT + 'XQ-nRjJKNfQ',
  'front squat':               YT + 'm4ytaCJZDoA',
  'goblet squat':              YT + 'MeIiIdhvXT4',
  'box squat':                 YT + 'Rng4_MdlEiE',
  'overhead squat':            YT + 'RD_vUnqwqqI',
  'romanian deadlift':         YT + 'JCXUYuzwNrM',
  'db romanian deadlift':      YT + 'JCXUYuzwNrM',
  'sumo deadlift':             YT + 'oDv-sAL_OEo',
  'db deadlift':               YT + 'op9kVnSso6Q',
  'leg press':                 YT + 'IZxyjW7GUWA',
  'leg press single-leg':      YT + 'IZxyjW7GUWA',
  'leg curl machine':          YT + '1Tq3QdYUuHs',
  'lying leg curl':            YT + '1Tq3QdYUuHs',
  'leg extension':             YT + 'YyvSfVjQeL0',
  'standing calf raise':       YT + 'JbyjNymZAUk',
  'seated calf raise':         YT + 'JbyjNymZAUk',
  'donkey calf raise':         YT + 'JbyjNymZAUk',
  'hip thrust':                YT + 'xDmFkJxPzeM',
  'bulgarian split squat':     YT + '2C-uNgKwPLE',
  'walking lunges':            YT + 'L8fvypPrv9s',
  'jumping lunges':            YT + 'EngIQnPFDak',
  'hack squat':                YT + '0tn5K9NMb14',
  'nordic hamstring curl':     YT + 'DJeFdwJSqCk',
  'box step-ups':              YT + 'dQqApCGd5Ss',
  'box step-up':               YT + 'dQqApCGd5Ss',
  'pistol squats':             YT + 'vqOHHGYKzA4',
  'squat jumps':               YT + 'A-cFYWvaHr0',
  'tuck jumps':                YT + 'A-cFYWvaHr0',
  'single-leg bounds':         YT + 'A-cFYWvaHr0',
  // ── Core ────────────────────────────────────────────────────────────
  'plank':                     YT + 'pSHjTRCQxIw',
  'crunches':                  YT + 'Xyd_fa5zoEU',
  'bird dog':                  YT + 'wiFNA3sqjCA',
  'dead bug':                  YT + '4XLEnwUr1d8',
  'cable crunch':              YT + '2fbujeH3F0E',
  'russian twist':             YT + 'JyUqwkVpsi8',
  'hanging knee raise':        YT + 'Pr1ieGZ5ATk',
  'hanging leg raise':         YT + 'Pr1ieGZ5ATk',
  'ab wheel rollout':          YT + 'AmR0S4XWWNQ',
  'l-sit hold':                YT + 'IUZJoSP66HI',
  'dragon flag':               YT + 'njNkEHHfI84',
  'pallof press':              YT + 'AH_QZLm_0-s',
  'hollow body hold':          YT + 'LlDNef_Ztsc',
  'hollow rocks':              YT + 'LlDNef_Ztsc',
  'superman hold':             YT + 'z6PJMT2y8GQ',
  'toes-to-bar':               YT + '_03pCKOv4l4',
  'toes-to-bar strict':        YT + '_03pCKOv4l4',
  'knees-to-elbows':           YT + '_03pCKOv4l4',
  'ghd sit-ups':               YT + 'Qor-J_9DPmg',
  'ghd sit-up':                YT + 'Qor-J_9DPmg',
  'l-sit':                     YT + 'IUZJoSP66HI',
  // ── Olympic / CrossFit Barbell ───────────────────────────────────────
  'power clean':               YT + '_ozodTU8jAA',
  'hang power clean':          YT + 'YNkPtlxT20M',
  'db hang power clean':       YT + 'YNkPtlxT20M',
  'clean & jerk':              YT + 'uDJGW4XS_jw',
  'clean & jerk complex':      YT + 'uDJGW4XS_jw',
  'squat clean':               YT + 'uDJGW4XS_jw',
  'hang power snatch':         YT + '9hd31uw3oAQ',
  'snatch pull':               YT + 'qbkIjNE8MdQ',
  'clean pull':                YT + 'qbkIjNE8MdQ',
  'snatch balance':            YT + 'qbkIjNE8MdQ',
  'power snatch + ohs':        YT + '9hd31uw3oAQ',
  'split jerk':                YT + '8P18-LyEjbo',
  'push jerk':                 YT + 'rLMQeRSH5JU',
  'db push press':             YT + 'iaBVBFB7J_M',
  'db thruster':               YT + 'qEwKCR5JCog',
  'thrusters':                 YT + 'qEwKCR5JCog',
  'thruster':                  YT + 'qEwKCR5JCog',
  'thruster heavy':            YT + 'qEwKCR5JCog',
  'kb sumo deadlift':          YT + 'op9kVnSso6Q',
  // ── CrossFit Gymnastics ──────────────────────────────────────────────
  'bar muscle-ups':            YT + 'A-jADpBORdw',
  'bar muscle-up progressions': YT + 'A-jADpBORdw',
  'ring muscle-ups':           YT + 'A-jADpBORdw',
  'muscle-up':                 YT + 'A-jADpBORdw',
  'hspu box or wall':          YT + '7gJQiYqPJwI',
  'strict hspu':               YT + '7gJQiYqPJwI',
  'freestanding hspu':         YT + '7gJQiYqPJwI',
  'hspu':                      YT + '7gJQiYqPJwI',
  'ring dips':                 YT + 'eSgX3EI_CbE',
  'pike push-up':              YT + 'sSbZApTdUeM',
  'handstand walk':            YT + '7gJQiYqPJwI',
  'iron cross progressions':   YT + 'A-jADpBORdw',
  // ── Conditioning / CrossFit Metcon ───────────────────────────────────
  'kettlebell swings':         YT + 'Qz7lGbW5hBA',
  'kb swings':                 YT + 'Qz7lGbW5hBA',
  'kb swing':                  YT + 'Qz7lGbW5hBA',
  'kb swings heavy':           YT + 'Qz7lGbW5hBA',
  'wall ball shots':           YT + 'fpUD0mcFp8A',
  'wall ball':                 YT + 'fpUD0mcFp8A',
  'box jumps':                 YT + '52lowfl7oU0',
  'box jump':                  YT + '52lowfl7oU0',
  'box jumps 30+':             YT + '52lowfl7oU0',
  'burpees':                   YT + 'dZgVxmf6jeI',
  'burpee':                    YT + 'dZgVxmf6jeI',
  'burpee box jump-overs':     YT + '52lowfl7oU0',
  'burpee box jump-over':      YT + '52lowfl7oU0',
  'box jump burpees':          YT + 'dZgVxmf6jeI',
  'modified burpee no jump':   YT + 'dZgVxmf6jeI',
  'double-unders':             YT + 'hCuXYrTOMxI',
  'double-under attempts':     YT + 'hCuXYrTOMxI',
  'double-under':              YT + 'hCuXYrTOMxI',
  'double-under practice':     YT + 'hCuXYrTOMxI',
  'jump rope':                 YT + 'hCuXYrTOMxI',
  'jump rope singles':         YT + 'hCuXYrTOMxI',
  'jump rope intervals':       YT + 'hCuXYrTOMxI',
  'med ball slam':             YT + 'JoI8SkB_p4Q',
  'farmer carry':              YT + 'Fkzyi9xgjtA',
  'yoke carry':                YT + 'Fkzyi9xgjtA',
  'sandbag carry':             YT + 'Fkzyi9xgjtA',
  'sled push':                 YT + 'q_SrWNDkIhA',
  'sled push light':           YT + 'q_SrWNDkIhA',
  'sled pull':                 YT + 'q_SrWNDkIhA',
  'bear crawl':                YT + 'dZoMHOmZfpI',
  'row erg':                   YT + 'oxLf8wbUdlw',
  'row erg easy':              YT + 'oxLf8wbUdlw',
  'row erg intervals':         YT + 'oxLf8wbUdlw',
  'row erg 2k tt':             YT + 'oxLf8wbUdlw',
  'rowing machine':            YT + 'oxLf8wbUdlw',
  'open water row sim':        YT + 'oxLf8wbUdlw',
  'row sprints':               YT + 'oxLf8wbUdlw',
  'ski erg intervals':         YT + 'oxLf8wbUdlw',
  'assault bike':              YT + '_H09RobYYMk',
  'assault bike tabata':       YT + '_H09RobYYMk',
  'assault bike sprints':      YT + '_H09RobYYMk',
  'stationary bike':           YT + '_H09RobYYMk',
  'stationary bike easy':      YT + '_H09RobYYMk',
  'bike ride zone 2':          YT + '_H09RobYYMk',
  'bike intervals easy':       YT + '_H09RobYYMk',
  'bike sprints':              YT + '_H09RobYYMk',
  'mountain climbers':         YT + 'C_VtOYc6j5c',
  'mountain climbers':         YT + 'C_VtOYc6j5c',
  'high knees':                YT + '8opcQdC-V-U',
  'high knees low impact':     YT + '8opcQdC-V-U',
  'jumping jacks':             YT + 'iSSAk4XSsRU',
  'lateral shuffles':          YT + 'iSSAk4XSsRU',
  'skaters':                   YT + 'iSSAk4XSsRU',
  'plank jacks':               YT + 'sxiEMUFfM0A',
  'lateral bounds':            YT + 'A-cFYWvaHr0',
  'plyo box intervals':        YT + '52lowfl7oU0',
  'hill sprint repeats':       YT + 'iSSAk4XSsRU',
  'all-out sprint intervals':  YT + 'iSSAk4XSsRU',
  'sprint starts':             YT + 'iSSAk4XSsRU',
  'standing bicycle crunch':   YT + 'Xyd_fa5zoEU',
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

/** Returns a YouTube URL for this exercise name, or a YouTube search URL as fallback. */
export function getExerciseVideoUrl(name: string): string {
  const key = normalize(name);
  if (DIRECT[key]) return DIRECT[key];

  // Try prefix matching (e.g. "Bench Press (Paused)" → "bench press paused" → "bench press")
  for (const k of Object.keys(DIRECT)) {
    if (key.startsWith(k) || k.startsWith(key)) return DIRECT[k];
  }

  // Fallback: YouTube search
  return SEARCH + encodeURIComponent(name);
}

/** Open the video in the YouTube app or browser. */
export async function openExerciseVideo(name: string): Promise<void> {
  const url = getExerciseVideoUrl(name);
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  }
}
