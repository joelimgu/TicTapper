#!/usr/bin/python

from evdev import InputDevice, ecodes, list_devices, categorize
import signal, sys

def getCode(fname):
    codes={
    30 : 'a',
    48 : 'b',
    46 : 'c',
    32 : 'd',
    18 : 'e',
    33 : 'f',
    34 : 'g',
    35 : 'h',
    23 : 'i',
    36 : 'j',
    37 : 'k',
    38 : 'l',
    50 : 'm',
    49 : 'n',
    24 : 'o',
    25 : 'p',
    16 : 'q',
    19 : 'r',
    31 : 's',
    20 : 't',
    22 : 'u',
    47 : 'v',
    17 : 'w',
    45 : 'x',
    21 : 'y',
    44 : 'z',
    11 : '0',
    2 : '1',
    3 : '2',
    4 : '3',
    5 : '4',
    6 : '5',
    7 : '6',
    8 : '7',
    9 : '8',
    10 : '9',
    52 : '.',
    53 : '/',
    39 : ':'
    }
    if fname in codes:
        return codes[fname]
    else:
        return ""

def getChar(fname,mayus):
    ch='';
    if (mayus==True):
        return getCode(fname).upper()
    else:
        return getCode(fname)


dev = InputDevice('/dev/input/by-id/usb-0581_020c-event-kbd') #usb-2D_IMAGER_2D_IMAGER-event-kbd')

def signal_handler(signal, frame):
    print('Stopping')
    dev.ungrab()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

dev.grab()

sample = []
for event in dev.read_loop():
    if event.type == ecodes.EV_KEY:
        data = categorize(event)
        if data.keystate == 1:
            if data.scancode == 28:
                break
            else:
                sample.append(data.scancode)


## sample=[30,48,46,32,18,33,34,35,23,36,37,38,50,49,24,25,16,19,31,20,22,47,17,45,21,44,42,30,42,48,42,46,42,32,42,18,42,33,42,34,42,35,42,23,42,36,42,37,42,38,42,50,42,49,42,24,42,25,42,16,42,19,42,31,42,20,42,22,42,47,42,17,42,45,42,21,42,44,11,2,3,4,5,6,7,8,9,10,52,53,42,39,28]

mayus=False
result=''
for x in sample:
    if x == 28:
        break
    if x == 42:
        mayus=True
        continue

    result+=getChar(x,mayus)
    mayus=False

print(result)




