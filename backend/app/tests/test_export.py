import os
import pytest
from app.services.export_service import ExportService


@pytest.fixture
def export_service():
    return ExportService()


@pytest.mark.asyncio
async def test_export_txt(export_service, tmp_path, monkeypatch):
    monkeypatch.setattr(
        "app.services.export_service.EXPORT_DIR", str(tmp_path)
    )
    path = await export_service.export("Hello Braille", "txt", "test_out")
    assert os.path.exists(path)
    with open(path) as f:
        assert f.read() == "Hello Braille"


@pytest.mark.asyncio
async def test_export_json(export_service, tmp_path, monkeypatch):
    monkeypatch.setattr(
        "app.services.export_service.EXPORT_DIR", str(tmp_path)
    )
    path = await export_service.export("Hello Braille", "json", "test_out")
    assert os.path.exists(path)
    import json
    with open(path) as f:
        data = json.load(f)
    assert data["recognized_text"] == "Hello Braille"
    assert data["word_count"] == 2


@pytest.mark.asyncio
async def test_export_invalid_format(export_service):
    with pytest.raises(ValueError):
        await export_service.export("text", "xml", "filename")