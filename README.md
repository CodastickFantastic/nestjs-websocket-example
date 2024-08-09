## What Client to choose? 
Use: Postman<br/>Why: Based on my observation in order to proper communication it is suggested to use Postman Client, as Insomnia do not works with socket.io Server.

## Client Listener Settings
Configure your Postman client Websocket Evnets listeners accordingly: 
1. Listen to "message" <-- return gateway messages (Required)
2. Listen to "exception" <-- return gateway exception (Required)
3. Listen to "welcome" <-- return gateway welcome message (Optional)

## Client Send Message Format
Configure your Postman client to send data as JSON, other formats are prohibited, and will not work. 

## Supported Incoming Messages
1. create sensor data <-- Endpoint to create data that accept following parameters in JSON
2. show all sensor data <-- Returns all data

## Create Data Sensor JSON Example
{ "sensor_id": "12", "temperatureUnit": "C", "temperature": 10, "humidity": 10 }

## Environmental Example
MONGO_URI=mongodb://db_user_name:db_user_password@localhost:27017/db_name

## Websocket Endpoint 
ws://localhost:3000 

## Instalation
1. Just coppy repo to your PC
2. docker compose up -d
3. Connect to ws://localhost:3000 via Postman client