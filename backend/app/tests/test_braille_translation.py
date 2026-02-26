import pytest
from app.services.braille_service import BrailleService

service = BrailleService()


@pytest.mark.parametrize("braille,expected", [
    ("⠁", "a"),
    ("⠃", "b"),
    ("⠉", "c"),
    ("⠙", "d"),
    ("⠑", "e"),
    ("⠋", "f"),
    ("⠛", "g"),
    ("⠓", "h"),
    ("⠊", "i"),
    ("⠚", "j"),
    ("⠅", "k"),
    ("⠇", "l"),
    ("⠍", "m"),
    ("⠝", "n"),
    ("⠕", "o"),
    ("⠏", "p"),
    ("⠟", "q"),
    ("⠗", "r"),
    ("⠎", "s"),
    ("⠞", "t"),
    ("⠥", "u"),
    ("⠧", "v"),
    ("⠺", "w"),
    ("⠭", "x"),
    ("⠽", "y"),
    ("⠵", "z"),
])
def test_single_braille_char(braille, expected):
    result = service.translate_braille_to_text(braille)
    assert result["text"] == expected
    assert result["confidence"] == 1.0


def test_empty_string():
    result = service.translate_braille_to_text("")
    assert result["text"] == ""
    assert result["confidence"] == 1.0


def test_mixed_known_unknown():
    result = service.translate_braille_to_text("⠁X")
    assert result["confidence"] < 1.0