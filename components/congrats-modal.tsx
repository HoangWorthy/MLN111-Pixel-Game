"use client";

import { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

interface CongratsModalProps {
  isOpen: boolean;
  unlockedCount: number;
  visitedCount: number;
  onClose: () => void;
}

export default function CongratsModal({
  isOpen,
  unlockedCount,
  visitedCount,
  onClose,
}: CongratsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#16213e] border-2 border-[#0f3460] rounded-lg max-w-xl w-full shadow-2xl">
        <div className="sticky top-0 bg-[#0f3460] px-6 py-4 flex items-center justify-between border-b border-[#1a1a2e] rounded-t-lg">
          <h2 className="text-2xl font-bold text-[#e8e8e8] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#4ade80]" />
            Chúc mừng!
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#1a1a2e] transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5 text-[#94a3b8]" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-[#e8e8e8] text-lg">
            Bạn đã mở khóa tất cả{" "}
            <span className="font-semibold text-[#4ade80]">3 phòng</span>
            trong bảo tàng.
          </p>
          <p className="text-[#94a3b8] text-sm">
            Tình trạng hiện tại: Phòng mở{" "}
            <span className="font-semibold text-[#e8e8e8]">
              {unlockedCount}/3
            </span>{" "}
            • Trưng bày đã tham quan{" "}
            <span className="font-semibold text-[#e8e8e8]">{visitedCount}</span>
          </p>

          <div className="mt-4 p-4 bg-[#0f3460] rounded-lg border border-[#1a1a2e]">
            <p className="text-[#cbd5e1]">
              Tuyệt vời! Bạn có thể tiếp tục khám phá các khu trưng bày hoặc đổi
              người chơi để bắt đầu lại hành trình.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0f3460] px-6 py-4 border-t border-[#1a1a2e] rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-[#1a1a2e] font-semibold py-3 rounded-lg transition-colors"
          >
            Tiếp tục khám phá
          </button>
        </div>
      </div>
    </div>
  );
}
