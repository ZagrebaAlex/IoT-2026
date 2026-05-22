# IoT-2026

End-to-end Wireless Sensor Network project for the AIoT course 2025-2026.

This repository contains:

- TinyOS code for the motes in [Sensing](/Users/alexzagkrempa/Desktop/IoT-2026/Sensing:1)
- a MongoDB-backed ingestion pipeline in [Ingestion](/Users/alexzagkrempa/Desktop/IoT-2026/Ingestion:1)
- a FastAPI backend in [backend](/Users/alexzagkrempa/Desktop/IoT-2026/backend:1)
- a React + Material UI frontend served by the backend

## Fresh Ubuntu 16.04 Setup

These steps assume a fresh Ubuntu 16.04 VM used for TinyOS and for running the Dockerized web stack.

### 1. Update the system

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install TinyOS prerequisites

```bash
sudo apt install -y \
  python2.7 python-minimal openjdk-8-jdk gcc-avr avr-libc nescc \
  minicom wget unzip automake autoconf libtool avrdude curl \
  gcc-msp430 git python-serial tinyos-tools
```

### 3. Install Docker and docker-compose

If Docker is not already installed in the VM, install it with your preferred method. On Ubuntu 16.04 this is often done either with Docker's official install script or with the distro packages available to your VM.

After installation, confirm:

```bash
docker --version
docker-compose --version
```

### 4. Clone or copy this repository

```bash
cd ~/Desktop
git clone github.com/ZagrebaAlex/IoT-2026
cd IoT-2026
```

## TinyOS Toolchain Setup

If TinyOS itself is not already installed:

```bash
git clone https://github.com/tinyos/tinyos-main.git ~/tinyos-main
cd ~/tinyos-main/tools
./Bootstrap
./configure
make
sudo make install
```

Add your user to the serial access group:

```bash
sudo usermod -aG dialout $USER
```

Then reboot or log out and log back in.

If your TinyOS environment requires it, load it before using `make`, `PrintfClient`, or `SerialForwarder`:

```bash
source /path/to/tinyos.sh
```

If you do not know where it is:

```bash
find ~ /opt -name tinyos.sh 2>/dev/null
```

## USB Port Discovery

List all mote USB ports:

```bash
ls /dev | grep ttyUSB
```

In our setup:

- `TelosB` appears on one USB port
- `IRIS` appears on two USB ports
- the first IRIS port is used for flashing
- the second IRIS port is used for serial output / `PrintfClient`

Typical mapping example:

- `/dev/ttyUSB0` = TelosB
- `/dev/ttyUSB1` = IRIS programming port
- `/dev/ttyUSB2` = IRIS serial output port

Always verify this on your own VM.

## Compile and Flash the Motes

### 1. Compile the IRIS parent

```bash
cd ~/Desktop/IoT-2026/Sensing/Base
make clean
make iris
```

### 2. Flash the IRIS parent

The parent must be node `0`.

```bash
cd ~/Desktop/IoT-2026/Sensing/Base
make iris install.0 mib520,/dev/ttyUSB1
```

### 3. Compile the TelosB leaf

```bash
cd ~/Desktop/IoT-2026/Sensing/Sampler
make clean
make telosb
```

### 4. Flash the TelosB leaf

Use node `1` for the first leaf, `2` for the second, and so on.

```bash
cd ~/Desktop/IoT-2026/Sensing/Sampler
make telosb install.1 bsl,/dev/ttyUSB0
```

## App and Ingestion Script setup

### 1. Build and start MongoDB and backend

```bash
cd ~/Desktop/IoT-2026
sudo docker-compose up -d mongo backend
```

### 2. Start ingestion from PrintfClient

Run:

```bash
cd ~/Desktop/IoT-2026
sudo java net.tinyos.tools.PrintfClient -comm serial@/dev/ttyUSB2:iris | sudo docker-compose run --rm -T ingestion
```

### 3. Open the dashboard

Setup Port forwarding on the vm, so that the port 8000 gets forwarded to the host machine.
Then open up localhost:8000 from the host.
