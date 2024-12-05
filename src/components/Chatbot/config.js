import Flowchart from '../Flowchart';
import Flowchart2 from '../Flowchart2';

import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  botName: "FlowBot",
  initialMessages: [
    createChatBotMessage("Hi! I can help with answers or create flowcharts. Just ask!"),
  ],
  widgets: [
    {
      widgetName: "flowchart",
      widgetFunc: (props) => <Flowchart {...props} />,
    },
    {
      widgetName: "flowchart2",
      widgetFunc: (props) => <Flowchart2 {...props} />,
    },
  ],
};

export default config;
