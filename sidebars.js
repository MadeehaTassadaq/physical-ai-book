/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Define the sidebar ID here.
  bookSidebar: [
    {
      type: 'doc',
      id: 'intro', // The intro doc
    },
    {
      type: 'category',
      label: 'Module 1: The Robotic Nervous System (ROS 2)',
      items: ['module1/chapter1', 'module1/chapter2', 'module1/chapter3'],
    },
    {
      type: 'category',
      label: 'Module 2: The Digital Twin (Gazebo & Unity)',
      items: ['module2/chapter4', 'module2/chapter5'],
    },
    {
      type: 'category',
      label: 'Module 3: The AI-Robot Brain (NVIDIA Isaac™)',
      items: ['module3/chapter6', 'module3/chapter7'],
    },
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: ['module4/chapter8', 'module4/chapter9'],
    },
    {
      type: 'doc',
      id: 'capstone',
    },
  ],
};

export default sidebars;
