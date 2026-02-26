import re
import unicodedata
from typing import List


def normalize_unicode(text: str) -> str:
    """Normalize unicode to NFC form."""
    return unicodedata.normalize("NFC", text)


def remove_extra_whitespace(text: str) -> str:
    """Collapse multiple spaces/newlines into single space."""
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n", text)
    return text.strip()


def split_into_sentences(text: str) -> List[str]:
    """Split text into sentences on punctuation."""
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if p.strip()]


def split_into_words(text: str) -> List[str]:
    """Split text into words."""
    return text.split()


def char_count(text: str) -> int:
    return len(text)


def word_count(text: str) -> int:
    return len(text.split())


def truncate_text(text: str, max_chars: int = 500, suffix: str = "...") -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars - len(suffix)] + suffix


def is_braille_unicode(char: str) -> bool:
    """Check if character is in the Unicode Braille block (U+2800–U+28FF)."""
    return "\u2800" <= char <= "\u28FF"


def extract_braille_chars(text: str) -> str:
    """Extract only braille unicode characters from a string."""
    return "".join(c for c in text if is_braille_unicode(c))


def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute Levenshtein edit distance between two strings."""
    m, n = len(s1), len(s2)
    dp = list(range(n + 1))
    for i in range(1, m + 1):
        prev = dp[:]
        dp[0] = i
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[j] = prev[j - 1]
            else:
                dp[j] = 1 + min(prev[j], dp[j - 1], prev[j - 1])
    return dp[n]


def compute_cer(reference: str, hypothesis: str) -> float:
    """Character Error Rate = edit_distance / len(reference)."""
    if len(reference) == 0:
        return 0.0 if len(hypothesis) == 0 else 1.0
    return levenshtein_distance(reference, hypothesis) / len(reference)


def compute_wer(reference: str, hypothesis: str) -> float:
    """Word Error Rate = edit_distance_on_words / len(ref_words)."""
    ref_words = reference.split()
    hyp_words = hypothesis.split()
    if len(ref_words) == 0:
        return 0.0 if len(hyp_words) == 0 else 1.0
    return levenshtein_distance(ref_words, hyp_words) / len(ref_words)