# Combining Electronics

## Compiled Code From Different Pages

[ESP32C3 BLE Code](./wireless-communication.md)

```cpp
#include <ArduinoBLE.h>

void setup() {
  Serial.begin(9600);
  while (!Serial);

  // begin initialization
  if (!BLE.begin()) {
    Serial.println("starting Bluetooth® Low Energy module failed!");

    while (1);
  }

  Serial.println("Bluetooth® Low Energy Central - Peripheral Explorer");

  // start scanning for peripherals
  BLE.scanForName("DSD TECH");
}

void loop() {
  // check if a peripheral has been discovered
  BLEDevice peripheral = BLE.available();

  if (peripheral) {
    // discovered a peripheral, print out address, local name, and advertised service
    Serial.print("Found ");
    Serial.print(peripheral.address());
    Serial.print(" '");
    Serial.print(peripheral.localName());
    Serial.print("' ");
    Serial.print(peripheral.advertisedServiceUuid());
    Serial.println();

    // see if peripheral is a LED
    if (peripheral.localName() == "DSD TECH") { //LED
      // stop scanning
      BLE.stopScan();

      explorerPeripheral(peripheral);

      // peripheral disconnected, we are done
      while (1) {
        // do nothing
      }
    }
  }
}

void explorerPeripheral(BLEDevice peripheral) {
  // connect to the peripheral
  Serial.println("Connecting ...");

  if (peripheral.connect()) {
    Serial.println("Connected");
  } else {
    Serial.println("Failed to connect!");
    return;
  }

  // discover peripheral attributes
  Serial.println("Discovering attributes ...");
  if (peripheral.discoverAttributes()) {
    Serial.println("Attributes discovered");
  } else {
    Serial.println("Attribute discovery failed!");
    peripheral.disconnect();
    return;
  }

  // read and print device name of peripheral
  Serial.println();
  Serial.print("Device name: ");
  Serial.println(peripheral.deviceName());
  Serial.print("Appearance: 0x");
  Serial.println(peripheral.appearance(), HEX);
  Serial.println();

  // loop the services of the peripheral and explore each
  for (int i = 0; i < peripheral.serviceCount(); i++) {
    BLEService service = peripheral.service(i);

    exploreService(service);
  }

  Serial.println();

  // we are done exploring, disconnect
  Serial.println("Disconnecting ...");
  peripheral.disconnect();
  Serial.println("Disconnected");
}

void exploreService(BLEService service) {
  // print the UUID of the service
  Serial.print("Service ");
  Serial.println(service.uuid());

  // loop the characteristics of the service and explore each
  for (int i = 0; i < service.characteristicCount(); i++) {
    BLECharacteristic characteristic = service.characteristic(i);

    exploreCharacteristic(characteristic);
  }
}

void exploreCharacteristic(BLECharacteristic characteristic) {
  // print the UUID and properties of the characteristic
  Serial.print("\tCharacteristic ");
  Serial.println(characteristic.uuid());
  char s[] = "ffe1";
  Serial.print(s[3]);Serial.print(" == ");Serial.print(characteristic.uuid()[3]);Serial.println("? ");Serial.println(characteristic.uuid()[3] == s[3]);
  if (characteristic.uuid()[3] == s[3]){
    Serial.print("WRITING 6 to ");Serial.println(characteristic.uuid());
  uint8_t v_ = 6;
  characteristic.writeValue(v_);
  }
  Serial.print(", properties 0x");
  Serial.print(characteristic.properties(), HEX);

  // check if the characteristic is readable
  if (characteristic.canRead()) {
    // read the characteristic value
    characteristic.read();

    if (characteristic.valueLength() > 0) {
      // print out the value of the characteristic
      Serial.print(", value 0x");
      printData(characteristic.value(), characteristic.valueLength());
    }
  }
  Serial.println();

  // loop the descriptors of the characteristic and explore each
  for (int i = 0; i < characteristic.descriptorCount(); i++) {
    BLEDescriptor descriptor = characteristic.descriptor(i);

    exploreDescriptor(descriptor);
  }
}

void exploreDescriptor(BLEDescriptor descriptor) {
  // print the UUID of the descriptor
  Serial.print("\t\tDescriptor ");
  Serial.print(descriptor.uuid());

  // read the descriptor value
  descriptor.read();

  // print out the value of the descriptor
  Serial.print(", value 0x");
  printData(descriptor.value(), descriptor.valueLength());

  Serial.println();
}

void printData(const unsigned char data[], int length) {
  for (int i = 0; i < length; i++) {
    unsigned char b = data[i];

    if (b < 16) {
      Serial.print("0");
    }

    Serial.print(b, HEX);
  }
}
```

I also added an LED flashing at the start of the ESP32C3 code so that I could easily test whether the program had started when using battieries.

[Servo Code Pico](./display-electronics.md)

```py
import utime
from servo import Servo
 
s1 = Servo(21)       # Servo pin is connected to GP21
 
def servo_Map(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
 
def servo_Angle(angle):
    if angle < 0:
        angle = 0
    if angle > 180:
        angle = 180
    s1.goto(round(servo_Map(angle,0,180,0,1024))) # Convert range value to angle value
    
if __name__ == '__main__':
    while True:
        utime.sleep(5)
        servo_Angle(0)
        utime.sleep(5)
        servo_Angle(100)
        """try:
            servo_Angle(float(input(">> Angle? ")))
        except:
            print("Error: NaN")"""
```

[Servo Library Pico](./display-electronics.md) (**servo.py**)

```py
from machine import Pin, PWM
 
 
class Servo:
    """ A simple class for controlling a 9g servo with the Raspberry Pi Pico.
 
    Attributes:
 
        minVal: An integer denoting the minimum duty value for the servo motor.
 
        maxVal: An integer denoting the maximum duty value for the servo motor.
 
    """
 
    def __init__(self, pin: int or Pin or PWM, minVal=2500, maxVal=7500):
        """ Creates a new Servo Object.
 
        args:
 
            pin (int or machine.Pin or machine.PWM): Either an integer denoting the number of the GPIO pin or an already constructed Pin or PWM object that is connected to the servo.
 
            minVal (int): Optional, denotes the minimum duty value to be used for this servo.
 
            maxVal (int): Optional, denotes the maximum duty value to be used for this servo.
 
        """
 
        if isinstance(pin, int):
            pin = Pin(pin, Pin.OUT)
        if isinstance(pin, Pin):
            self.__pwm = PWM(pin)
        if isinstance(pin, PWM):
            self.__pwm = pin
        self.__pwm.freq(50)
        self.minVal = minVal
        self.maxVal = maxVal
 
    def deinit(self):
        """ Deinitializes the underlying PWM object.
 
        """
        self.__pwm.deinit()
 
    def goto(self, value: int):
        """ Moves the servo to the specified position.
 
        args:
 
            value (int): The position to move to, represented by a value from 0 to 1024 (inclusive).
 
        """
        if value < 0:
            value = 0
        if value > 1024:
            value = 1024
        delta = self.maxVal-self.minVal
        target = int(self.minVal + ((value / 1024) * delta))
        self.__pwm.duty_u16(target)
 
    def middle(self):
        """ Moves the servo to the middle.
        """
        self.goto(512)
 
    def free(self):
        """ Allows the servo to be moved freely.
        """
        self.__pwm.duty_u16(0)
```

[ESP32C3 Button Code](./cupholder-electronics.md)

```cpp
void setup() {
  pinMode(10, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  Serial.println("Snew tatus?");
  if (digitalRead(10) == LOW) {
    Serial.println("YAYYYYYY!!!!!! :):):)");
  }
}
```

[Pico Code to Read BLE](./wireless-communication.md)

```py
from machine import UART, Pin
import time

uart = UART(0, 9600, tx=Pin(0), rx=Pin(1))  # init with given baudrate
uart.init(9600, bits=8, parity=None, stop=1)
def send_command(cmd):
    uart.write(cmd + '\r\n')
    time.sleep(0.5)  # Wait for command to execute

def setup():
    send_command('wakeup')  # Check if HM-10 is responding
    response = uart.read()
    print(response)
    if response == 'OK':
        print('HM-10 is responding')
    else:
        print('HM-10 not responding')

    send_command('AT+ROLE1')  # Set HM-10 to central role

    # Assuming you know the address of your peripheral
    # Replace the X's with the address of your peripheral
    send_command('AT+CON348518008C98\n')  

def loop():
    while True:
        if uart.any():
            print(uart.readline())

if __name__ == "__main__":
    setup()
    loop()
```

[EPaper Code Pico](./display-electronics.md)

```py
from machine import Pin, SPI
import framebuf
import utime

# Display resolution
EPD_WIDTH       = 800
EPD_HEIGHT      = 480

RST_PIN         = 12
DC_PIN          = 8
CS_PIN          = 9
BUSY_PIN        = 13

class EPD_7in5(framebuf.FrameBuffer):
    def __init__(self):
        self.reset_pin = Pin(RST_PIN, Pin.OUT)
        
        self.busy_pin = Pin(BUSY_PIN, Pin.IN, Pin.PULL_UP)
        self.cs_pin = Pin(CS_PIN, Pin.OUT)
        self.width = EPD_WIDTH 
        self.height = EPD_HEIGHT 
        
        self.spi = SPI(1)
        self.spi.init(baudrate=4000_000)
        self.dc_pin = Pin(DC_PIN, Pin.OUT)
        
        self.buffer = bytearray(self.height * self.width // 8)
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_HLSB)
        self.init()

    def digital_write(self, pin, value):
        pin.value(value)

    def digital_read(self, pin):
        return pin.value()

    def delay_ms(self, delaytime):
        utime.sleep(delaytime / 1000.0)

    def spi_writebyte(self, data):
        self.spi.write(bytearray(data))

    def module_exit(self):
        self.digital_write(self.reset_pin, 0)

    # Hardware reset
    def reset(self):
        self.digital_write(self.reset_pin, 1)
        self.delay_ms(50) 
        self.digital_write(self.reset_pin, 0)
        self.delay_ms(2)
        self.digital_write(self.reset_pin, 1)
        self.delay_ms(50)   

    def send_command(self, command):
        self.digital_write(self.dc_pin, 0)
        self.digital_write(self.cs_pin, 0)
        self.spi_writebyte([command])
        self.digital_write(self.cs_pin, 1)

    def send_data(self, data):
        self.digital_write(self.dc_pin, 1)
        self.digital_write(self.cs_pin, 0)
        self.spi_writebyte([data])
        self.digital_write(self.cs_pin, 1)
        
    def send_data1(self, buf):
        self.digital_write(self.dc_pin, 1)
        self.digital_write(self.cs_pin, 0)
        self.spi.write(bytearray(buf))
        self.digital_write(self.cs_pin, 1)

    def WaitUntilIdle(self):
        print("e-Paper busy")
        while(self.digital_read(self.busy_pin) == 0):    # Wait until the busy_pin goes LOW
            self.send_command(0x71)
            self.delay_ms(20)
        self.delay_ms(20) 
        print("e-Paper busy release")  

    def TurnOnDisplay(self):
        self.send_command(0x12) # DISPLAY REFRESH
        self.delay_ms(100)      #!!!The delay here is necessary, 200uS at least!!!
        self.WaitUntilIdle()
        
    def init(self):
        # EPD hardware init start     
        self.reset()
        
        self.send_command(0x01)  # POWER SETTING
        self.send_data(0x07)
        self.send_data(0x07)     # VGH=20V,VGL=-20V
        self.send_data(0x3f)     # VDH=15V
        self.send_data(0x3f)     # VDL=-15V
        
        self.send_command(0x04)  # POWER ON
        self.delay_ms(100)
        self.WaitUntilIdle()

        self.send_command(0X00)   # PANNEL SETTING
        self.send_data(0x1F)      # KW-3f   KWR-2F	BWROTP 0f	BWOTP 1f

        self.send_command(0x61)     # tres
        self.send_data(0x03)     # source 800
        self.send_data(0x20)
        self.send_data(0x01)     # gate 480
        self.send_data(0xE0)

        self.send_command(0X15)
        self.send_data(0x00)

        self.send_command(0X50)     # VCOM AND DATA INTERVAL SETTING
        self.send_data(0x10)
        self.send_data(0x00)

        self.send_command(0X60)     # TCON SETTING
        self.send_data(0x22)

        self.send_command(0x65)     # Resolution setting
        self.send_data(0x00)
        self.send_data(0x00)     # 800*480
        self.send_data(0x00)
        self.send_data(0x00)
        
        return 0;

    def Clear(self):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10)
        for i in range(0, wide):
            self.send_data1([0xff] * high)
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1([0x00] * high)
                
        self.TurnOnDisplay()
        
    def ClearBlack(self):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10)
        for i in range(0, wide):
            self.send_data1([0x00] * high)
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1([0xff] * high)
                
        self.TurnOnDisplay()
        
    def display(self,blackimage):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10) 
        for i in range(0, wide):
            self.send_data1(blackimage[(i * high) : ((i+1) * high)])
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1(blackimage[(i * high) : ((i+1) * high)])
                
        self.TurnOnDisplay()


    def sleep(self):
        self.send_command(0x02) # power off
        self.WaitUntilIdle()
        self.send_command(0x07) # deep sleep
        self.send_data(0xa5)

with open('TS_FINAL_IMG.pbm', 'rb') as f:
    fb_smile1 = framebuf.FrameBuffer(bytearray(f.read()[12:]), EPD_WIDTH, EPD_HEIGHT, framebuf.MONO_HLSB)

if __name__=='__main__':
    epd = EPD_7in5()
    epd.Clear()
    
    epd.fill(0x00)
    
    epd.blit(fb_smile1, 0, 0)
    epd.display(epd.buffer)
    
    print("sleep")
    epd.sleep()
```

## Final Code

**Final Pico Code** (excluding servo library)

```py
import utime, time
from servo import Servo
from machine import UART, Pin, SPI
import framebuf

uart = UART(0, 9600, tx=Pin(0), rx=Pin(1))  # init with given baudrate
uart.init(9600, bits=8, parity=None, stop=1)

current_pos = False # false = down, true = up

s1 = Servo(21)       # Servo pin is connected to GP21

# Display resolution
EPD_WIDTH       = 800
EPD_HEIGHT      = 480

RST_PIN         = 12
DC_PIN          = 8
CS_PIN          = 9
BUSY_PIN        = 13

class EPD_7in5(framebuf.FrameBuffer):
    def __init__(self):
        self.reset_pin = Pin(RST_PIN, Pin.OUT)
        
        self.busy_pin = Pin(BUSY_PIN, Pin.IN, Pin.PULL_UP)
        self.cs_pin = Pin(CS_PIN, Pin.OUT)
        self.width = EPD_WIDTH 
        self.height = EPD_HEIGHT 
        
        self.spi = SPI(1)
        self.spi.init(baudrate=4000_000)
        self.dc_pin = Pin(DC_PIN, Pin.OUT)
        
        self.buffer = bytearray(self.height * self.width // 8)
        super().__init__(self.buffer, self.width, self.height, framebuf.MONO_HLSB)
        self.init()

    def digital_write(self, pin, value):
        pin.value(value)

    def digital_read(self, pin):
        return pin.value()

    def delay_ms(self, delaytime):
        utime.sleep(delaytime / 1000.0)

    def spi_writebyte(self, data):
        self.spi.write(bytearray(data))

    def module_exit(self):
        self.digital_write(self.reset_pin, 0)

    # Hardware reset
    def reset(self):
        self.digital_write(self.reset_pin, 1)
        self.delay_ms(50) 
        self.digital_write(self.reset_pin, 0)
        self.delay_ms(2)
        self.digital_write(self.reset_pin, 1)
        self.delay_ms(50)   

    def send_command(self, command):
        self.digital_write(self.dc_pin, 0)
        self.digital_write(self.cs_pin, 0)
        self.spi_writebyte([command])
        self.digital_write(self.cs_pin, 1)

    def send_data(self, data):
        self.digital_write(self.dc_pin, 1)
        self.digital_write(self.cs_pin, 0)
        self.spi_writebyte([data])
        self.digital_write(self.cs_pin, 1)
        
    def send_data1(self, buf):
        self.digital_write(self.dc_pin, 1)
        self.digital_write(self.cs_pin, 0)
        self.spi.write(bytearray(buf))
        self.digital_write(self.cs_pin, 1)

    def WaitUntilIdle(self):
        print("e-Paper busy")
        while(self.digital_read(self.busy_pin) == 0):    # Wait until the busy_pin goes LOW
            self.send_command(0x71)
            self.delay_ms(20)
        self.delay_ms(20) 
        print("e-Paper busy release")  

    def TurnOnDisplay(self):
        self.send_command(0x12) # DISPLAY REFRESH
        self.delay_ms(100)      #!!!The delay here is necessary, 200uS at least!!!
        self.WaitUntilIdle()
        
    def init(self):
        # EPD hardware init start     
        self.reset()
        
        self.send_command(0x01)  # POWER SETTING
        self.send_data(0x07)
        self.send_data(0x07)     # VGH=20V,VGL=-20V
        self.send_data(0x3f)     # VDH=15V
        self.send_data(0x3f)     # VDL=-15V
        
        self.send_command(0x04)  # POWER ON
        self.delay_ms(100)
        self.WaitUntilIdle()

        self.send_command(0X00)   # PANNEL SETTING
        self.send_data(0x1F)      # KW-3f   KWR-2F	BWROTP 0f	BWOTP 1f

        self.send_command(0x61)     # tres
        self.send_data(0x03)     # source 800
        self.send_data(0x20)
        self.send_data(0x01)     # gate 480
        self.send_data(0xE0)

        self.send_command(0X15)
        self.send_data(0x00)

        self.send_command(0X50)     # VCOM AND DATA INTERVAL SETTING
        self.send_data(0x10)
        self.send_data(0x00)

        self.send_command(0X60)     # TCON SETTING
        self.send_data(0x22)

        self.send_command(0x65)     # Resolution setting
        self.send_data(0x00)
        self.send_data(0x00)     # 800*480
        self.send_data(0x00)
        self.send_data(0x00)
        
        return 0;

    def Clear(self):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10)
        for i in range(0, wide):
            self.send_data1([0xff] * high)
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1([0x00] * high)
                
        self.TurnOnDisplay()
        
    def ClearBlack(self):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10)
        for i in range(0, wide):
            self.send_data1([0x00] * high)
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1([0xff] * high)
                
        self.TurnOnDisplay()
        
    def display(self,blackimage):
        
        high = self.height
        if( self.width % 8 == 0) :
            wide =  self.width // 8
        else :
            wide =  self.width // 8 + 1
        
        self.send_command(0x10) 
        for i in range(0, wide):
            self.send_data1(blackimage[(i * high) : ((i+1) * high)])
                
        self.send_command(0x13) 
        for i in range(0, wide):
            self.send_data1(blackimage[(i * high) : ((i+1) * high)])
                
        self.TurnOnDisplay()


    def sleep(self):
        self.send_command(0x02) # power off
        self.WaitUntilIdle()
        self.send_command(0x07) # deep sleep
        self.send_data(0xa5)

def InitializeEpaper():
    with open('TS_FINAL_IMG.pbm', 'rb') as f:
        fb_smile1 = framebuf.FrameBuffer(bytearray(f.read()[12:]), EPD_WIDTH, EPD_HEIGHT, framebuf.MONO_HLSB)
    epd = EPD_7in5()
    epd.Clear()
    
    epd.fill(0x00)

def DisplayImage():
    epd.blit(fb_smile1, 0, 0)
    epd.display(epd.buffer)
    #print("sleep")
    #epd.sleep()

def send_command(cmd):
    uart.write(cmd + '\r\n')
    time.sleep(0.5)  # Wait for command to execute

def bluetooth_setup():
    send_command('wakeup')  # Check if HM-10 is responding
    response = uart.read()
    print(response)
    if response == 'OK':
        print('HM-10 is responding')
    else:
        print('HM-10 not responding')

    send_command('AT+ROLE1')  # Set HM-10 to central role

    # Assuming you know the address of your peripheral
    # Replace the X's with the address of your peripheral
    send_command('AT+CON348518008C98\n')  

def bluetooth_loop(func_arg):
    while True:
        if uart.any():
            func_arg(uart.readline())
  
def servo_Map(x, in_min, in_max, out_min, out_max):
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
 
def servo_Angle(angle):
    if angle < 0:
        angle = 0
    if angle > 180:
        angle = 180
    s1.goto(round(servo_Map(angle,0,180,0,1024))) # Convert range value to angle value

def move_up():
    global current_pos
    servo_Angle(100)
    current_pos = True
    #utime.sleep(5) # ensures that the motor will never go crazy

def move_down():
    global current_pos
    servo_Angle(0)
    current_pos = False
    DisplayImage()
    #utime.sleep(5) # ensures that the motor will never go crazy

def process_data(bytes_recieved):
    print(bytes_recieved)
    try:
        i = ord(bytes_recieved)
    except:
        print("Error processing bytes")
        return
    print(f"Recieved: {i}")
    if i == 1 and not current_pos: # UP command recieved & not currently up
        move_up()
    elif i == 2 and current_pos: # DOWN command recieved & currently up
        move_down()
    else:
        print(f"Code not recognized")


def loop():
    bluetooth_loop(process_data)

if __name__ == '__main__':
    InitializeEpaper()
    bluetooth_setup()
    loop()
```

**Final ESP32C3 Code**

```cpp
#include <ArduinoBLE.h>

BLECharacteristic correctCharacteristic;

bool displayDown = true;

bool buttonAlreadyPressed = false;

bool connectionEstablished = false;

void InitializeBluetooth() {
  if (!BLE.begin()) {
    while (1);
  }
  BLE.scanForName("DSD TECH");
}


void explorerPeripheral(BLEDevice peripheral) {
  // connect to the peripheral

  if (!peripheral.connect()) return;

  if (!peripheral.discoverAttributes()) {
    peripheral.disconnect();
    return;
  }

  bool correctServiceFound = false;

  // loop the services of the peripheral and explore each
  for (int i = 0; i < peripheral.serviceCount(); i++) {
    BLEService service = peripheral.service(i);

    bool isCorrectService = exploreService(service);
    if (isCorrectService) {correctServiceFound = true; break;}
  }

  if (!correctServiceFound) peripheral.disconnect();
}

bool exploreService(BLEService service) {

    bool foundCorrectCharacteristic = false;

  // loop the characteristics of the service and explore each
  for (int i = 0; i < service.characteristicCount(); i++) {
    BLECharacteristic characteristic = service.characteristic(i);

    bool isCorrectCharacteristic = exploreCharacteristic(characteristic);
    if (isCorrectCharacteristic) {
        foundCorrectCharacteristic = true;
        break;
    }
  }
  return foundCorrectCharacteristic;
}

void WriteVal(uint8_t value) {
 if (correctCharacteristic) correctCharacteristic.writeValue(value);
}

bool exploreCharacteristic(BLECharacteristic characteristic) {
  // print the UUID and properties of the characteristic
  char s[] = "ffe1";
  if (characteristic.uuid()[0] == s[0] && characteristic.uuid()[1] == s[1] && characteristic.uuid()[2] == s[2] && characteristic.uuid()[3] == s[3]){
    correctCharacteristic = characteristic;
    return true;
  }
    return false;
}

void InitializeButton() {
    pinMode(10, INPUT_PULLUP);
}

bool ButtonIsPressed() {
    return digitalRead(10) == LOW;
}

void ToggleDisplay() {
    if (displayDown) {
        // send message to move display up
        Serial.println("Writing 1");
        WriteVal(1); // 1 = UP
    }
    else {
        // send message to move display down
        Serial.println("Writing 2");
        WriteVal(2); // 2 = DOWN
    }
    displayDown = !displayDown;
}

void setup() {
  pinMode(D9, OUTPUT);
  digitalWrite(D9, HIGH);
    delay(1000);
    digitalWrite(D9, LOW);
    delay(1000);
    digitalWrite(D9, HIGH);
    delay(750);
    digitalWrite(D9, LOW);
    delay(500);
    digitalWrite(D9, HIGH);
    delay(250);
    digitalWrite(D9, LOW);
    delay(100);
    digitalWrite(D9, HIGH);
    delay(10);
    digitalWrite(D9, LOW);
    delay(10);
  Serial.begin(9600);
    InitializeButton();
    InitializeBluetooth();
    
}

void loop() {
    if (connectionEstablished) {
        bool buttonIsPressed = ButtonIsPressed();
        if (buttonIsPressed && !buttonAlreadyPressed) {
            buttonAlreadyPressed = true;
            ToggleDisplay();
            delay(1000);
        }
        else if (!buttonIsPressed) {
            buttonAlreadyPressed = false;
        }
    }
    else {
        // check if a peripheral has been discovered
        BLEDevice peripheral = BLE.available();

        if (peripheral) {
            if (peripheral.localName() == "DSD TECH") { //LED
            // stop scanning
            BLE.stopScan();

            explorerPeripheral(peripheral);

            connectionEstablished = true;
            Serial.println("Connection established");
            Serial.println(correctCharacteristic.uuid());
            }
        }
    }
}
```