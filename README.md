## What Client to chose? 
Use: Postman<br/>Why: Based on my observation in order to proper communication it is suggested to use Postman Client, as Insomnia do not works with socket.io Server.

## Client Listener Settings
Configure your Postman client Websocket Evnets listeners accordingly: 
1. Listen to "message" <-- return gateway messages
2. Listen to "exception" <-- return gateway exception
3. Listen to "welcome" <-- return gateway welcome message (Optional)

## Client Send Message Format
Configure your Postman client to send data as JSON, other formats are prohibited, and will not work. 

