  #include <SPI.h>
  #include <PN532_SPI.h>
  #include <PN532.h>
  #include <NfcAdapter.h>
  #include <Math.h>
  #include <AccelStepper.h>


//https://saber.patagoniatec.com/2014/11/13-56-mhz-rfid-nfc-shield-elecfreaks-arduino-uno-r3-argentina-ptec/

  //NFC shield
  PN532_SPI pn532spi(SPI, 10);               //SPI port digital 10
  NfcAdapter nfc = NfcAdapter(pn532spi);     //Setup nfc drivers

  #define BAUDRATE 19200 //9600

  //PINOUT
  const byte StepperXPulse=5;     //D5 -> Linear movement Stepper pulse
  const byte StepperXDir=3;       //D3 -> Direction of linear movement
  const byte StepperEnable=4;     //D4 -> Enable Steppers
  const byte ldr=2;               //D2 -> LDR (Interruption)
  const byte ldrPow=6;            //D6 -> LDR POWER

  AccelStepper stepper(1,StepperXPulse,StepperXDir);

  //GLOBALS
  //NFC variables
  String tagId="";               //Variable for TAG NFC ID value
  String command;                //Variable to receive RPI3 order
  String tagNdefUri="";          //Variable to store the URL for TAG writing
  String response="";            //Variable to store the response to RPI
  int romIt=0;                   //Variable to determine to ROM or not to ROM: 1 -> ROM  0-> NO ROM
  unsigned long timeToDetect;    //Variable to store the time it took to detect TAG
  unsigned long timeToIdentify;  //Variable to store the time it took to read TAG id
  unsigned long timeToRead;      //Variable to store the time it took to read a NDEF field
  unsigned long timeToWrite;     //Variable to store the time it took to write a NDEF field
  //OTHER variables
  bool ldr_val=true;              //True vol dir que LDR reb llum
  unsigned long lastInterrupt;



  /************************************* COMMON METHODS ******************************/
  //METHOD TO READ String FROM SERIAL PORT
  void readSerialString() {
      while(Serial.available() == 0){}       //Wait till a serial data is available
      if(Serial.available()) {               //If serial port is available
        command=Serial.readString();
      }
  }

  String getValue(String data, char separator, int index)
  {
      int found = 0;
      int strIndex[] = { 0, -1 };
      int maxIndex = data.length() - 1;

      for (int i = 0; i <= maxIndex && found <= index; i++) {
          if (data.charAt(i) == separator || i == maxIndex) {
              found++;
              strIndex[0] = strIndex[1] + 1;
              strIndex[1] = (i == maxIndex) ? i+1 : i;
          }
      }
      return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
  }

  /************************************* NFC METHODS ******************************/

  //METHOD TO READ NFC ID
  void readTagId() {
    unsigned long start= millis();
    unsigned long endDetect = 0;
    unsigned long endIdentify = 0;
    int counter=0;
    int timeout=0;
    while ((!nfc.tagPresent())&&(timeout!=0)) {
      delay(10);
      counter=counter+1;
      if (counter>200){
        timeout=1;
      }
    };
    endDetect = millis();
    timeToDetect = endDetect - start;
    if (timeout==0){
      NfcTag tag = nfc.read();
      tagId=tag.getUidString();
    }else{
      tagId="error";
    }
    endIdentify = millis();
    timeToIdentify = endIdentify - start;
  }

  //METHOD TO WRITE A TAG
  bool writeTagUri() {
    NdefMessage message = NdefMessage();
    message.addUriRecord(command);
    return nfc.write(message);
  }

  //METHOD TO READ THE URI OF THE FIRST NDEF FIELD FOUND
  bool checkTagUri() {
    unsigned long start= millis();
    unsigned long endOfRead = 0;
    NfcTag tag = nfc.read();
    endOfRead = millis();
    timeToRead = endOfRead - start;
    NdefMessage message =tag.getNdefMessage();        //Get the ndef
    NdefRecord record = message.getRecord(0);         //Get the record of the ndef
    String payload=record.payloadStringify();
    String original="."+command;                      //not sure if needed: original.replace("http://","."); -> Old school, if it works don't touch it.
    if (original==payload){
     return true;                                     //Check is success :)
    }else{
      response=response+payload+"::::"+original+"++";
      return false;                                   //Check failed :(
    }
  }

  //METHOD TO ROM THE TAG
  void romTag() {
    NfcTag tag = nfc.read();
    nfc.ROM();
  }


  void setup() {
    // put your setup code here, to run once:
    nfc.begin();                            //Start NFC as SPI mode
    delay(250);

    pinMode(ldrPow, OUTPUT);
    digitalWrite(ldrPow, HIGH);         //Power up LDR module
    pinMode(StepperEnable, OUTPUT);
    digitalWrite(StepperEnable, HIGH);  //Enable Stepper
    pinMode(ldr,INPUT_PULLUP);          //Set LDR as input channel with pull up resistor

    delay(200); //Stabilize input
    //Setup the value of ldr_val
    if (digitalRead(ldr)==HIGH){
      ldr_val=true;
    }else{
      ldr_val=false;
    }

    attachInterrupt(digitalPinToInterrupt(ldr),LDR_ISR,CHANGE);

    stepper.setMaxSpeed(200);
    stepper.setAcceleration(150);

    Serial.begin(BAUDRATE);                 //Set the speed of the communication with RPI3
    while (!Serial) { }                     // wait for serial port to connect. Needed for native USB
    Serial.flush();
    Serial.println("Arduino:nfc:Ready:*****");

  }

  void LDR_ISR(){
    //if (millis() - lastInterrupt > 5){  //Avoid double bounce
      //Serial.println("LDR changed");
      if (digitalRead(ldr)==HIGH){
        ldr_val=true;
      }else{
        ldr_val=false;
      }
      //lastInterrupt=millis();
   // }
  }

  void loop() {
    // put your main code here, to run repeatedly:
    command="";
    //Serial.println("loop");
    readSerialString();
    //Serial.println(command);
  /*
    if ((command=="init")){           //init role => Put first in pre-position (tapant ldr abans d'entrar)
      stepper.moveTo(100000);       //Put timeout steps
      while(ldr_val){               //While ldr receives light, keep moving
        stepper.run();              //Step it
      }
      stepper.stop();               //Stop stepper when ldr stops receiving light
      Serial.println("init*****");
    }
  */

    if (command.indexOf('https')>=0){        //Write the tag
      timeToDetect=0;
      timeToIdentify=0;
      timeToRead=0;
      timeToWrite=0;
      response="";
      readTagId();                          //Read the id of the NFC chip
      response=response+tagId+"**";              //Prepare response string idTag**
      unsigned long start= millis();
      unsigned long endOfWrite = 0;
      if (writeTagUri()){                     //Write the URL into the chip
        endOfWrite = millis();
        if (checkTagUri()){                     //Check if the written URL is correct
          if (romIt==1){                          //ROM it or not:
            romTag();
            response=response+"RO**";               //Prepare response string RO => Read Only => SUCCESS AND ROMED
          }else{
            response=response+"R**";                //Prepare response string R => Read => SUCCESS AND NO ROMED
          }
        }else{
          response=response+"RE**";                 //Prepare response string RE => Read Error
        }
      }else{
        endOfWrite = millis();
        response=response+"WE**";                 //Prepare response string WE => Write Error
      }
      timeToWrite = endOfWrite - start;
      /* TODO: ADD timing params: Time to identify, Time to Write, Time to Read, Try to get more info about the chip */
      response=response+timeToDetect+"**";                 //Prepare response Time to Read tag in miliseconds
      response=response+timeToIdentify+"**";                 //Prepare response Time to Read tag in miliseconds
      response=response+timeToRead+"**";                 //Prepare response Time to Read tag in miliseconds
      response=response+timeToWrite+"**";                 //Prepare response Time to write tag in miliseconds
      Serial.println(response+"***");
    }

    if (command=="S"){           //Set Sticker on position
      stepper.moveTo(100000);       //Put timeout steps
      bool aux_ldr=ldr_val;
      if (aux_ldr){ //In normal operation
        while(ldr_val){               //Run till next sticker
          stepper.run();              //Step it
        }
        while(!ldr_val){               //Run till sticker passed
          stepper.run();              //Step it
        }
        stepper.stop();               //Stop stepper
      }else{      //After init
        while(!ldr_val){               //Run till sticker passed
          stepper.run();              //Step it
        }
        stepper.stop();               //Stop stepper
      }
      Serial.println("SOK*****");
    }

    if (command=="C"){   //Set ROM -> Tanca les etiquetes
      romIt=1;
      Serial.println("ROK*****");  //Rom enable
    }
    if (command=="D"){   //UnSet ROM -> NO tanquis les etiquetes
      romIt=0;
      Serial.println("RKO*****");  //Rom disabled
    }




    //stepper.runToNewPosition(8000);
    //stepper.runToNewPosition(0);
  }
