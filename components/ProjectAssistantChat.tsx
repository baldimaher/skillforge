'use client';

import { useState } from 'react';

type Message = {
  from: 'user' | 'bot';
  text: string;
  buttons?: {
    label: string;
    value: string;
    docLink?: string;
  }[];
};

type GuideStep = {
  step: number;
  text: string;
};

const languageDocs: Record<string, string> = {
  React: 'https://react.dev/learn',
  Angular: 'https://angular.io/docs',
  Vue: 'https://vuejs.org/guide/introduction.html',
  Node: 'https://nodejs.org/en/docs',
  SpringBoot: 'https://spring.io/projects/spring-boot',
  Express: 'https://expressjs.com/en/starter/installing.html',
  Laravel: 'https://laravel.com/docs',
  Git: 'https://git-scm.com/doc',
  Scrum: 'https://www.scrum.org/resources/what-is-scrum',
  UML: 'https://www.uml-diagrams.org/',
};

const guides: Record<string, GuideStep[]> = {
  React: [
    { step: 1, text: "Installer Node.js et npm depuis https://nodejs.org" },
    { step: 2, text: "Créer un projet React avec `npx create-react-app mon-projet` ou Vite" },
    { step: 3, text: "Comprendre la structure des dossiers" },
    { step: 4, text: "Lancer l’application avec `npm start` ou `npm run dev`" },
    { step: 5, text: "Écrire un composant simple fonctionnel" },
  ],
  Node: [
    { step: 1, text: "Installer Node.js depuis https://nodejs.org" },
    { step: 2, text: "Initialiser un projet avec `npm init`" },
    { step: 3, text: "Installer Express avec `npm install express`" },
    { step: 4, text: "Créer un serveur simple" },
    { step: 5, text: "Tester le serveur avec Postman ou navigateur" },
  ],
  SpringBoot: [
    { step: 1, text: "Installer Java JDK (11 ou plus)" },
    { step: 2, text: "Installer un IDE comme IntelliJ IDEA ou Eclipse" },
    { step: 3, text: "Créer un projet Spring Boot via https://start.spring.io/" },
    { step: 4, text: "Comprendre la structure du projet généré" },
    { step: 5, text: "Lancer l’application avec `./mvnw spring-boot:run` ou dans l’IDE" },
  ],
  Laravel: [
    { step: 1, text: "Installer PHP et Composer (gestionnaire de dépendances)" },
    { step: 2, text: "Installer Laravel avec `composer create-project laravel/laravel mon-projet`" },
    { step: 3, text: "Configurer le fichier `.env` pour la base de données" },
    { step: 4, text: "Lancer le serveur de développement avec `php artisan serve`" },
    { step: 5, text: "Créer une route et une vue simple" },
  ],
  Express: [
    { step: 1, text: "Installer Node.js depuis https://nodejs.org" },
    { step: 2, text: "Initialiser un projet avec `npm init`" },
    { step: 3, text: "Installer Express avec `npm install express`" },
    { step: 4, text: "Créer un serveur simple dans un fichier `index.js`" },
    { step: 5, text: "Lancer le serveur avec `node index.js` et tester" },
  ],
  Angular: [
    { step: 1, text: "Installer Node.js et npm depuis https://nodejs.org" },
    { step: 2, text: "Installer Angular CLI avec `npm install -g @angular/cli`" },
    { step: 3, text: "Créer un nouveau projet avec `ng new mon-projet`" },
    { step: 4, text: "Lancer l’application avec `ng serve`" },
    { step: 5, text: "Explorer la structure du projet et créer un composant" },
  ],
  Vue: [
    { step: 1, text: "Installer Node.js et npm depuis https://nodejs.org" },
    { step: 2, text: "Installer Vue CLI avec `npm install -g @vue/cli`" },
    { step: 3, text: "Créer un nouveau projet avec `vue create mon-projet`" },
    { step: 4, text: "Lancer l’application avec `npm run serve`" },
    { step: 5, text: "Comprendre la structure du projet et créer un composant simple" },
  ],
};

function getMainButtons() {
  return [
    { label: 'Frontend', value: 'frontend' },
    { label: 'Backend', value: 'backend' },
    { label: 'Gestion', value: 'gestion' },
    { label: 'Guide moi', value: 'guide moi' },
  ];
}

export default function ProjectChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Bienvenue ! Choisissez une catégorie pour démarrer :',
      buttons: getMainButtons(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [currentGuide, setCurrentGuide] = useState<{ language: string; stepIndex: number } | null>(null);
  const [awaitingLanguageSelection, setAwaitingLanguageSelection] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const newMessage: Message = { from: 'user', text };
    setMessages(prev => [...prev, newMessage]);
    handleBotResponse(text.trim());
    setInputText('');
  };

  const sendBotMessage = (text: string, buttons?: Message['buttons']) => {
    setMessages(prev => [...prev, { from: 'bot', text, buttons }]);
  };

  const handleBotResponse = (text: string) => {
    const lowerText = text.toLowerCase();

    // Gestion guide étape par étape
    if (currentGuide) {
      const guideSteps = guides[currentGuide.language];
      if (!guideSteps) {
        sendBotMessage(`Désolé, pas de guide disponible pour ${currentGuide.language}.`, getMainButtons());
        setCurrentGuide(null);
        return;
      }

      if (lowerText === 'suivant' || lowerText === 'next') {
        const nextIndex = currentGuide.stepIndex + 1;
        if (nextIndex < guideSteps.length) {
          setCurrentGuide({ language: currentGuide.language, stepIndex: nextIndex });
          sendBotMessage(
            `Étape ${guideSteps[nextIndex].step} : ${guideSteps[nextIndex].text}\nTapez "suivant" pour continuer, ou "stop" pour quitter.`,
            [{ label: 'Suivant', value: 'suivant' }, { label: 'Stop', value: 'stop' }]
          );
        } else {
          sendBotMessage(`Félicitations, vous avez terminé le guide ${currentGuide.language} ! 🎉`, getMainButtons());
          setCurrentGuide(null);
        }
        return;
      }

      if (lowerText === 'stop' || lowerText === 'arrêter') {
        sendBotMessage(`Guide ${currentGuide.language} arrêté. Que voulez-vous faire maintenant ?`, getMainButtons());
        setCurrentGuide(null);
        return;
      }

      sendBotMessage(`Tapez "suivant" pour continuer, ou "stop" pour quitter le guide.`, [
        { label: 'Suivant', value: 'suivant' },
        { label: 'Stop', value: 'stop' },
      ]);
      return;
    }

    // Attente sélection langage pour guide
    if (awaitingLanguageSelection) {
      if (guides[text]) {
        setCurrentGuide({ language: text, stepIndex: 0 });
        setAwaitingLanguageSelection(false);
        const firstStep = guides[text][0];
        sendBotMessage(
          `Début du guide pour ${text}.\nÉtape ${firstStep.step} : ${firstStep.text}\nTapez "suivant" pour continuer.`,
          [{ label: 'Suivant', value: 'suivant' }, { label: 'Stop', value: 'stop' }]
        );
      } else {
        sendBotMessage(
          `Désolé, je n'ai pas de guide pour "${text}". Veuillez choisir parmi : ${Object.keys(guides).join(', ')}.`,
          getMainButtons()
        );
      }
      return;
    }

    // Commandes de base
    if (lowerText === 'guide moi') {
      setAwaitingLanguageSelection(true);
      sendBotMessage(
        "Quel langage ou framework souhaitez-vous apprendre ? Par exemple : React, Node, SpringBoot, Laravel, Angular, Vue...",
        Object.keys(guides).map(lang => ({ label: lang, value: lang }))
      );
      return;
    }

    if (lowerText === 'frontend') {
      sendBotMessage(
        'Voici quelques technologies frontend populaires :',
        [
          { label: 'React', value: 'React', docLink: languageDocs.React },
          { label: 'Angular', value: 'Angular', docLink: languageDocs.Angular },
          { label: 'Vue', value: 'Vue', docLink: languageDocs.Vue },
          { label: 'Guide moi', value: 'guide moi' },
        ]
      );
      return;
    }

    if (lowerText === 'backend') {
      sendBotMessage(
        'Voici des frameworks backend populaires :',
        [
          { label: 'Node', value: 'Node', docLink: languageDocs.Node },
          { label: 'Spring Boot', value: 'SpringBoot', docLink: languageDocs.SpringBoot },
          { label: 'Express', value: 'Express', docLink: languageDocs.Express },
          { label: 'Laravel', value: 'Laravel', docLink: languageDocs.Laravel },
          { label: 'Guide moi', value: 'guide moi' },
        ]
      );
      return;
    }

    if (lowerText === 'gestion') {
      sendBotMessage(
        'Voici des outils de gestion de projet :',
        [
          { label: 'Git', value: 'Git', docLink: languageDocs.Git },
          { label: 'Scrum', value: 'Scrum', docLink: languageDocs.Scrum },
          { label: 'UML', value: 'UML', docLink: languageDocs.UML },
          { label: 'Guide moi', value: 'guide moi' },
        ]
      );
      return;
    }

    if (languageDocs[text]) {
      sendBotMessage(
        `Voici la documentation de ${text} :`,
        [
          { label: `Ouvrir ${text}`, value: text, docLink: languageDocs[text] },
          { label: 'Guide moi', value: 'guide moi' },
        ]
      );
      return;
    }

    sendBotMessage(
      "Je ne comprends pas. Tapez 'frontend', 'backend', 'gestion' ou 'guide moi' pour commencer.",
      getMainButtons()
    );
  };

  const handleButtonClick = (value: string) => {
    sendMessage(value);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white shadow-xl rounded-xl p-6 space-y-4 flex flex-col h-full">
      <h2 className="text-2xl font-semibold text-center">Assistant de Projet</h2>
      <div className="flex-1 overflow-y-auto border p-4 rounded-lg space-y-2 mb-4" style={{ minHeight: 400 }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.from === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 whitespace-pre-line ${
                msg.from === 'user' ? 'bg-blue-200' : 'bg-gray-200'
              }`}
            >
              <p>{msg.text}</p>
            </div>
            {msg.buttons && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msg.buttons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.docLink || '#'}
                    onClick={e => {
                      if (!btn.docLink) {
                        e.preventDefault();
                        handleButtonClick(btn.value);
                      }
                    }}
                    className="px-3 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm"
                    target={btn.docLink ? '_blank' : undefined}
                    rel={btn.docLink ? 'noopener noreferrer' : undefined}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
          placeholder="Écrire un message..."
          className="flex-1 border px-4 py-2 rounded-md"
          autoFocus
        />
        <button
          onClick={() => sendMessage(inputText)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
