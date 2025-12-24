---
title: "Speech-to-Intent with OpenAI Whisper"
---

# Chapter 8: Speech-to-Intent with OpenAI Whisper

For a humanoid robot to be a true assistant, it needs to interact with people naturally. The most natural form of human communication is speech. This chapter explores how to give our robot the ability to understand spoken commands.

## From Speech to Text

The first step is converting spoken audio into written text. This is called **Automatic Speech Recognition (ASR)**. **OpenAI's Whisper** is a state-of-the-art, open-source ASR model that is highly accurate and robust to background noise and different accents.

A ROS 2 node can be created to handle this process:
1.  **Audio Input**: The node subscribes to an audio stream from a microphone array connected to the robot.
2.  **Whisper Model**: The node uses the Whisper library to process the audio data. The model can run locally on the robot's GPU (for smaller versions) or be called via an API for the most powerful version.
3.  **Text Output**: The node publishes the transcribed text to a ROS 2 topic, such as `/human/speech_transcript`.

## From Text to Intent

Once we have the text, we need to understand what the user *wants*. This is called **Natural Language Understanding (NLU)** or **Intent Recognition**.

For simple commands, this can be a rule-based system.
- If the text contains "go to the kitchen," the intent is `navigate` with the target `kitchen`.
- If the text contains "pick up the red ball," the intent is `manipulate` with the object `red_ball`.

However, human language is ambiguous. "Can you get me the apple?" and "Bring me the apple" have the same intent. A more robust approach is to use a pre-trained **Large Language Model (LLM)**.

An "Intent Recognition" node would:
1.  **Subscribe** to the `/human/speech_transcript` topic.
2.  **Prompt the LLM**: Take the transcribed text and feed it into a prompt for an LLM like GPT-4 or Claude. The prompt would be structured to ask the model to extract the user's intent and any relevant parameters from the text.

    **Example Prompt:**
    ```
    You are the NLU module for a service robot. Given the following user command, extract the user's intent and the target object or location. The possible intents are 'navigate', 'pickup', and 'greet'.

    User command: "Hey robot, can you please go to the charging dock?"

    Output your response as a JSON object.
    ```

3.  **Parse the Output**: The LLM would respond with a structured JSON object:
    ```json
    {
      "intent": "navigate",
      "target": "charging_dock"
    }
    ```

4.  **Publish the Intent**: The node would then publish this structured data to a new topic, like `/robot/command_intent`. This structured message is much easier for the robot's action planning system to understand and execute than the raw text.