import requests
import time
import random

BASE_URL = "http://localhost:8000/api/v1"

def test_auth_flow():
    # 1. Register
    email = f"test_{int(time.time())}_{random.randint(1,1000)}@test.com"
    password = "SecurePassword123!"
    full_name = "E2E Test User"
    
    print(f"[*] Testing Registration for {email}...")
    reg_res = requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "username": f"user{int(time.time())}",
        "password": password,
        "full_name": full_name
    })
    
    if reg_res.status_code not in (200, 201):
        print(f"[X] Registration Failed: {reg_res.text}")
        return False
        
    print("[+] Registration Successful!")
    user_data = reg_res.json()
    print(f"    User ID: {user_data.get('id')}")
    
    # 2. Login
    print(f"[*] Testing Login for {email}...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": email,
        "password": password
    })
    
    if login_res.status_code != 200:
        print(f"[X] Login Failed: {login_res.text}")
        return False
        
    print("[+] Login Successful!")
    token = login_res.json().get("access_token")
    
    # 3. Fetch current user (verify token)
    print("[*] Fetching Profile with JWT...")
    prof_res = requests.get(f"{BASE_URL}/auth/me", headers={
        "Authorization": f"Bearer {token}"
    })
    
    if prof_res.status_code != 200:
        print(f"[X] Profile fetch failed: {prof_res.text}")
        return False
        
    print("[+] Profile fetch successful!")
    print(f"    Welcome, {prof_res.json().get('full_name')}")
    
    return token

if __name__ == "__main__":
    test_auth_flow()
