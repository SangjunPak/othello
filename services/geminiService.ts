
import { GoogleGenAI, Type } from "@google/genai";
import { Player, BoardState, Move } from "../types";
import { getValidMoves } from "./gameLogic";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGeminiMove = async (board: BoardState, player: Player): Promise<Move | null> => {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) return null;

  const boardString = board.map(row => row.join(',')).join('\n');
  const playerColor = player === Player.BLACK ? "Black (1)" : "White (2)";
  const validMovesString = validMoves.map(m => `(${m.row},${m.col})`).join(', ');

  const prompt = `
    You are a professional Othello (Reversi) strategist.
    The current board state (0: Empty, 1: Black, 2: White):
    ${boardString}

    You are playing as ${playerColor}.
    Your valid moves are: ${validMovesString}

    Choose the absolute best move to maximize your long-term control of the board. 
    Consider corner control, edge stability, and mobility limitation for the opponent.
    Return the move as a JSON object.
  `;

  try {
    // Fix: Using gemini-3-pro-preview for advanced strategy reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER },
            col: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ["row", "col"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Received empty response from Gemini API");
    
    const result = JSON.parse(text.trim());
    
    // Validate if the AI's suggested move is actually in our valid moves list
    const isActuallyValid = validMoves.some(m => m.row === result.row && m.col === result.col);
    if (isActuallyValid) {
      return { row: result.row, col: result.col };
    }
    
    // Fallback if AI suggests an invalid move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  } catch (error) {
    console.error("Gemini AI move failed:", error);
    // Simple fallback to the first valid move in case of error
    return validMoves[0];
  }
};
