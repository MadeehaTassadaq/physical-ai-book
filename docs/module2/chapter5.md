---
title: "Sensor Fusion: LiDAR, IMUs, and Depth Cameras"
---

# Chapter 5: Sensor Fusion: LiDAR, IMUs, and Depth Cameras

A robot is blind and deaf without its sensors. To operate intelligently in the world, our humanoid needs to perceive its environment and its own state. This is accomplished with a suite of sensors. However, no single sensor is perfect. The process of combining data from multiple sensors to get a more accurate and reliable understanding of the world is called **sensor fusion**.

## Core Sensors for Humanoid Robotics

1.  **IMU (Inertial Measurement Unit)**
    -   **What it does**: Measures the robot's orientation, angular velocity, and linear acceleration. It's the robot's sense of balance.
    -   **Components**: Typically contains an accelerometer and a gyroscope. Sometimes a magnetometer is included to provide a global heading (like a compass).
    -   **Why it's important**: Absolutely critical for bipedal locomotion. Without an IMU, a humanoid cannot balance while walking, standing, or reacting to pushes. It tells the control system if the robot is falling over.
    -   **ROS 2 Message**: `sensor_msgs/Imu`

2.  **Depth Camera (e.g., Intel RealSense)**
    -   **What it does**: Provides a normal color (RGB) image and a depth image. In the depth image, each pixel's value corresponds to its distance from the camera.
    -   **How it works**: Often uses stereo vision (two cameras) or structured light (projecting an infrared pattern) to calculate depth.
    -   **Why it's important**: Allows the robot to perceive the 3D structure of its environment. It can see obstacles, identify objects to pick up, and understand the geometry of the space in front of it.
    -   **ROS 2 Messages**: `sensor_msgs/Image` for the color data and `sensor_msgs/Image` (with a different encoding) or `sensor_msgs/PointCloud2` for the depth data.

3.  **LiDAR (Light Detection and Ranging)**
    -   **What it does**: Scans the environment with a laser and measures the time it takes for the light to bounce back, creating a precise 2D or 3D "point cloud" of the surroundings.
    -   **Why it's important**: LiDAR is excellent for mapping and localization (figuring out where you are on a map). It provides very accurate distance measurements over a wide field of view, making it ideal for navigating large spaces and avoiding obstacles.
    -   **ROS 2 Message**: `sensor_msgs/LaserScan` (for 2D LiDAR) or `sensor_msgs/PointCloud2` (for 3D LiDAR).

## The Need for Fusion

Each sensor has weaknesses:
-   **IMUs** drift over time. They are good at measuring quick changes but accumulate error for slow movements.
-   **Cameras** are passive and depend on good lighting. They struggle in the dark or with reflective surfaces. They also don't directly measure distance accurately at far ranges.
-   **LiDAR** can have trouble with transparent (glass) or black, light-absorbing surfaces. It provides geometric data but no color or texture information.

By fusing the data, we can overcome these individual limitations. A common sensor fusion technique in robotics is to use an **Extended Kalman Filter (EKF)**.

### Example: Fusing IMU and Camera/LiDAR for State Estimation

A classic fusion problem is **Visual-Inertial Odometry (VIO)** or **LiDAR-Inertial Odometry (LIO)**.

1.  The **IMU** provides high-frequency but drifty estimates of the robot's motion ("I think I moved forward 1cm").
2.  The **camera (VIO) or LiDAR (LIO)** provides lower-frequency but more globally accurate updates by tracking features in the environment ("By looking at how the world moved, I can confirm I moved forward about 1.05cm and also rotated slightly").
3.  An **EKF** node (like `robot_localization` in ROS 2) takes both of these data streams as input.
4.  The filter uses the IMU data as its "prediction" step and the visual/LiDAR data as its "update" or "correction" step.
5.  The output is a single, fused `nav_msgs/Odometry` message that is far more accurate and robust than either sensor could produce on its own.

This fused odometry is the foundation for a robot's ability to navigate. It's the first step in building a map and tracking the robot's position within it, a problem known as SLAM (Simultaneous Localization and Mapping), which we will explore in Module 3.