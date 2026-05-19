"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import MuseumScene from "@/components/museum-scene";
import InfoModal from "@/components/info-modal";
import InstructionModal from "@/components/instruction-modal";
import QuizModal from "@/components/quiz-modal";
import CongratsModal from "@/components/congrats-modal";
import Minimap from "@/components/minimap";
import StartScreen from "@/components/start-screen";
import type { ExhibitData, Player } from "@/types/museum";
import { roomQuizzes } from "@/data/museum-quizes";
import { USE_VIETNAM_MAP } from "@/components/game/map-manager";

export default function MuseumPage() {
  const [selectedExhibit, setSelectedExhibit] = useState<ExhibitData | null>(
    null
  );
  const [visitedExhibits, setVisitedExhibits] = useState<Set<string>>(
    new Set()
  );
  const [showInstructions, setShowInstructions] = useState(false);
  const [unlockedRooms, setUnlockedRooms] = useState<Set<number>>(new Set([1]));
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuizRoom, setCurrentQuizRoom] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showComprehensiveQuiz, setShowComprehensiveQuiz] = useState(false);
  const [comprehensiveQuestions, setComprehensiveQuestions] = useState<any[]>(
    []
  );

  const [currentPlayer, setCurrentPlayer] = useState<string | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [showStartScreen, setShowStartScreen] = useState(true);

  const isLoadingPlayer = useRef(false);
  const roomUnlockInProgress = useRef<Set<number>>(new Set());

  useEffect(() => {
    const playersData = localStorage.getItem("museum-players");
    if (playersData) {
      const players: Player[] = JSON.parse(playersData);
      setAllPlayers(players);
    }
  }, []);

  useEffect(() => {
    if (currentPlayer && allPlayers.length > 0) {
      const player = allPlayers.find((p) => p.username === currentPlayer);
      if (player) {
        isLoadingPlayer.current = true;
        setUnlockedRooms(new Set(player.unlockedRooms));
        setVisitedExhibits(new Set(player.visitedExhibits));
        setShowInstructions(true);
        setTimeout(() => {
          isLoadingPlayer.current = false;
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer]);

  useEffect(() => {
    if (currentPlayer && !isLoadingPlayer.current && allPlayers.length > 0) {
      const updatedPlayers = allPlayers.map((p) =>
        p.username === currentPlayer
          ? {
              ...p,
              unlockedRooms: Array.from(unlockedRooms),
              visitedExhibits: Array.from(visitedExhibits),
            }
          : p
      );

      const hasChanged =
        JSON.stringify(allPlayers) !== JSON.stringify(updatedPlayers);
      if (hasChanged) {
        setAllPlayers(updatedPlayers);
        localStorage.setItem("museum-players", JSON.stringify(updatedPlayers));
      }
    }
  }, [unlockedRooms, visitedExhibits, currentPlayer, allPlayers]);

  const handleStartGame = useCallback(
    (username: string) => {
      const newPlayer: Player = {
        username,
        createdAt: new Date().toISOString(),
        unlockedRooms: [1],
        visitedExhibits: [],
      };

      const existingPlayers = allPlayers.filter((p) => p.username !== username);
      const updatedPlayers = [...existingPlayers, newPlayer];

      setAllPlayers(updatedPlayers);
      localStorage.setItem("museum-players", JSON.stringify(updatedPlayers));
      setCurrentPlayer(username);
      setShowStartScreen(false);
    },
    [allPlayers]
  );

  const handleSelectPlayer = useCallback((username: string) => {
    setCurrentPlayer(username);
    setShowStartScreen(false);
  }, []);

  const handleExhibitView = useCallback(
    (exhibit: ExhibitData) => {
      if (!unlockedRooms.has(exhibit.roomNumber)) {
        if ((window as any).showGamePopup) {
          (window as any).showGamePopup(
            "🔒 PHÒNG BỊ KHÓA",
            `Phòng ${exhibit.roomNumber} đang bị khóa.\nVui lòng hoàn thành quiz của phòng trước đó.`,
            "OK"
          );
        }
        return;
      }
      setSelectedExhibit(exhibit);
      setVisitedExhibits((prev) => new Set([...prev, exhibit.id]));
    },
    [unlockedRooms]
  );

  const handleCloseModal = useCallback(() => {
    setSelectedExhibit(null);
  }, []);

  const handleCloseInstructions = useCallback(() => {
    setShowInstructions(false);
  }, []);

  const handleQuizPass = useCallback(() => {
    console.log("Quiz passed for room:", currentQuizRoom);
    if (currentQuizRoom !== null) {
      const roomToUnlock = currentQuizRoom + 1;

      // Check if room unlock is already in progress
      if (roomUnlockInProgress.current.has(roomToUnlock)) {
        console.log(
          `Room ${roomToUnlock} unlock already in progress, skipping`
        );
        return;
      }

      roomUnlockInProgress.current.add(roomToUnlock);

      setUnlockedRooms((prev) => {
        const newUnlocked = new Set([...prev, roomToUnlock]);
        return newUnlocked;
      });

      setShowQuiz(false);
      setCurrentQuizRoom(null);

      setTimeout(() => {
        if ((window as any).showGamePopup) {
          (window as any).showGamePopup(
            "Chúc mừng!",
            `Bạn đã mở khóa Phòng ${roomToUnlock}! Hãy khám phá nội dung mới.`,
            "KHÁM PHÁ",
            () => {
              setTimeout(() => {
                if (window.unlockRoom) {
                  window.unlockRoom(roomToUnlock);
                }
                // Clear the flag after unlocking
                roomUnlockInProgress.current.delete(roomToUnlock);
              }, 300);
            }
          );
        } else {
          if (window.unlockRoom) {
            window.unlockRoom(roomToUnlock);
          }
          // Clear the flag after unlocking
          roomUnlockInProgress.current.delete(roomToUnlock);
        }
      }, 500);
    }
  }, [currentQuizRoom]);

  const handleComprehensiveQuizPass = useCallback(() => {
    setShowComprehensiveQuiz(false);
    setShowCongrats(true);

    setTimeout(() => {
      if ((window as any).createFinishLine) {
        (window as any).createFinishLine();
      }
    }, 1000);
  }, []);

  const handleComprehensiveQuizClose = useCallback(() => {
    setShowComprehensiveQuiz(false);
  }, []);

  const handleQuizClose = useCallback(() => {
    setShowQuiz(false);
    setCurrentQuizRoom(null);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentPlayer(null);
    setShowStartScreen(true);
    setShowInstructions(false);
  }, []);

  const handleDoorInteract = useCallback((roomNumber: number) => {
    if (USE_VIETNAM_MAP) return;

    const quizRoomNumber = roomNumber - 1;
    setCurrentQuizRoom(quizRoomNumber);
    setShowQuiz(true);
  }, []);

  const handleCongratsClose = useCallback(() => {
    setShowCongrats(false);
  }, []);

  useEffect(() => {
    if (USE_VIETNAM_MAP) return;

    const handleQuizPointInteract = () => {
      // Combine all questions from all 3 rooms
      const allQuestions = roomQuizzes
        .filter((quiz) => quiz.roomNumber <= 3)
        .flatMap((quiz) => quiz.questions);

      setComprehensiveQuestions(allQuestions);
      setShowComprehensiveQuiz(true);
    };

    window.addEventListener("quizPointInteract", handleQuizPointInteract);

    return () => {
      window.removeEventListener("quizPointInteract", handleQuizPointInteract);
    };
  }, []);

  if (showStartScreen) {
    return (
      <StartScreen
        onStart={handleStartGame}
        existingPlayers={allPlayers}
        onSelectPlayer={handleSelectPlayer}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
      <header className="bg-[#16213e] border-b border-[#0f3460] py-6 px-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-[#e8e8e8] tracking-tight">
              Nguyên lý của sự phát triển
            </h1>
            <h1 className="hidden">
              Quá trình hình thành và phát triển tư tưởng Hồ Chí Minh
            </h1>
            <p className="text-center text-[#94a3b8] mt-2 text-sm">
              Chương 2: Chủ nghĩa duy vật biện chứng • Di chuyển bằng WASD hoặc phím mũi tên • Nhấn E để xem hint và câu hỏi
            </p>
            <p className="hidden">
              Sử dụng phím mũi tên hoặc WASD để di chuyển • Nhấn E để xem nội
              dung
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <MuseumScene
          onExhibitInteract={handleExhibitView}
          onDoorInteract={handleDoorInteract}
          visitedExhibits={visitedExhibits}
          unlockedRooms={unlockedRooms}
          username={currentPlayer || ""}
        />
      </main>

      <InstructionModal
        isOpen={showInstructions}
        onClose={handleCloseInstructions}
      />

      <InfoModal
        exhibit={selectedExhibit}
        isOpen={!!selectedExhibit}
        onClose={handleCloseModal}
      />

      {!USE_VIETNAM_MAP && showQuiz && currentQuizRoom !== null && (
        <QuizModal
          isOpen={showQuiz}
          roomNumber={currentQuizRoom}
          questions={
            roomQuizzes.find((q) => q.roomNumber === currentQuizRoom)
              ?.questions || []
          }
          onPass={handleQuizPass}
          onClose={handleQuizClose}
        />
      )}

      {!USE_VIETNAM_MAP && showComprehensiveQuiz && (
        <QuizModal
          isOpen={showComprehensiveQuiz}
          roomNumber={0}
          questions={comprehensiveQuestions}
          onPass={handleComprehensiveQuizPass}
          onClose={handleComprehensiveQuizClose}
        />
      )}

      {!USE_VIETNAM_MAP && showCongrats && (
        <CongratsModal
          isOpen={showCongrats}
          unlockedCount={unlockedRooms.size}
          visitedCount={visitedExhibits.size}
          onClose={handleCongratsClose}
        />
      )}

      {!USE_VIETNAM_MAP && !showInstructions && (
        <Minimap
          visitedExhibits={visitedExhibits}
          unlockedRooms={unlockedRooms}
        />
      )}

      {!USE_VIETNAM_MAP && visitedExhibits.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-[#16213e] border border-[#0f3460] rounded-lg px-4 py-2 text-[#e8e8e8]">
          <p className="text-sm">Phòng đã mở: {unlockedRooms.size}/3</p>
          <p className="text-sm">
            Đã tham quan: {visitedExhibits.size} khu trưng bày
          </p>
        </div>
      )}
    </div>
  );
}
