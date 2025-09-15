import { Question } from '../types';
import { questions } from './quizData';

/**
 * 이전에 출제되지 않은 새로운 질문을 무작위로 선택하여 반환합니다.
 * @param askedQuestions - 이미 출제된 질문들의 문자열 배열
 * @returns {Question | null} 새로운 질문 객체 또는 더 이상 출제할 질문이 없으면 null
 */
export const getNewQuestion = (askedQuestions: string[]): Question | null => {
  // 사용 가능한 (아직 출제되지 않은) 질문들만 필터링합니다.
  const availableQuestions = questions.filter(
    q => !askedQuestions.includes(q.question)
  );

  // 만약 더 이상 출제할 질문이 없으면 null을 반환합니다.
  if (availableQuestions.length === 0) {
    return null;
  }

  // 사용 가능한 질문들 중에서 무작위로 하나를 선택합니다.
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
};
