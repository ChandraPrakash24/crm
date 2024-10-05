import requests

# Define the API endpoint, headers, and data
url = 'https://auth.neevcloud.com/realms/master/protocol/openid-connect/token'
headers = {'Content-Type': 'application/x-www-form-urlencoded'}
data = {
    'client_id': 'osie-admin-api',
    'client_secret': 'qE7hrZBoVmQI6jW8iHceokfXzH7R3jMt',
    'grant_type': 'client_credentials'
}

# Send the POST request
response = requests.post(url, headers=headers, data=data)

# Check if the request was successful
if response.status_code == 200:
    # Parse the JSON response
    response_json = response.json()
    
    # Extract the access token
    access_token = response_json.get('access_token', '')

    if access_token:
        # Write the access token to bearer.tsx
        with open('bearer.txt', 'w') as token_file:
            token_file.write(access_token)
        
        print("Access token successfully saved to bearer.txt")
    else:
        print("Access token not found in the response.")
else:
    print(f"Failed to retrieve token. HTTP Status Code: {response.status_code}")