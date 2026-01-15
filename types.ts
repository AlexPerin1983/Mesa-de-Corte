
export interface PieceRequest {
  id: string;
  height: number; // in cm
  width: number;  // in cm
  quantity: number;
}

export interface PlacedPiece {
  id: string;
  originalId: string;
  x: number;      // in cm
  y: number;      // in cm
  width: number;  // in cm
  height: number; // in cm
  rotation: number; // 0 or 90
}

export interface PackingResult {
  placedPieces: PlacedPiece[];
  totalWidthUsed: number;
  totalLengthUsed: number;
  efficiency: number;
  wasteArea: number;
}

export interface CoilConfig {
  materialType: string;
  width: number;  // in meters
  length: number; // in meters
  safetyMargin: number; // in cm
}
