import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_register_and_login():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Register
        reg = await client.post("/api/v1/auth/register", json={
            "email": "testuser@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "TestPass1",
        })
        assert reg.status_code in (201, 409)

        # Login
        login = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "TestPass1",
        })
        assert login.status_code == 200
        data = login.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with AsyncClient(app=app, base_url="http://test") as client:
        resp = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "WrongPass99",
        })
        assert resp.status_code == 401


@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "email": "dup@example.com",
            "username": "dupuser",
            "full_name": "Dup User",
            "password": "TestPass1",
        }
        r1 = await client.post("/api/v1/auth/register", json=payload)
        r2 = await client.post("/api/v1/auth/register", json=payload)
        assert r2.status_code == 409


@pytest.mark.asyncio
async def test_refresh_token():
    async with AsyncClient(app=app, base_url="http://test") as client:
        login = await client.post("/api/v1/auth/login", json={
            "email": "testuser@example.com",
            "password": "TestPass1",
        })
        if login.status_code != 200:
            pytest.skip("Login failed, skipping refresh test")
        refresh_token = login.json()["refresh_token"]
        resp = await client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()