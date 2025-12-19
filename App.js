import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

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
  const [screen, setScreen] = useState('surah-select'); // 'surah-select', 'quiz', 'final'
  const [numAyahs, setNumAyahs] = useState(0);
  const [surahName, setSurahName] = useState('');

  useEffect(() => {
    loadSurahs();
  }, []);

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

  function getAllWords(ayahs) {
    const words = ayahs
      .map((ayah) => ayah.text)
      .join(' ')
      .trim()
      .split(/\s+/);
    return [...new Set(words)];
  }

  async function initGame(number) {
    try {
      setLoading(true);
      const ayahs = await getAyahs(number);
      const allWords = getAllWords(ayahs);
      setNumAyahs(ayahs.length);

      const generatedQuestions = ayahs.map((ayah) => {
        const words = ayah.text.split(' ');
        const randomIndex = Math.floor(Math.random() * words.length);
        const correctWord = words[randomIndex];

        const choices = [correctWord];
        const availableWrongChoices = allWords.filter((w) => w !== correctWord);

        while (choices.length < 4 && availableWrongChoices.length > 0) {
          const randomWrongIndex = Math.floor(
            Math.random() * availableWrongChoices.length
          );
          const wrongWord = availableWrongChoices[randomWrongIndex];
          if (!choices.includes(wrongWord)) {
            choices.push(wrongWord);
          }
          availableWrongChoices.splice(randomWrongIndex, 1);
        }

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
        </View>
        <View style={styles.choicesGrid}>
          {surahs.map((surah) => (
            <TouchableOpacity
              key={surah.number}
              style={styles.choiceBtn}
              onPress={() => initGame(surah.number)}
            >
              <Text style={styles.choiceBtnText}>
                {surah.number}. {surah.englishName} {surah.name}
              </Text>
            </TouchableOpacity>
          ))}
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
    const words = question.ayah.split(' ');

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
    marginBottom: 30,
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

