'use client';

import React, { useState, useEffect } from 'react';
import { gameClient } from '@/lib/game-client';
import { LeaderboardEntry } from '@/types/leaderboard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleLeaderboardUpdate = (data: { leaderboard: any[] }) => {
      setLeaderboard(data.leaderboard || []);
    };

    gameClient.onLeaderboardUpdated(handleLeaderboardUpdate);

    return () => {
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-amber-50 border-4 border-amber-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
            🏆 Bảng Xếp Hạng
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-900 mx-auto"></div>
              <p className="text-amber-700 mt-2">Đang tải...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-amber-700">Chưa có ai hoàn thành!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {leaderboard.map((entry) => (
                <div
                  key={`${entry.rank}-${entry.username}`}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    entry.rank === 1
                      ? 'bg-yellow-200 border-yellow-500'
                      : entry.rank === 2
                      ? 'bg-gray-200 border-gray-500'
                      : entry.rank === 3
                      ? 'bg-orange-200 border-orange-500'
                      : 'bg-white border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </span>
                    <span className="font-medium text-amber-900">{entry.username}</span>
                  </div>
                  <span className="text-sm font-mono text-amber-700">
                    {entry.completionTime}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button
              onClick={onClose}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6"
            >
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}