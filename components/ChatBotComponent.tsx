"use client";

import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";

const theme = {
  background: "#f5f8fb",
  fontFamily: "Arial",
  headerBgColor: "#1e40af", 
  headerFontColor: "#fff",
  headerFontSize: "16px",
  botBubbleColor: "#1e40af",
  botFontColor: "#fff",
  userBubbleColor: "#fff",
  userFontColor: "#333",
};

const steps = [
  {
    id: "1",
    message: "Bienvenue sur SkillForge👋 Comment puis-je vous aider ?",
    trigger: "menu",
  },
  {
    id: "menu",
    options: [
      { value: "formation", label: "Voir les formations 📚", trigger: "formation" },
      { value: "bug", label: "Signaler un bug 🐛", trigger: "bug" },
      { value: "contact", label: "Contacter l’équipe 📩", trigger: "contact" },
    ],
  },
  {
    id: "formation",
    message: "Tu peux voir les formations dans la page 'Formations' du menu principal.",
    end: true,
  },
  {
    id: "bug",
    message: "Merci ! Tu peux signaler un bug depuis le formulaire de contact 🛠️.",
    end: true,
  },
  {
    id: "contact",
    message: "Tu peux nous contacter à support@SkillForge.com 📬",
    end: true,
  },
];

export default function ChatBotComponent() {
  return (
    <ThemeProvider theme={theme}>
      <ChatBot steps={steps} floating={true} />
    </ThemeProvider>
  );
}
