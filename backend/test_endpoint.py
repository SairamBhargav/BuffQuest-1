"""Debug the exact HTTP response including redirects."""
import http.client
import json

def make_request(method, path, body=None):
    conn = http.client.HTTPConnection("127.0.0.1", 8000)
    headers = {"Content-Type": "application/json"} if body else {}
    conn.request(method, path, body=body, headers=headers)
    res = conn.getresponse()
    data = res.read().decode("utf-8")
    print(f"{method} {path} -> {res.status} {res.reason}")
    print(f"  Body: {data[:300]}")
    print()
    return res.status

# Test both URLs with and without trailing slash
body = json.dumps({
    "title": "ValidTitle",
    "description": "Valid description for quest",
    "latitude": 40.0,
    "longitude": -105.0,
    "cost_credits": 0,
    "reward_credits": 10,
    "reward_notoriety": 2
}).encode("utf-8")

make_request("GET", "/health")
make_request("POST", "/api/quests?user_id=00000000-0000-0000-0000-000000000001", body)
make_request("POST", "/api/quests/?user_id=00000000-0000-0000-0000-000000000001", body)
