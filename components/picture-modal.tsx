"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface PictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  caption?: string;
}

export default function PictureModal({
  isOpen,
  onClose,
  imagePath,
  caption,
}: PictureModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [imagePath]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Bức tranh trong bảo tàng
          </DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center p-4">
          {imageError ? (
            <div className="text-center text-gray-500">
              <p>Không thể tải hình ảnh</p>
              <p className="text-sm mt-2">{imagePath}</p>
            </div>
          ) : (
            <div className="relative max-w-full max-h-[70vh]">
              <Image
                src={imagePath}
                alt="Museum Picture"
                width={800}
                height={600}
                className="object-contain rounded-lg shadow-lg"
                onError={handleImageError}
                priority
              />
            </div>
          )}
        </div>
        {caption && (
          <div className="px-6 pb-4">
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="font-semibold text-gray-800 mb-2">Chú thích:</h4>
              <p className="text-gray-700 leading-relaxed">{caption}</p>
            </div>
          </div>
        )}
        <div className="text-center text-sm text-gray-600 mt-4">
          Nhấn ESC hoặc click bên ngoài để đóng
        </div>
      </DialogContent>
    </Dialog>
  );
}
