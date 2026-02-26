import re
import logging
from typing import Tuple

logger = logging.getLogger(__name__)


class NLPPostProcessor:
    """
    Post-process OCR/Braille recognized text using:
    1. Rule-based cleanup
    2. SymSpell spell correction
    3. Confidence scoring
    """

    def __init__(self):
        self.symspell = None
        self._load_symspell()

    def _load_symspell(self):
        try:
            from symspellpy import SymSpell, Verbosity
            self.symspell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
            import pkg_resources
            dict_path = pkg_resources.resource_filename(
                "symspellpy", "frequency_dictionary_en_82_765.txt"
            )
            self.symspell.load_dictionary(dict_path, term_index=0, count_index=1)
            self._Verbosity = Verbosity
            logger.info("SymSpell spell checker loaded.")
        except Exception as e:
            logger.warning(f"SymSpell not available: {e}. Spell correction disabled.")
            self.symspell = None

    def correct(self, text: str) -> Tuple[str, float]:
        """
        Correct text and return (corrected_text, confidence_score).
        confidence_score: 1.0 if no corrections, lower if many corrections needed.
        """
        if not text or not text.strip():
            return text, 1.0

        cleaned = self._rule_based_clean(text)

        if self.symspell:
            corrected, n_corrections = self._symspell_correct(cleaned)
            total_words = max(len(cleaned.split()), 1)
            confidence = max(0.5, 1.0 - (n_corrections / total_words) * 0.2)
        else:
            corrected = cleaned
            confidence = 1.0

        corrected = self._capitalize_sentences(corrected)
        return corrected, confidence

    def _rule_based_clean(self, text: str) -> str:
        text = re.sub(r" {2,}", " ", text)
        text = re.sub(r"([.!?])\s*([a-z])", lambda m: m.group(1) + " " + m.group(2).upper(), text)
        text = re.sub(r"[^\x20-\x7E\n]", "", text)
        text = text.strip()
        return text

    def _symspell_correct(self, text: str) -> Tuple[str, int]:
        words = text.split()
        corrected_words = []
        n_corrections = 0
        for word in words:
            if re.match(r"^[^a-zA-Z]+$", word):
                corrected_words.append(word)
                continue
            punct_before = re.match(r"^([^a-zA-Z]*)", word).group(1)
            punct_after = re.search(r"([^a-zA-Z]*)$", word).group(1)
            core = word[len(punct_before):len(word) - len(punct_after) if punct_after else None]
            suggestions = self.symspell.lookup(
                core.lower(), self._Verbosity.CLOSEST, max_edit_distance=2
            )
            if suggestions and suggestions[0].term != core.lower():
                suggestion = suggestions[0].term
                if core[0].isupper():
                    suggestion = suggestion.capitalize()
                corrected_words.append(punct_before + suggestion + punct_after)
                n_corrections += 1
            else:
                corrected_words.append(word)
        return " ".join(corrected_words), n_corrections

    def _capitalize_sentences(self, text: str) -> str:
        sentences = re.split(r"(?<=[.!?])\s+", text)
        capitalized = [s[0].upper() + s[1:] if s else s for s in sentences]
        return " ".join(capitalized)