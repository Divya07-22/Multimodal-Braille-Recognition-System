import logging
import numpy as np
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Grade 1 Braille: pattern (int 0-63, bits 0-5 = dots 1-6) -> character
# Bit order: bit0=dot1, bit1=dot2, bit2=dot3, bit3=dot4, bit4=dot5, bit5=dot6
PATTERN_TO_CHAR = {
    0b000000: " ",   # space
    0b000001: "a",
    0b000011: "b",
    0b001001: "c",
    0b011001: "d",
    0b010001: "e",
    0b001011: "f",
    0b011011: "g",
    0b010011: "h",
    0b001010: "i",
    0b011010: "j",
    0b000101: "k",
    0b000111: "l",
    0b001101: "m",
    0b011101: "n",
    0b010101: "o",
    0b001111: "p",
    0b011111: "q",
    0b010111: "r",
    0b001110: "s",
    0b011110: "t",
    0b100101: "u",
    0b100111: "v",
    0b111010: "w",
    0b101101: "x",
    0b111101: "y",
    0b110101: "z",
    0b000100: ",",
    0b000110: ";",
    0b010100: ".",
    0b010110: ":",
    0b010010: "!",
    0b000010: "'",
    0b001100: "-",
    0b001110: "/",
    0b100001: "1",
    0b100011: "2",
    0b101001: "3",
    0b111001: "4",
    0b110001: "5",
    0b101011: "6",
    0b111011: "7",
    0b110011: "8",
    0b101010: "9",
    0b111010: "0",
}

CAPITAL_INDICATOR = 0b000000_000001  # dots 6 only = 0b100000
NUMBER_INDICATOR = 0b011111          # dots 3456 = number follows


class PostProcessor:
    """
    Decode classified Braille cells into plain text.
    Handles:
    - Capital indicators
    - Number mode
    - Line/row ordering
    - Word spacing
    """

    def __init__(self, line_tolerance_factor: float = 0.6):
        self.line_tol = line_tolerance_factor

    def decode(self, cells: List[Dict[str, Any]]) -> str:
        if not cells:
            return ""

        sorted_cells = self._sort_cells_by_reading_order(cells)
        text = []
        capital_mode = False
        number_mode = False

        for cell in sorted_cells:
            pattern = cell["pattern"]

            # Capital indicator (dot 6 only = 0b100000)
            if pattern == 0b100000:
                capital_mode = True
                continue

            # Number indicator
            if pattern == NUMBER_INDICATOR:
                number_mode = True
                continue

            char = PATTERN_TO_CHAR.get(pattern, "?")

            if char == " ":
                number_mode = False
                text.append(" ")
                continue

            if number_mode:
                # Shift a-j to 1-0
                num_map = {
                    "a": "1", "b": "2", "c": "3", "d": "4", "e": "5",
                    "f": "6", "g": "7", "h": "8", "i": "9", "j": "0",
                }
                char = num_map.get(char, char)
            elif capital_mode:
                char = char.upper()
                capital_mode = False

            text.append(char)

        return "".join(text)

    def _sort_cells_by_reading_order(self, cells: List[Dict]) -> List[Dict]:
        """Sort cells by rows then left-to-right within each row."""
        if not cells:
            return []

        boxes = [c["box"] for c in cells]
        heights = [b[3] - b[1] for b in boxes]
        avg_height = np.mean(heights) if heights else 20
        tolerance = avg_height * self.line_tol

        def row_key(cell):
            y1 = cell["box"][1]
            row = int(y1 / tolerance)
            return row

        return sorted(cells, key=lambda c: (row_key(c), c["box"][0]))