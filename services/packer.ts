
import { PieceRequest, PlacedPiece, PackingResult } from '../types';

/**
 * Optimizes the placement of pieces on a long roll of material.
 * Algorithm: Next Fit Decreasing Height (NFDH) variant for strip packing.
 */
export const calculatePlanoDeCorte = (
  pieces: PieceRequest[],
  coilWidthM: number,
  safetyMarginCm: number
): PackingResult => {
  const coilWidthCm = coilWidthM * 100;
  const margin = safetyMarginCm;
  const effectiveWidth = coilWidthCm - (2 * margin);

  // Flatten piece requests into individual units
  const flatPieces = pieces.flatMap(p => 
    Array.from({ length: p.quantity }).map((_, i) => ({
      ...p,
      instanceId: `${p.id}-${i}`
    }))
  );

  // Sort by height descending (Next Fit Decreasing Height logic)
  // We use height as the dimension aligned with the roll's width? 
  // Actually, usually pieces are placed based on how they fit the width.
  // Let's assume height in the UI is 'along the roll length' and width is 'across the roll width'
  // Or vice versa. Let's stick to: 
  // piece.width goes across the coil width.
  // piece.height goes along the coil length.
  
  // Sort by height (y-dimension) descending
  const sorted = [...flatPieces].sort((a, b) => b.height - a.height);

  const placed: PlacedPiece[] = [];
  let currentShelfY = margin;
  let currentShelfHeight = 0;
  let currentShelfX = margin;
  let maxUsedLength = 0;

  sorted.forEach(p => {
    // If piece is wider than coil width, it won't fit (simplification: assume user doesn't input invalid)
    const pW = p.width;
    const pH = p.height;

    // Check if piece fits in current shelf
    if (currentShelfX + pW > coilWidthCm - margin) {
      // Start a new shelf
      currentShelfY += currentShelfHeight + margin;
      currentShelfX = margin;
      currentShelfHeight = 0;
    }

    // Place piece
    placed.push({
      id: p.instanceId,
      originalId: p.id,
      x: currentShelfX,
      y: currentShelfY,
      width: pW,
      height: pH,
      rotation: 0
    });

    currentShelfX += pW + margin;
    currentShelfHeight = Math.max(currentShelfHeight, pH);
    maxUsedLength = Math.max(maxUsedLength, currentShelfY + pH + margin);
  });

  const totalUsedArea = flatPieces.reduce((sum, p) => sum + (p.width * p.height), 0);
  const totalOccupiedArea = coilWidthCm * maxUsedLength;
  const efficiency = totalOccupiedArea > 0 ? (totalUsedArea / totalOccupiedArea) * 100 : 0;
  const wasteArea = (totalOccupiedArea - totalUsedArea) / 10000; // in m2

  return {
    placedPieces: placed,
    totalWidthUsed: coilWidthCm,
    totalLengthUsed: maxUsedLength / 100, // in meters
    efficiency,
    wasteArea
  };
};
