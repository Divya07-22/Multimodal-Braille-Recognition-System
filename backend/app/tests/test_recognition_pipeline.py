import pytest
import numpy as np
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.mark.asyncio
async def test_pipeline_returns_text():
    with patch("app.ml.inference.pipeline.BrailleInferencePipeline") as MockPipeline:
        instance = MockPipeline.return_value
        instance.run = AsyncMock(return_value={
            "text": "hello world",
            "detected_cells": 11,
            "confidence": 0.92,
            "processing_time_ms": 45.2,
            "model_version": "1.0.0",
        })
        result = await instance.run("fake_path.jpg")
        assert result["text"] == "hello world"
        assert result["detected_cells"] == 11
        assert result["confidence"] == pytest.approx(0.92)


@pytest.mark.asyncio
async def test_pipeline_empty_image():
    with patch("app.ml.inference.pipeline.BrailleInferencePipeline") as MockPipeline:
        instance = MockPipeline.return_value
        instance.run = AsyncMock(return_value={
            "text": "",
            "detected_cells": 0,
            "confidence": 0.0,
            "processing_time_ms": 10.0,
            "model_version": "1.0.0",
        })
        result = await instance.run("empty.jpg")
        assert result["detected_cells"] == 0
        assert result["text"] == ""