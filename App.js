import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './supabase';

const COLORS = {
  background: '#1a1b2e',
  primary: '#00fff5',
  correct: '#00ff64',
  wrong: '#ff0064',
  white: '#ffffff',
  cardBg: 'rgba(255, 255, 255, 0.05)',
};

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('surah-select'); // 'surah-select', 'auth', 'quiz', 'final'
  const [numAyahs, setNumAyahs] = useState(0);
  const [surahName, setSurahName] = useState('');

  // Auth state
  const [user, setUser] = useState(null);
  const [userScores, setUserScores] = useState({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    loadSurahs();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadUserScores();
    else setUserScores({});
  }, [user]);

  useEffect(() => {
    if (screen === 'surah-select' && user) loadUserScores();
  }, [screen]);

  async function loadUserScores() {
    const { data, error } = await supabase
      .from('scores')
      .select('surah_number, score, total');
    if (error || !data) return;

    const best = {};
    for (const row of data) {
      const pct = row.score / row.total;
      if (!best[row.surah_number] || pct > best[row.surah_number].score / best[row.surah_number].total) {
        best[row.surah_number] = { score: row.score, total: row.total };
      }
    }
    setUserScores(best);
  }

  async function saveScore(finalScore, total, surahNum, sName) {
    if (!user) return;
    const { error } = await supabase.from('scores').insert({
      surah_number: surahNum,
      surah_name: sName,
      score: finalScore,
      total: total,
    });
    if (!error) setScoreSaved(true);
  }

  async function handleSignIn() {
    setAuthError('');
    setAuthLoading(true);
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else {
      setEmail('');
      setPassword('');
      setScreen('surah-select');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserScores({});
  }

  async function getQuranMetadata() {
    const response = await fetch('https://quran-proxy.zuha.dev');
    if (!response.ok) {
      throw new Error('Network response was not okay');
    }
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
    if (!response.ok) {
      throw new Error('Network response was not okay');
    }
    const data = await response.json();
    setSurahName(data.data.name);
    let ayahs = data.data.ayahs;
    const bismillah = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ';
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
      setSelectedSurah(number);
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
          const randomWrongIndex = Math.floor(
            Math.random() * availableWrongChoices.length
          );
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

    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
  }

  function handleNext() {
    if (currentQuestion + 1 >= questions.length) {
      setScoreSaved(false);
      saveScore(score, numAyahs, selectedSurah, surahName);
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

  function renderAuth() {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centerContainer}
      >
        <View style={styles.authCard}>
          <Text style={styles.authTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>

          {authError ? <Text style={styles.authError}>{authError}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
          />

          <TouchableOpacity
            style={[styles.authBtn, authLoading && { opacity: 0.6 }]}
            onPress={handleSignIn}
            disabled={authLoading}
          >
            {authLoading
              ? <ActivityIndicator color={COLORS.background} />
              : <Text style={styles.authBtnText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setAuthError(''); }}>
            <Text style={styles.authToggle}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setScreen('surah-select')} style={{ marginTop: 8 }}>
            <Text style={[styles.authToggle, { opacity: 0.5 }]}>Continue without account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  function renderSurahSelect() {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Surah Quiz</Text>
          {user ? (
            <View style={styles.userRow}>
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setScreen('auth')}>
              <Text style={styles.loginLink}>Login to save scores</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.choicesGrid}>
          {surahs.map((surah) => {
            const best = userScores[surah.number];
            return (
              <TouchableOpacity
                key={surah.number}
                style={styles.choiceBtn}
                onPress={() => initGame(surah.number)}
              >
                <Text style={styles.choiceBtnText}>
                  {surah.number}. {surah.englishName} {surah.name}
                </Text>
                {best && (
                  <Text style={styles.scoreBadge}>
                    Best: {best.score}/{best.total}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    );
  }

  function renderQuiz() {
    if (loading || questions.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    const question = questions[currentQuestion];
    const words = getAyahWords(question.ayah);

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.surahName, { textAlign: 'right' }]}>{surahName}</Text>
          <Text style={styles.score}>
            Score: {score}/{numAyahs}
          </Text>
        </View>

        <View style={styles.ayahContainer}>
          <Text style={[styles.ayahText, { textAlign: 'right' }]}>
            {words.map((word, index) => {
              if (index === question.hiddenIndex) {
                const isCorrect = selectedAnswer === question.correctWord;
                const showAnswer = selectedAnswer !== null;
                const color = showAnswer
                  ? isCorrect
                    ? COLORS.correct
                    : COLORS.wrong
                  : COLORS.primary;
                return (
                  <Text key={index} style={[styles.blank, { color }]}>
                    {showAnswer ? question.correctWord : '_____'}{' '}
                  </Text>
                );
              }
              return <Text key={index}>{word} </Text>;
            })}
          </Text>
          <Text style={styles.ayahNumber}>Ayah {question.number}</Text>
        </View>

        <View style={styles.choicesGrid}>
          {question.choices.map((choice, index) => {
            const isCorrect = choice === question.correctWord;
            const isSelected = selectedAnswer === choice;
            const isWrong = isSelected && !isCorrect;
            const showFeedback = selectedAnswer !== null;

            let buttonStyle = styles.choiceBtn;
            if (showFeedback) {
              if (isCorrect) {
                buttonStyle = [styles.choiceBtn, styles.correctBtn];
              } else if (isWrong) {
                buttonStyle = [styles.choiceBtn, styles.wrongBtn];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={buttonStyle}
                onPress={() => selectAnswer(choice)}
                disabled={selectedAnswer !== null}
              >
                <Text style={[styles.choiceBtnText, { textAlign: 'right' }]}>
                  {choice}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.backBtn} onPress={handleRestart}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.nextBtn,
              selectedAnswer === null && styles.nextBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={selectedAnswer === null}
          >
            <Text style={styles.nextBtnText}>Next</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  function renderFinal() {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.finalScore}>
          <Text style={styles.finalTitle}>Game Complete!</Text>
          <Text style={styles.finalScoreText}>
            Final Score: {score}/{numAyahs}
          </Text>
          {user && (
            <Text style={styles.scoreSavedText}>
              {scoreSaved ? '✓ Score saved' : 'Saving score...'}
            </Text>
          )}
          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart}>
            <Text style={styles.restartBtnText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {screen === 'surah-select' && renderSurahSelect()}
      {screen === 'auth' && renderAuth()}
      {screen === 'quiz' && renderQuiz()}
      {screen === 'final' && renderFinal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 255, 245, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    maxWidth: 200,
  },
  signOutText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
  scoreBadge: {
    color: COLORS.correct,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  authCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 15,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  authError: {
    color: COLORS.wrong,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,255,245,0.3)',
    borderRadius: 10,
    padding: 14,
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 14,
  },
  authBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  authBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  authToggle: {
    color: COLORS.primary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  scoreSavedText: {
    color: COLORS.correct,
    fontSize: 14,
    marginBottom: 16,
  },
  surahName: {
    fontSize: 28,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 10,
    fontFamily: 'System',
  },
  score: {
    fontSize: 18,
    color: COLORS.primary,
  },
  ayahContainer: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 15,
    padding: 30,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  ayahText: {
    fontSize: 24,
    lineHeight: 36,
    fontWeight: '500',
    marginBottom: 10,
    color: COLORS.white,
    fontFamily: 'System',
  },
  blank: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
    minWidth: 100,
    paddingHorizontal: 10,
    color: COLORS.primary,
  },
  ayahNumber: {
    fontSize: 16,
    color: COLORS.primary,
    marginTop: 10,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  choiceBtn: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    minHeight: 80,
    width: '48%',
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  correctBtn: {
    backgroundColor: 'rgba(0, 255, 100, 0.2)',
    borderColor: COLORS.correct,
  },
  wrongBtn: {
    backgroundColor: 'rgba(255, 0, 100, 0.2)',
    borderColor: COLORS.wrong,
  },
  choiceBtnText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: '500',
    fontFamily: 'System',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  backBtn: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    paddingHorizontal: 40,
    flex: 1,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  backBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '500',
  },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    paddingHorizontal: 40,
    flex: 1,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  finalScore: {
    alignItems: 'center',
    padding: 40,
  },
  finalTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 255, 245, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  finalScoreText: {
    fontSize: 24,
    color: COLORS.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  restartBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 15,
    paddingHorizontal: 40,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  restartBtnText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
