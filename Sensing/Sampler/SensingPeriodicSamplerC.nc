/*
 * Copyright (c) 2007 Stanford University.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * - Redistributions of source code must retain the above copyright
 *   notice, this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright
 *   notice, this list of conditions and the following disclaimer in the
 *   documentation and/or other materials provided with the
 *   distribution.
 * - Neither the name of the Stanford University nor the names of
 *   its contributors may be used to endorse or promote products derived
 *   from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL STANFORD
 * UNIVERSITY OR ITS CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @author Kevin Klues <klueska@cs.stanford.edu>
 * @date July 24, 2007
 */

#include "SensingConstants.h"
#include "SensorSample.h"
module SensingPeriodicSamplerC {
  uses {
    interface Boot;
    interface SampleLogRead<sensor_sample_t>;
    interface SampleNxConverter;
    interface Leds;
    interface SplitControl as AMControl;
    interface Timer<TMilli> as SendTimer;
    interface AMPacket;
    interface Packet;
    interface AMSend as SampleSend;
    interface Receive as ParentBeaconReceive;
  }
}
implementation {
  message_t sample_msg;
  bool sendBusy = FALSE;
  bool joined = FALSE;
  am_addr_t parentAddr = AM_BROADCAST_ADDR;
  
  void sendSampleMsg() {
    if(call SampleSend.send(parentAddr, &sample_msg, sizeof(nx_sensor_sample_t)) != SUCCESS)
      sendBusy = FALSE;
    else call Leds.led2On();
  }
	
  event void Boot.booted() {
    call AMControl.start();
  }
  
  event void AMControl.startDone(error_t e) {
  	if(e != SUCCESS)
  		call AMControl.start();
    else
      call SendTimer.startPeriodic(SAMPLING_INTERVAL + SEND_OFFSET);
  }
  
  event void AMControl.stopDone(error_t e) {
  }

  event void SendTimer.fired() {
    error_t error;

    if(sendBusy == TRUE || joined == FALSE)
      return;

    sendBusy = TRUE;
    error = call SampleLogRead.readNext();

    if(error == FAIL) {
      sendBusy = FALSE;
      call Leds.led1Toggle();
    }
    else if(error == ECANCEL) {
      sendBusy = FALSE;
    }
  }
  
  event void SampleLogRead.readDone(sensor_sample_t* sample, error_t error) {
    if(error == SUCCESS) {
      nx_sensor_sample_t* nx_sample = call SampleSend.getPayload(&sample_msg, sizeof(nx_sensor_sample_t));
      call SampleNxConverter.copyToNx(nx_sample, sample);
      sendSampleMsg();
    }
    else {
      sendBusy = FALSE;
      call Leds.led1Toggle();
    }
  }

  event void SampleSend.sendDone(message_t* msg, error_t error) {
    if(error == SUCCESS) {
      call Leds.led2Off();
    }
    else call Leds.led1Toggle();

    sendBusy = FALSE;
  }

  event message_t* ParentBeaconReceive.receive(message_t* msg, void* payload, uint8_t len) {
    parent_beacon_msg_t* beacon;

    if(len != sizeof(parent_beacon_msg_t))
      return msg;

    beacon = (parent_beacon_msg_t*)payload;
    parentAddr = beacon->parent_addr;
    joined = TRUE;
    call Leds.led0On();

    return msg;
  }
}
