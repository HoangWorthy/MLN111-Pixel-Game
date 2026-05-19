import { ExhibitData } from "@/types/museum";

export {};

declare global {
  interface Window {
    handleExhibitInteract?: (exhibit: ExhibitData) => void;
    handleDoorInteract?: (roomNumber: number) => void;
    unlockRoom?: (roomNumber: number) => void;
    currentUsername?: string;
    showPictureModal?: (imagePath: string) => void;
  }
}
