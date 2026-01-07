import React, { createContext, useContext, useState } from "react";

interface SparqlContextType {
  sparqlQuery: string;
  setSparqlQuery: (query: string) => void;
  executeQuery: boolean;
  setExecuteQuery: (execute: boolean) => void;
}

const SparqlContext = createContext<SparqlContextType | undefined>(undefined);

export const SparqlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sparqlQuery, setSparqlQuery] = useState("");
  const [executeQuery, setExecuteQuery] = useState(false);

  return (
    <SparqlContext.Provider
      value={{ sparqlQuery, setSparqlQuery, executeQuery, setExecuteQuery }}
    >
      {children}
    </SparqlContext.Provider>
  );
};

export const useSparql = () => {
  const context = useContext(SparqlContext);
  if (!context) {
    throw new Error("useSparql doit être utilisé dans SparqlProvider");
  }
  return context;
};
