export interface ExhibitData {
  id: string;
  title: string;
  position: { x: number; y: number };
  content: string;
  examples?: string[];
  image?: string;
  roomNumber: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface RoomQuiz {
  roomNumber: number;
  questions: QuizQuestion[];
}

export interface Player {
  username: string;
  createdAt: string;
  unlockedRooms: number[];
  visitedExhibits: string[];
}
