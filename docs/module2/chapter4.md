---
title: Physics Simulation & Gravity in Gazebo
---

# Chapter 4: Physics Simulation & Gravity in Gazebo

Gazebo is a powerful 3D robotics simulator and a cornerstone of the ROS ecosystem. It allows us to test and train our robot's software in a controlled, virtual environment before deploying it on physical hardware. This process of testing in simulation is critical for safety and rapid development.

The most important feature of Gazebo is its **physics engine**. This is the component that simulates the laws of physics, allowing our virtual robot to interact with its world realistically. It handles gravity, collisions, friction, and joint forces.

## Choosing a Physics Engine (ODE vs. Bullet vs. DART)

Gazebo is compatible with several open-source physics engines. The most common are:

1.  **ODE (Open Dynamics Engine)**: This was the long-time default for Gazebo. It is mature and fast, but can sometimes struggle with stability in complex scenarios with many contacts (like a humanoid foot on the ground).

2.  **Bullet**: A popular engine known for its performance and stability, widely used in gaming and film. It often provides more stable contact and joint behavior than ODE, making it a good choice for legged robots.

3.  **DART (Dynamic Animation and Robotics Toolkit)**: An engine designed specifically for robotics, with excellent handling of complex joint constraints and contacts. It can be more accurate than ODE or Bullet but may have a higher computational cost.

For modern Gazebo (Ignition Gazebo), you can often choose the engine you want to use. For humanoid simulation, **Bullet** or **DART** are generally preferred over ODE due to their better handling of the many contact points involved in walking.

## Spawning a Humanoid Model in Gazebo

To bring our URDF model to life, we need to "spawn" it into the Gazebo world. This is typically done using a ROS 2 launch file.

A launch file is a Python script that automates the process of starting multiple nodes and configuring them correctly. To launch our humanoid, the file would need to:

1.  **Start the Gazebo Simulator**: Launch the main Gazebo server (`gzserver`) and client (`gzclient`).
2.  **Load the Robot Description**: Read our URDF file and load it onto the ROS **parameter server**. This makes the robot's structure available to all other nodes. This is typically handled by the `robot_state_publisher` node.
3.  **Spawn the Robot Entity**: Use the `spawner` node from the `ros_gz_sim` package to create an instance of our robot from the description and place it in the simulation at a specific starting position.
4.  **Start Joint State Publisher**: Launch a node that can control the robot's joints. For simple control, `joint_state_publisher_gui` provides sliders to move each joint. For autonomous control, a custom controller node would be used.

### Example Launch File Snippet

Here is a conceptual look at what a part of the launch file might contain.

```python
# humanoid_spawn.launch.py
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node

def generate_launch_description():

    # Path to the Gazebo world file
    pkg_gazebo_ros = get_package_share_directory('ros_gz_sim')
    
    # Path to our robot's URDF file
    urdf_file_path = os.path.join(get_package_share_directory('my_robot_description'), 'urdf', 'simple_biped.urdf')

    # 1. Launch Gazebo
    gazebo = IncludeLaunchDescription(
        PythonLaunchDescriptionSource(
            os.path.join(pkg_gazebo_ros, 'launch', 'gz_sim.launch.py')
        ),
        launch_arguments={'gz_args': '-r -v4 empty.sdf'}.items()
    )

    # 2. Load URDF into a parameter
    with open(urdf_file_path, 'r') as infp:
        robot_desc = infp.read()

    # 3. Start Robot State Publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        output='both',
        parameters=[{'robot_description': robot_desc}]
    )

    # 4. Spawn the robot in Gazebo
    spawn_entity = Node(
        package='ros_gz_sim',
        executable='create',
        arguments=['-string', robot_desc,
                   '-name', 'simple_biped',
                   '-allow_renaming', 'true'],
        output='screen'
    )

    return LaunchDescription([
        gazebo,
        robot_state_publisher,
        spawn_entity
    ])
```

When you run this launch file with `ros2 launch ...`, Gazebo will open, and you will see your humanoid model standing in an empty world, subject to gravity and ready to be controlled by other ROS 2 nodes.