import pytest
from app.services.braille_service import BrailleService, DOT_PATTERN_TO_CHAR


@pytest.fixture
def service():
    return BrailleService()


def test_translate_braille_unicode(service):
    braille = "⠓⠑⠇⠇⠕"
    result = service.translate_braille_to_text(braille)
    assert isinstance(result["text"], str)
    assert result["confidence"] >= 0.0
    assert result["grade"] == 1


def test_translate_space(service):
    result = service.translate_braille_to_text("⠀")
    assert result["text"] == " "


def test_dot_pattern_to_char(service):
    assert service.dot_pattern_to_char(0b000001) == "a"
    assert service.dot_pattern_to_char(0b000011) == "b"
    assert service.dot_pattern_to_char(0b000000) == " "


def test_dots_array_to_text(service):
    patterns = [0b000001, 0b000000, 0b000011]
    result = service.dots_array_to_text(patterns)
    assert result == "a b"


def test_unknown_dot_pattern(service):
    result = service.dot_pattern_to_char(0b111111)
    assert isinstance(result, str)


def test_full_alphabet(service):
    braille_alphabet = "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵"
    result = service.translate_braille_to_text(braille_alphabet)
    assert result["confidence"] == 1.0
    assert result["text"] == "abcdefghijklmnopqrstuvwxyz"