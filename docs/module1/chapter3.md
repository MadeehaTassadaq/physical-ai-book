---
title: "URDF: Building the Humanoid Skeleton"
---

# Chapter 3: URDF: Building the Humanoid Skeleton

The Unified Robot Description Format (URDF) is an XML format used in ROS to describe all the physical elements of a robot. It defines the robot's structure as a tree of **links** connected by **joints**.

-   **Links**: These are the rigid parts of the robot (e.g., a forearm, a shin, a torso). They have physical properties like mass and inertia, as well as visual and collision geometries.
-   **Joints**: These connect the links and define how they can move relative to each other. Joints can be revolute (rotating), prismatic (sliding), fixed, etc.

A complete URDF file is essential for simulation, visualization (in tools like `rviz2`), and many physics-based calculations like kinematics and dynamics.

## Key URDF Components

A URDF file is wrapped in `<robot name="..."></robot>` tags. Inside, you'll find:

-   `<link name="...">`: Defines a link.
    -   `<inertial>`: Specifies mass and the inertia matrix. Critical for physics simulation.
    -   `<visual>`: Defines how the link looks. Can be a simple shape (`<box>`, `<cylinder>`, `<sphere>`) or a 3D mesh file (`.dae`, `.stl`).
    -   `<collision>`: Defines the geometry used for collision detection. It's often simpler than the visual geometry to speed up physics calculations.
-   `<joint name="..." type="...">`: Defines a joint.
    -   `<parent link="..." />`: The link this joint originates from.
    -   `<child link="..." />`: The link this joint connects to.
    -   `<origin xyz="..." rpy="..." />`: The transform (position and orientation) of the child link relative to the parent link.
    -   `<axis xyz="..." />`: The axis of rotation (for revolute joints) or translation (for prismatic joints).
    -   `<limit lower="..." upper="..." effort="..." velocity="..." />`: Defines the joint's range of motion and maximum force/speed.

## Example: A Simplified Bipedal Robot URDF

This example shows a highly simplified humanoid with a torso, a head, and two legs. It demonstrates the parent-child relationships that form the kinematic tree.

```xml
<?xml version="1.0"?>
<robot name="simple_biped">

  <!-- Base Link: The Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.4 0.6 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0.0 0.0 1.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.4 0.6 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10"/>
      <inertia ixx="1.0" ixy="0" ixz="0" iyy="1.0" iyz="0" izz="1.0"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
      <material name="white">
        <color rgba="1.0 1.0 1.0 1.0"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.175" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" velocity="1.0" effort="10"/>
  </joint>

  <!-- Right Leg -->
  <link name="right_thigh">
    <visual>
      <geometry>
        <cylinder length="0.4" radius="0.08"/>
      </geometry>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
      <material name="grey">
        <color rgba="0.5 0.5 0.5 1.0"/>
      </material>
    </visual>
    <collision>
       <geometry>
        <cylinder length="0.4" radius="0.08"/>
      </geometry>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    </collision>
    <inertial>
      <mass value="4"/>
      <inertia ixx="0.5" ixy="0" ixz="0" iyy="0.5" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="right_hip_joint" type="revolute">
    <parent link="torso"/>
    <child link="right_thigh"/>
    <origin xyz="0 -0.15 -0.1" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" velocity="1.0" effort="100"/>
  </joint>

  <!-- Left Leg (similar structure) -->
  <link name="left_thigh">
    <visual>
      <geometry>
        <cylinder length="0.4" radius="0.08"/>
      </geometry>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
      <material name="grey"/>
    </visual>
     <collision>
       <geometry>
        <cylinder length="0.4" radius="0.08"/>
      </geometry>
      <origin xyz="0 0 -0.2" rpy="0 0 0"/>
    </collision>
    <inertial>
      <mass value="4"/>
      <inertia ixx="0.5" ixy="0" ixz="0" iyy="0.5" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="left_hip_joint" type="revolute">
    <parent link="torso"/>
    <child link="left_thigh"/>
    <origin xyz="0 0.15 -0.1" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" velocity="1.0" effort="100"/>
  </joint>

</robot>
```

This simple example illustrates the core principle: a chain of parent-child relationships that starts from a base link (here, the `torso`) and branches out. A real humanoid URDF would have many more links (shins, feet, arms, hands) and more complex joints, but it follows the exact same structure.