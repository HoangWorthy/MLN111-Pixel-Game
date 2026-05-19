import { Room } from '../types/game';

export class RoomModel {
  private rooms = new Map<number, Room>();

  constructor() {
    this.initializeRooms();
  }

  private initializeRooms(): void {
    const defaultRooms = [
      { id: 1, name: 'Phòng 1: Tổng Quan' },
      { id: 2, name: 'Phòng 2: Bản Chất & Hình Thức' },
      { id: 3, name: 'Phòng 3: Nghiên Cứu Khoa Học' }
    ];

    defaultRooms.forEach(room => {
      this.rooms.set(room.id, {
        ...room,
        players: [],
        messages: [],
        createdAt: new Date()
      });
    });
  }

  findById(id: number): Room | undefined {
    return this.rooms.get(id);
  }

  addPlayerToRoom(roomId: number, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room && !room.players.includes(playerId)) {
      room.players.push(playerId);
      return true;
    }
    return false;
  }

  removePlayerFromRoom(roomId: number, playerId: string): boolean {
    const room = this.rooms.get(roomId);
    if (room) {
      const index = room.players.indexOf(playerId);
      if (index > -1) {
        room.players.splice(index, 1);
        return true;
      }
    }
    return false;
  }

  movePlayer(fromRoomId: number, toRoomId: number, playerId: string): boolean {
    const removed = this.removePlayerFromRoom(fromRoomId, playerId);
    const added = this.addPlayerToRoom(toRoomId, playerId);
    return removed && added;
  }

  getPlayersInRoom(roomId: number): string[] {
    const room = this.rooms.get(roomId);
    return room ? [...room.players] : [];
  }

  getRoomPlayerCount(roomId: number): number {
    const room = this.rooms.get(roomId);
    return room ? room.players.length : 0;
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoomStats(): Array<{id: number, name: string, playerCount: number}> {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.length
    }));
  }

  reset(): void {
    this.rooms.clear();
    this.initializeRooms();
  }

  cleanup(): void {
    this.rooms.forEach(room => {
      room.players = room.players.filter(playerId => playerId);
    });
  }
}
