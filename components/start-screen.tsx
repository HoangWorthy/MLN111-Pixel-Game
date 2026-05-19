"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Player } from "@/types/museum";

interface StartScreenProps {
  onStart: (username: string) => void;
  existingPlayers: Player[];
  onSelectPlayer: (username: string) => void;
}

export default function StartScreen({
  onStart,
  existingPlayers,
  onSelectPlayer,
}: StartScreenProps) {
  const [username, setUsername] = useState("");
  const [showNewPlayer, setShowNewPlayer] = useState(
    existingPlayers.length === 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onStart(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a2e] flex items-center justify-center z-50">
      <div className="bg-[#16213e] border-2 border-[#0f3460] rounded-lg p-8 max-w-md w-full mx-4">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#e8e8e8]">
            Nguyên lý của sự phát triển
          </h1>
          <p className="mt-2 text-sm text-[#94a3b8]">
            Chủ nghĩa duy vật biện chứng • Chương 2
          </p>
        </div>
        {!showNewPlayer && existingPlayers.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[#e8e8e8] mb-4">
              Chọn người chơi
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {existingPlayers.map((player) => (
                <button
                  key={player.username}
                  onClick={() => onSelectPlayer(player.username)}
                  className="w-full p-4 bg-[#0f3460] hover:bg-[#1e3a5f] border border-[#0f3460] rounded-lg text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[#e8e8e8] font-semibold">
                        {player.username}
                      </p>
                      <p className="text-[#94a3b8] text-sm">
                        Tiến độ học tập: {player.visitedExhibits.length} mục đã xem
                      </p>
                      <p className="hidden">
                        Phòng: {player.unlockedRooms.length}/3 • Trưng bày:{" "}
                        {player.visitedExhibits.length}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#94a3b8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setShowNewPlayer(true)}
              className="w-full bg-[#0f3460] hover:bg-[#1e3a5f] text-[#e8e8e8] border border-[#0f3460]"
            >
              + Tạo người chơi mới
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#e8e8e8] mb-2"
              >
                Nhập tên của bạn
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tên người chơi..."
                className="w-full bg-[#0f3460] border-[#0f3460] text-[#e8e8e8] placeholder:text-[#64748b]"
                maxLength={20}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={!username.trim()}
              className="flex w-full items-center justify-center bg-[#0f3460] text-center text-[#e8e8e8] hover:bg-[#1e3a5f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Bắt đầu học
            </Button>
            {existingPlayers.length > 0 && (
              <Button
                type="button"
                onClick={() => setShowNewPlayer(false)}
                variant="outline"
                className="w-full border-[#0f3460] text-[#94a3b8] hover:bg-[#0f3460] hover:text-[#e8e8e8]"
              >
                Quay lại chọn người chơi
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
