# keychain led matrix
This project aims to create a web interface for a custom made PCB for an 8x16 LED matrix display using ESP8266.

<img src="https://raw.githubusercontent.com/Prateek7805/keychain_led_matrix/main/keyChain.jpg" alt="8x16 Display" width="200" height="auto"/>

[Demo](instagram.com/p/CPmjHNIFKIF/)

### Features: ###
* Pocket size PCB - smaller footprint using 0603 smd LEDs.
* Supports all printable characters in the ASCII table.
* Contains memory (Using SPIFFS).
* Web Interface to display words.
* Totally reprogrammable and hackable.
* Fewer components.
* battery operated and rechargable.
* Web Interface contains additional features to change from STA to AP, deepsleep, reset mcu etc.
* I have also built a webpage to create pixel art (8x8) however I also included the ASCII_Table.h containing all ASCII characters in 8 byte arrays.
* Brightness and scroll speed control.
* fast operation thanks to websockets.
* Uses Wifimanager hence can connect to any AP (Access Point) without reprogramming.

### The PCB is designed in KiCad ###

### Tool to make Pixel Art [click here](https://leddots.000webhostapp.com/)

### Dependencies ###
* [WiFiManager](https://github.com/tzapu/WiFiManager)
* [Websockets](https://github.com/Links2004/arduinoWebSockets)
* [FS Plugin](https://github.com/esp8266/arduino-esp8266fs-plugin/releases)

### Steps to make one: ###

#### Fabricating the PCB ####
* Download and Install KiCad.
* Open the 'keychain.pro' file from '/PCB Design' folder
* Edit the design if needed
* Generate the gerber and drill files
* Upload to the PCB manufacturers website

#### Uploading the code ####
* This requires an FTDI programmer or a nodemcu
* Follow the pinout below and connect the pins accordingly
<img src="https://raw.githubusercontent.com/Prateek7805/keychain_led_matrix/main/Pinout.JPG" alt="Pinout" width="500" height="auto"/>
* Download and Install Arduino IDE
* Install ESP8266 board
* [Install the SPIFFS upload plugin](https://randomnerdtutorials.com/install-esp8266-filesystem-uploader-arduino-ide/)
* Open the keyChainMatrix-v6.ino
* select the board to be ESP-12 and Flash size as 4MB(FS:2MB) 
* Select the appropriate COM PORT and click upload
* Click tools > ESP8266 Sketch Data Upload
* If you are new this I would recommend watching a tutorial on running a blick sketch on ESP8266

#### Initial Setup ####
* Power on the card sized LED Matrix
* Since it uses WiFiManager WiFi credentials need to be stored in runtime.
* On you PC/smartphone open WiFi settings and connect to 'pocketMatrix' AP.
* It prompts a sign in or manually open a browser and go to '192.168.4.1/'.
* Now scan for the SSID (WiFi Name) or Enter the SSID and Password Manually.
* Now the ESP8266 resets and connect to the provided AP.

### Initial Run ###
* The LED matrix displays the Local IP on reboot or power on. 
* Connect your PC or smartphone to the same AP to which the LED matrix is connected.
* Open a browser and go to the IP address displayed by the LED matrix.
* The page displayed is the interface here
* You can enter any String in the Enter Text Input and click on submit
* The display will instantly display the entered text (Character limit: 1024)
* The range inputs can be used to change the speed and brightness as they fire onInput realtime results can be achived.
* You can rename or delete the strings data box below.
* You can power off the LED display using the On/Off button beside the Delete button however this only powers off the Display and **not the MCU and WiFi**.

### settings ###
* Open the web interface in a browser.
* Click the gear icon on the top right corner of the screen to open settings
* There are a number of cards each of which performs a function 
    * Wifi Mode - Used to change from connect to an AP (STA) to Start an AP (AP)
    * Factory Reset - Click the reset button and click 'Yes' to factory reset the display this will restore the original settings(Warning: The Data will be lost as it clears the SPIFFS)
    * Auto off - Sets an auto off timer
    * WiFi AP - Used to set SSID and Password for the AP mode
    * WiFi Power - clicking PowerDown turns the WIFI radio off However the text will still be displayed, just the wifi will be disabled
    * Reset - Clicking Reset MCU resets the ESP8266.
    * Deepsleep - Puts ESP8266 into deepSleep this can be used if the display needs to be turned off wirelessly however approx 20-50uA current is drawn.
