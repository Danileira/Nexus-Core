/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';
import { translations } from '../locales/translations';

const IdiomaContext = createContext();

export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState('pt');

  function t(chave) {
    return translations[idioma]?.[chave] || translations['pt']?.[chave] || chave;
  }

  function alternarIdioma(novoIdioma) {
    setIdioma(novoIdioma);
  }

  return (
    <IdiomaContext.Provider value={{ idioma, alternarIdioma, t }}>
      {children}
    </IdiomaContext.Provider>
  );
}

export function useIdioma() {
  return useContext(IdiomaContext);
}