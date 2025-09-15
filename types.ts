export interface User {
  uid: string;
  name: string;
  score: number;
  photoURL?: string;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
}

export enum Screen {
  Login,
  Game,
  Ranking,
}