---
title: ROS 2 Architecture & Workspace Setup
---

# Chapter 1: ROS 2 Architecture & Workspace Setup

Welcome to the nervous system of our robot. This chapter introduces the foundational concepts of the Robot Operating System (ROS 2), the middleware that allows different parts of our robot's software to communicate, much like nerves in a body.

## The Role of Middleware in Physical AI

In any complex robot, multiple processes need to run simultaneously. You have processes for reading sensors, controlling motors, running AI models for perception, and planning actions. These processes need a robust way to exchange data in real-time. This is the role of middleware.

ROS 2 provides a standardized communication layer that abstracts the complexities of inter-process communication. It allows us to build modular, reusable software components that can be easily combined to create complex robotic applications.

Key features of ROS 2 include:
- **Distributed Communication**: Nodes can run on different machines and still communicate seamlessly.
- **Language Support**: Write nodes in Python, C++, and other languages.
- **Real-time Capabilities**: Built on top of DDS (Data Distribution Service), a standard for real-time systems.
- **Rich Ecosystem**: A vast collection of tools and packages for everything from simulation to navigation.

## ROS 2 Installation Guide

This guide assumes you are running **Ubuntu 22.04 LTS**. ROS 2 Humble Hawksbill is the recommended version for this LTS release.

### 1. Set Locale

Ensure your system uses a UTF-8 locale.

```bash
sudo apt update && sudo apt install locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8
```

### 2. Add ROS 2 APT Repository

First, authorize the ROS 2 GPG key.
```bash
sudo apt install software-properties-common
sudo add-apt-repository universe
sudo apt update && sudo apt install curl -y
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

Then, add the repository to your sources list.
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### 3. Install ROS 2 Packages

Update your package index and install the recommended `ros-humble-desktop` package, which includes ROS, rviz, demos, and tutorials.

```bash
sudo apt update
sudo apt upgrade
sudo apt install ros-humble-desktop
```

### 4. Source the Setup File

To use the ROS 2 commands, you need to source the setup file in your terminal. Add this line to the end of your `~/.bashrc` file to make it available in all your terminal sessions.

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

To verify your installation, you can run a simple talker-listener example:

**Terminal 1:**
```bash
ros2 run demo_nodes_cpp talker
```

**Terminal 2:**
```bash
ros2 run demo_nodes_py listener
```

You should see the "listener" terminal printing messages from the "talker". Congratulations, your ROS 2 environment is ready!

## Creating a ROS 2 Workspace

A workspace is a directory where you can create and manage your own ROS 2 packages.

1.  **Create a directory**:
    ```bash
    mkdir -p ~/ros2_ws/src
    cd ~/ros2_ws
    ```
2.  **Build the workspace**:
    Even though the workspace is empty, you can build it.
    ```bash
    colcon build
    ```
    This will create `install/`, `log/`, and `build/` directories.

3.  **Source the local setup file**:
    To use the packages in your workspace, you need to source its specific setup file.
    ```bash
    source ~/ros2_ws/install/setup.bash
    ```
    It's a good practice to add this to your `~/.bashrc` as well, so you always have access to your workspace's packages.