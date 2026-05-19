"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionModal({
  isOpen,
  onClose,
}: InstructionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#16213e] border-2 border-[#0f3460] rounded-lg shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
        <div className="bg-liniear-to-r from-[#0f3460] to-[#16213e] px-6 py-4 flex items-center justify-between border-b border-[#0f3460]">
          <h2 className="text-2xl font-bold text-[#e8e8e8]">
            Không gian học tập: Nguyên lý của sự phát triển
          </h2>
          <h2 className="hidden">
            Chào mừng đến với Bảo tàng!
          </h2>
          <button
            onClick={onClose}
            className="text-[#94a3b8] hover:text-[#e8e8e8] transition-colors"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#0f3460]">
            <h3 className="text-lg font-semibold text-[#e8e8e8] mb-3">
              Hướng dẫn di chuyển
            </h3>
            <h3 className="hidden">
              Hướng dẫn di chuyển
            </h3>
            <h3 className="hidden">
              Hướng dẫn di chuyển
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-[#0f3460] rounded px-3 py-2 text-[#e8e8e8] font-mono text-sm">
                  ↑ ↓ ← →
                </div>
                <span className="text-[#94a3b8] text-sm">Phím mũi tên</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#0f3460] rounded px-3 py-2 text-[#e8e8e8] font-mono text-sm">
                  W A S D
                </div>
                <span className="text-[#94a3b8] text-sm">Phím WASD</span>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#0f3460]">
            <h3 className="text-lg font-semibold text-[#e8e8e8] mb-3">
              Cách tương tác
            </h3>
            <div className="flex items-center gap-3">
              <div className="bg-[#4ade80] rounded px-4 py-2 text-[#1a1a2e] font-mono text-lg font-bold">
                E
              </div>
              <span className="text-[#94a3b8] text-sm">
                Nhấn phím{" "}
                <span className="text-[#4ade80] font-semibold">E</span> khi đứng
                gần icon gợi ý hoặc dấu hỏi để xem nội dung tương tác
              </span>
              <span className="hidden">
                Nhấn phím{" "}
                <span className="text-[#4ade80] font-semibold">E</span> khi đứng
                gần tranh để xem nội dung chi tiết
              </span>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-lg p-4 border border-[#0f3460]">
            <h3 className="text-lg font-semibold text-[#e8e8e8] mb-3">
              Mục tiêu học tập
            </h3>
            <h3 className="hidden">
              Mục tiêu
            </h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              Tìm hiểu nguyên lý của sự phát triển trong chủ nghĩa duy vật biện
              chứng: phân biệt vận động và phát triển, nhận diện khuynh hướng
              tiến lên, vai trò của cái mới và nguồn gốc bên trong của sự phát
              triển. Hãy tìm các hint trên bản đồ trước khi trả lời câu hỏi.
            </p>
            <p className="hidden">
              Khám phá{" "}
              <span className="text-[#e8e8e8] font-semibold">
                3 khu trưng bày
              </span>{" "}
              về Dân chủ xã hội chủ nghĩa và Nhà nước pháp quyền ở Việt Nam. Di
              chuyển nhân vật của bạn đến gần các bức tranh và tương tác để tìm
              hiểu thêm!
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              className="bg-[#4ade80] hover:bg-[#22c55e] text-transparent font-semibold px-8 py-2 rounded-lg transition-colors"
            >
              <span className="text-[#1a1a2e]">Bắt đầu học</span>
              Bắt đầu khám phá
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
