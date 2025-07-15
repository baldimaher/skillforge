// types/react-simple-chatbot.d.ts

declare module 'react-simple-chatbot' {
  import * as React from 'react';

  interface Step {
    id: string;
    message?: string;
    trigger?: string;
    options?: { value: string; label: string; trigger: string }[];
    end?: boolean;
  }

  interface ChatBotProps {
    steps: Step[];
    floating?: boolean;
    opened?: boolean;
    headerTitle?: string;
  }

  export default class ChatBot extends React.Component<ChatBotProps> {}
}
