---
title: "LLM Cognitive Planning for Robotics"
---

# Chapter 9: LLM Cognitive Planning for Robotics

Once a robot understands a user's intent (e.g., "get me the soda"), it needs to figure out *how* to accomplish that goal. This requires breaking down a high-level command into a sequence of concrete, executable actions. This is the domain of **cognitive planning**.

Traditionally, this was done with complex, hand-coded state machines or planning algorithms. However, Large Language Models (LLMs) have emerged as a powerful tool for this task. They have a degree of common-sense reasoning that allows them to generate plans for tasks they haven't been explicitly programmed for.

## From Intent to Action Plan

A "Cognitive Planner" node, built around an LLM, can take a structured intent and generate a sequence of robot actions.

1.  **Input**: The planner subscribes to the `/robot/command_intent` topic from the previous chapter. Let's say it receives:
    `{"intent": "fetch", "object": "soda", "destination": "me"}`

2.  **World State**: To make a good plan, the LLM needs to know about the current state of the world. The planner node would gather this context, such as:
    -   The robot's current location.
    -   A list of known objects and their locations (e.g., from a perception system). Example: `{"soda": "on_kitchen_counter", "me": "in_living_room"}`.
    -   A list of the robot's available primitive actions (e.g., `navigate_to`, `pick_up`, `put_down`).

3.  **LLM Prompting**: The planner combines this information into a detailed prompt for the LLM.

    **Example Prompt:**

    ```
    You are a cognitive planner for a humanoid robot. Your job is to create a sequence of actions to fulfill a user's goal.

    Current World State:
    - Robot location: 'living_room'
    - Object locations: {'soda': 'on_kitchen_counter'}
    - User location: 'living_room'

    Available Actions:
    - navigate_to(target_location)
    - pick_up(object, location)
    - put_down(object, location)

    User Goal:
    - fetch 'soda' for 'user'

    Generate a plan as a JSON array of action objects.
    ```

4.  **LLM Output**: The LLM processes the prompt and returns a structured plan:
    ```json
    [
      {
        "action": "navigate_to",
        "parameters": {"target_location": "kitchen_counter"}
      },
      {
        "action": "pick_up",
        "parameters": {"object": "soda", "location": "kitchen_counter"}
      },
      {
        "action": "navigate_to",
        "parameters": {"target_location": "living_room"}
      },
      {
        "action": "put_down",
        "parameters": {"object": "soda", "location": "user"}
      }
    ]
    ```

## Executing the Plan

The Cognitive Planner node then acts as an orchestrator. It would take this list of actions and execute them one by one, using ROS 2 action clients to communicate with the robot's other systems (like Nav2 for navigation and a manipulation system for picking and placing).

### Python Example: Generating ROS 2 Goals

[NOTE: The Python code example has been temporarily removed to resolve a build issue. It will be re-inserted after further debugging.]

This script shows the core concept: using an LLM to bridge the gap between ambiguous human language and the structured, specific commands a robot's action servers need to function.