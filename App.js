import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ─── Themes ──────────────────────────────────────────────────────────────────

const DARK = {
  background: '#060A13',
  surface: '#0D1520',
  surfaceSoft: '#162030',
  primary: '#5EEAD4',
  primaryStrong: '#2DD4BF',
  primaryGlow: 'rgba(94, 234, 212, 0.1)',
  primaryBorder: 'rgba(94, 234, 212, 0.25)',
  onPrimary: '#060A13',
  text: '#F1F5F9',
  textMuted: '#64748B',
  border: '#1A2740',
  correct: '#22C55E',
  wrong: '#F43F5E',
};

const LIGHT = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSoft: '#F1F5F9',
  primary: '#0D9488',
  primaryStrong: '#0F766E',
  primaryGlow: 'rgba(13, 148, 136, 0.08)',
  primaryBorder: 'rgba(13, 148, 136, 0.2)',
  onPrimary: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  correct: '#15803D',
  wrong: '#DC2626',
};

// ─── Scripts ─────────────────────────────────────────────────────────────────

const SCRIPTS = [
  { id: 'uthmani', label: 'Uthmani', font: 'Scheherazade New' },
  { id: 'naskh',   label: 'Naskh',   font: 'Amiri' },
  { id: 'system',  label: 'System',  font: undefined },
];

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

// ─── Styles factory ──────────────────────────────────────────────────────────

function getStyles(C) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: C.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },

    // ── Surah Select ──
    bannerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    topBanner: {
      paddingTop: 20,
      paddingHorizontal: 4,
      marginBottom: 16,
    },
    badgePill: {
      alignSelf: 'flex-start',
      backgroundColor: C.primaryGlow,
      borderWidth: 1,
      borderColor: C.primaryBorder,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    badgePillText: {
      color: C.primary,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    settingsToggleBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
    },
    settingsToggleBtnText: {
      fontSize: 13,
      color: C.textMuted,
      fontWeight: '600',
    },
    title: {
      fontSize: 38,
      fontWeight: '800',
      color: C.text,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: C.textMuted,
      lineHeight: 22,
      marginBottom: 0,
    },

    // ── Settings Panel ──
    settingsPanel: {
      backgroundColor: C.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      padding: 16,
      marginBottom: 16,
      gap: 16,
    },
    settingsRow: {
      gap: 10,
    },
    settingsRowLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: C.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    segmented: {
      flexDirection: 'row',
      gap: 8,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surfaceSoft,
      alignItems: 'center',
    },
    segmentBtnActive: {
      backgroundColor: C.primaryGlow,
      borderColor: C.primary,
    },
    segmentBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: C.textMuted,
    },
    segmentBtnTextActive: {
      color: C.primary,
      fontWeight: '700',
    },

    // ── Surah Grid ──
    surahGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    surahCard: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      padding: 14,
      width: '48.5%',
      marginBottom: 12,
      minHeight: 112,
      justifyContent: 'space-between',
    },
    surahCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    surahNumBadge: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: C.primaryGlow,
      borderWidth: 1,
      borderColor: C.primaryBorder,
      justifyContent: 'center',
      alignItems: 'center',
    },
    surahNumBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: C.primary,
    },
    surahCardMeta: {
      fontSize: 11,
      color: C.textMuted,
    },
    surahCardArabic: {
      fontSize: 22,
      color: C.text,
      textAlign: 'right',
      lineHeight: 34,
      marginBottom: 4,
    },
    surahCardTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: C.textMuted,
    },

    // ── Quiz ──
    quizHeaderCard: {
      backgroundColor: C.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      padding: 16,
      marginBottom: 12,
    },
    quizHeaderTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    exitBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: C.surfaceSoft,
    },
    exitBtnText: {
      fontSize: 13,
      color: C.textMuted,
      fontWeight: '600',
    },
    surahName: {
      fontSize: 28,
      fontWeight: '600',
      color: C.text,
    },
    progressWrap: {
      gap: 8,
    },
    progressTrack: {
      height: 6,
      borderRadius: 999,
      backgroundColor: C.surfaceSoft,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 999,
      backgroundColor: C.primaryStrong,
    },
    progressFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressText: {
      fontSize: 12,
      color: C.textMuted,
      fontWeight: '600',
    },
    scoreBadge: {
      backgroundColor: C.primaryGlow,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    scoreBadgeText: {
      fontSize: 12,
      color: C.primary,
      fontWeight: '700',
    },
    ayahContainer: {
      backgroundColor: C.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      padding: 20,
      marginBottom: 12,
    },
    ayahLabel: {
      fontSize: 11,
      color: C.textMuted,
      fontWeight: '700',
      marginBottom: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    ayahText: {
      fontSize: 30,
      lineHeight: 52,
      fontWeight: '500',
      color: C.text,
    },
    blank: {
      color: C.primary,
      fontWeight: '700',
    },
    blankCorrect: {
      color: C.correct,
    },
    blankWrong: {
      color: C.wrong,
    },
    choicesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    choiceBtn: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      padding: 14,
      width: '48.5%',
      marginBottom: 10,
      minHeight: 82,
      justifyContent: 'space-between',
    },
    correctBtn: {
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderColor: C.correct,
    },
    wrongBtn: {
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderColor: C.wrong,
    },
    choiceLabel: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: C.surfaceSoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    choiceLabelCorrect: {
      backgroundColor: 'rgba(34, 197, 94, 0.2)',
    },
    choiceLabelWrong: {
      backgroundColor: 'rgba(244, 63, 94, 0.2)',
    },
    choiceLabelText: {
      fontSize: 11,
      fontWeight: '800',
      color: C.textMuted,
    },
    choiceLabelTextActive: {
      color: C.text,
    },
    choiceBtnText: {
      fontSize: 22,
      color: C.text,
      fontWeight: '500',
      textAlign: 'right',
    },
    choiceBtnTextCorrect: {
      color: C.correct,
      fontWeight: '700',
    },
    choiceBtnTextWrong: {
      color: C.wrong,
      fontWeight: '700',
    },
    nextBtn: {
      backgroundColor: C.primaryStrong,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
    },
    nextBtnDisabled: {
      opacity: 0.35,
    },
    nextBtnText: {
      color: C.onPrimary,
      fontSize: 16,
      fontWeight: '800',
    },

    // ── Final ──
    finalCard: {
      width: '100%',
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 24,
      alignItems: 'center',
      padding: 28,
    },
    scoreRing: {
      width: 130,
      height: 130,
      borderRadius: 65,
      borderWidth: 5,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 20,
    },
    scorePercent: {
      fontSize: 38,
      fontWeight: '900',
    },
    finalTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: C.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    finalScoreText: {
      fontSize: 16,
      color: C.textMuted,
      marginBottom: 24,
      textAlign: 'center',
    },
    restartBtn: {
      backgroundColor: C.primaryStrong,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 32,
    },
    restartBtnText: {
      color: C.onPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('surah-select');
  const [numAyahs, setNumAyahs] = useState(0);
  const [surahName, setSurahName] = useState('');
  const [theme, setTheme] = useState('dark');
  const [script, setScript] = useState('quran-uthmani');
  const [showSettings, setShowSettings] = useState(false);

  const C = theme === 'dark' ? DARK : LIGHT;
  const styles = useMemo(() => getStyles(C), [theme]);
  const arabicFont = SCRIPTS.find((s) => s.id === script)?.font;

  useEffect(() => {
    loadSurahs();
  }, []);

  // Load Arabic web fonts once on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href =
        'https://fonts.googleapis.com/css2?family=Amiri:ital@0;1&family=Scheherazade+New:wght@400;500;700&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  async function getQuranMetadata() {
    const response = await fetch('https://quran-proxy.zuha.dev');
    if (!response.ok) throw new Error('Network response was not okay');
    const text = await response.text();
    const data = JSON.parse(text);
    return data.data;
  }

  async function loadSurahs() {
    try {
      setLoading(true);
      const data = await getQuranMetadata();
      setSurahs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading surahs:', error);
      setLoading(false);
    }
  }

  async function getAyahs(number) {
    const response = await fetch(`https://surah-proxy.zuha.dev/?number=${number}`);
    if (!response.ok) throw new Error('Network response was not okay');
    const data = await response.json();
    setSurahName(data.data.name);
    let ayahs = data.data.ayahs;
    const bismillah = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ';
    if (
      ayahs[0].text.includes(bismillah) &&
      ayahs[0].text.slice(bismillah.length).trimStart().length > 0
    ) {
      ayahs[0].text = ayahs[0].text.slice(bismillah.length).trimStart();
    }
    return ayahs;
  }

  function cleanText(text) {
    return (text || '')
      .normalize('NFC')
      .replace(/[\u00A0\u1680\u2000-\u200D\u202F\u205F\u2060\u3000\uFEFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function normalizeWord(word) {
    return (word || '')
      .normalize('NFC')
      .replace(/[\u00A0\u200B-\u200D\u2060\uFEFF]/g, '')
      .trim();
  }
  
  function getAyahWords(text) {
    return cleanText(text)
      .split(' ')
      .map(normalizeWord)
      .filter(Boolean);
  }

  function getAllWords(ayahs) {
    const words = cleanText(
      ayahs.map((ayah) => ayah.text).join(' ')
    )
      .split(' ')
      .map((word) => normalizeWord(word))
      .filter(Boolean);
    return [...new Set(words)];
  }

  async function initGame(number) {
    try {
      setLoading(true);
      const ayahs = await getAyahs(number);
      const allWords = getAllWords(ayahs);
      setNumAyahs(ayahs.length);

      const generatedQuestions = ayahs.map((ayah) => {
        const words = getAyahWords(ayah.text);
        const randomIndex = Math.floor(Math.random() * words.length);
        const correctWord = words[randomIndex];

        const choices = [correctWord];
        const chosenNormalized = new Set([normalizeWord(correctWord)]);
        const availableWrongChoices = allWords.filter((w) => w !== correctWord);

        while (choices.length < 4 && availableWrongChoices.length > 0) {
          const randomWrongIndex = Math.floor(Math.random() * availableWrongChoices.length);
          const wrongWord = availableWrongChoices[randomWrongIndex];
          const normalizedWrongWord = normalizeWord(wrongWord);

          if (!chosenNormalized.has(normalizedWrongWord)) {
            choices.push(wrongWord);
            chosenNormalized.add(normalizedWrongWord);
          } else {
            console.log('[Quiz Duplicate Prevented]', {
              ayahNumber: ayah.numberInSurah,
              wrongWord,
              normalizedWrongWord,
              existingChoices: choices,
            });
          }
          availableWrongChoices.splice(randomWrongIndex, 1);
        }

        const normalizedCounts = choices.reduce((acc, choice) => {
          const key = normalizeWord(choice);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const duplicateKeys = Object.keys(normalizedCounts).filter(
          (key) => normalizedCounts[key] > 1
        );

        console.log('[Quiz Question Built]', {
          ayahNumber: ayah.numberInSurah,
          correctWord,
          choices,
          duplicateKeys,
        });

        choices.sort(() => Math.random() - 0.5);

        return {
          ayah: ayah.text,
          number: ayah.numberInSurah,
          hiddenIndex: randomIndex,
          correctWord: correctWord,
          choices: choices,
        };
      });

      setQuestions(generatedQuestions);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswer(null);
      setScreen('quiz');
      setLoading(false);
    } catch (error) {
      console.error('Error initializing game:', error);
      setLoading(false);
    }
  }

  function selectAnswer(selected) {
    if (selectedAnswer !== null) return;
    const question = questions[currentQuestion];
    const isCorrect = selected === question.correctWord;
    setSelectedAnswer(selected);
    if (isCorrect) setScore((prev) => prev + 1);
  }

  function handleNext() {
    if (currentQuestion + 1 >= questions.length) {
      setScreen('final');
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    }
  }

  function handleRestart() {
    setScreen('surah-select');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setQuestions([]);
    setSelectedSurah(null);
    setSurahName('');
    setNumAyahs(0);
  }

  // ── Render: Settings Panel ──────────────────────────────────────────────────

  function renderSettings() {
    return (
      <View style={styles.settingsPanel}>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsRowLabel}>Theme</Text>
          <View style={styles.segmented}>
            {['dark', 'light'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.segmentBtn, theme === t && styles.segmentBtnActive]}
                onPress={() => setTheme(t)}
              >
                <Text style={[styles.segmentBtnText, theme === t && styles.segmentBtnTextActive]}>
                  {t === 'dark' ? 'Dark' : 'Light'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsRowLabel}>Arabic Script</Text>
          <View style={styles.segmented}>
            {SCRIPTS.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.segmentBtn, script === s.id && styles.segmentBtnActive]}
                onPress={() => setScript(s.id)}
              >
                <Text style={[styles.segmentBtnText, script === s.id && styles.segmentBtnTextActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ── Render: Surah Select ────────────────────────────────────────────────────

  function renderSurahSelect() {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>Quran Study</Text>
            </View>
            <TouchableOpacity
              style={styles.settingsToggleBtn}
              onPress={() => setShowSettings((v) => !v)}
            >
              <Text style={styles.settingsToggleBtnText}>
                {showSettings ? 'Done' : 'Settings'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Surah Quiz</Text>
          <Text style={styles.subtitle}>
            Select a Surah and fill in the missing word from each Ayah.
          </Text>
        </View>

        {showSettings && renderSettings()}

        <View style={styles.surahGrid}>
          {surahs.map((surah) => (
            <TouchableOpacity
              key={surah.number}
              style={styles.surahCard}
              onPress={() => initGame(surah.number)}
            >
              <View style={styles.surahCardHeader}>
                <View style={styles.surahNumBadge}>
                  <Text style={styles.surahNumBadgeText}>{surah.number}</Text>
                </View>
                <Text style={styles.surahCardMeta}>{surah.numberOfAyahs} ayahs</Text>
              </View>
              <Text style={[styles.surahCardArabic, arabicFont && { fontFamily: arabicFont }]}>{surah.name}</Text>
              <Text style={styles.surahCardTitle}>{surah.englishName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  }

  // ── Render: Progress ────────────────────────────────────────────────────────

  function renderProgress(questionNumber) {
    const progress = numAyahs > 0 ? questionNumber / numAyahs : 0;

    return (
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, 4)}%` }]} />
        </View>
        <View style={styles.progressFooter}>
          <Text style={styles.progressText}>{questionNumber} / {numAyahs}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{score} correct</Text>
          </View>
        </View>
      </View>
    );
  }

  // ── Render: Quiz ────────────────────────────────────────────────────────────

  function renderQuiz() {
    if (loading || questions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      );
    }

    const question = questions[currentQuestion];
    const words = getAyahWords(question.ayah);
    const questionNumber = currentQuestion + 1;

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.quizHeaderCard}>
          <View style={styles.quizHeaderTop}>
            <TouchableOpacity style={styles.exitBtn} onPress={handleRestart}>
              <Text style={styles.exitBtnText}>✕ Exit</Text>
            </TouchableOpacity>
            <Text style={[styles.surahName, arabicFont && { fontFamily: arabicFont }]}>{surahName}</Text>
          </View>
          {renderProgress(questionNumber)}
        </View>

        <View style={styles.ayahContainer}>
          <Text style={styles.ayahLabel}>Ayah {question.number}</Text>
          <Text style={[styles.ayahText, { textAlign: 'right', fontFamily: arabicFont }]}>
            {words.map((word, index) => {
              if (index === question.hiddenIndex) {
                const isCorrect = selectedAnswer === question.correctWord;
                const showAnswer = selectedAnswer !== null;
                return (
                  <Text
                    key={index}
                    style={[
                      styles.blank,
                      showAnswer && (isCorrect ? styles.blankCorrect : styles.blankWrong),
                    ]}
                  >
                    {showAnswer ? question.correctWord : '_____'}{' '}
                  </Text>
                );
              }
              return <Text key={index}>{word} </Text>;
            })}
          </Text>
        </View>

        <View style={styles.choicesGrid}>
          {question.choices.map((choice, index) => {
            const isCorrect = choice === question.correctWord;
            const isSelected = selectedAnswer === choice;
            const isWrong = isSelected && !isCorrect;
            const showFeedback = selectedAnswer !== null;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.choiceBtn,
                  showFeedback && isCorrect && styles.correctBtn,
                  showFeedback && isWrong && styles.wrongBtn,
                ]}
                onPress={() => selectAnswer(choice)}
                disabled={selectedAnswer !== null}
              >
                <View
                  style={[
                    styles.choiceLabel,
                    showFeedback && isCorrect && styles.choiceLabelCorrect,
                    showFeedback && isWrong && styles.choiceLabelWrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.choiceLabelText,
                      showFeedback && (isCorrect || isWrong) && styles.choiceLabelTextActive,
                    ]}
                  >
                    {CHOICE_LABELS[index]}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.choiceBtnText,
                    arabicFont && { fontFamily: arabicFont },
                    showFeedback && isCorrect && styles.choiceBtnTextCorrect,
                    showFeedback && isWrong && styles.choiceBtnTextWrong,
                  ]}
                >
                  {choice}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, selectedAnswer === null && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={selectedAnswer === null}
        >
          <Text style={styles.nextBtnText}>
            {currentQuestion + 1 >= questions.length ? 'See Results' : 'Next Ayah →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ── Render: Final ───────────────────────────────────────────────────────────

  function renderFinal() {
    const percentage = numAyahs > 0 ? Math.round((score / numAyahs) * 100) : 0;
    const scoreColor =
      percentage >= 80 ? C.correct : percentage >= 50 ? C.primary : C.wrong;
    const message =
      percentage === 100 ? 'Perfect Score!' :
      percentage >= 80 ? 'Excellent Work' :
      percentage >= 60 ? 'Well Done' :
      percentage >= 40 ? 'Keep Going' : 'Keep Practicing';

    return (
      <View style={styles.centerContainer}>
        <View style={styles.finalCard}>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>Session Complete</Text>
          </View>
          <View style={[styles.scoreRing, { borderColor: scoreColor }]}>
            <Text style={[styles.scorePercent, { color: scoreColor }]}>{percentage}%</Text>
          </View>
          <Text style={styles.finalTitle}>{message}</Text>
          <Text style={styles.finalScoreText}>{score} of {numAyahs} ayahs correct</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Root ────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      {screen === 'surah-select' && renderSurahSelect()}
      {screen === 'quiz' && renderQuiz()}
      {screen === 'final' && renderFinal()}
    </SafeAreaView>
  );
}
