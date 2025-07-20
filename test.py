import requests

url = "http://localhost:3000/api/auth/login"  # Change port/path as needed
payload = {
    "username": "your_username",
    "password": "your_password"
}
response = requests.post(url, json=payload)

print("Status Code:", response.status_code)
print("Response JSON:", response.json())