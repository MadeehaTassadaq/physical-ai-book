---
title: Communication Patterns (Nodes, Topics, Services, Actions)
---

# Chapter 2: Communication Patterns

In ROS 2, software is organized into independent programs called **nodes**. Each node is responsible for a specific task, such as controlling a motor, reading a sensor, or performing a calculation. These nodes communicate with each other using a few core patterns.

## Nodes: The Building Blocks

A node is the fundamental unit of execution in ROS 2. Think of it as a small, single-purpose program. For our humanoid robot, we might have nodes for:
- `camera_driver`: Publishes images from the head camera.
- `lidar_driver`: Publishes point cloud data.
- `inverse_kinematics`: Calculates joint angles for the legs.
- `action_planner`: Decides what the robot should do next.

Here is a minimal example of a ROS 2 node in Python using `rclpy`.

```python
import rclpy
from rclpy.node import Node

class MyNode(Node):
    def __init__(self):
        super().__init__('my_simple_node')
        self.get_logger().info('Hello from my ROS 2 node!')

def main(args=None):
    rclpy.init(args=args)
    node = MyNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```
This code initializes `rclpy`, creates a node, "spins" the node to keep it running and responsive to ROS events, and then properly shuts it down.

## Topics: One-to-Many Broadcasting

Topics are the most common communication pattern. They work on a publish-subscribe model, perfect for continuous data streams like sensor readings or robot state.

- A **publisher** node writes data to a topic.
- A **subscriber** node reads data from that topic.

Many nodes can subscribe to the same topic, and a single node can publish to multiple topics.

### Example: Publishing Camera Images

A camera node would publish images to a topic, say `/camera/image_raw`.

```python
# camera_publisher_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
# (Image generation/capture code omitted for brevity)

class ImagePublisher(Node):
    def __init__(self):
        super().__init__('image_publisher')
        self.publisher_ = self.create_publisher(Image, '/camera/image_raw', 10)
        timer_period = 0.1  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

    def timer_callback(self):
        msg = Image() # Populate with image data
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing an image')
```

An object detection node could then subscribe to this topic to process the images.

```python
# object_detector_node.py
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image

class ObjectDetector(Node):
    def __init__(self):
        super().__init__('object_detector')
        self.subscription = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.listener_callback,
            10)

    def listener_callback(self, msg):
        self.get_logger().info('I received an image!')
        # (Add object detection logic here)
```

## Services: Request-Response

Services are used for two-way, request-response communication. A **service client** sends a request, and a **service server** processes it and sends back a response. Unlike topics, this is a synchronous-style interaction (though it's handled asynchronously under the hood).

This is useful for tasks that should be performed on demand, like "calculate the inverse kinematics for this arm position."

### Example: A Simple Calculator Service

First, you define the service interface in a `.srv` file:
`AddTwoInts.srv`
```
int64 a
int64 b
---
int64 sum
```

The server node would implement the service:

```python
# calculator_server_node.py
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class CalculatorService(Node):
    def __init__(self):
        super().__init__('calculator_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Incoming request: a={request.a}, b={request.b}. Returning sum={response.sum}')
        return response
```

The client node would call the service:
```python
# calculator_client_node.py
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class CalculatorClient(Node):
    def __init__(self):
        super().__init__('calculator_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')
        self.req = AddTwoInts.Request()

    async def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        response = await self.future
        return response
```
Note the use of `async` and `await`, which is a best practice in `rclpy` for handling service calls without blocking the node.

## Actions: Long-Running Tasks with Feedback

Actions are designed for long-running, goal-oriented tasks that may need to be preempted and should provide feedback along the way. Think "navigate to the kitchen" or "pick up the red ball."

An **action client** sends a goal to an **action server**. The server executes the goal, providing periodic **feedback** (e.g., "distance to goal is 5 meters"), and finally returns a **result**.

Actions are the most complex pattern but are essential for robotics. We will explore them in-depth in later chapters when we build autonomous behaviors.