import * as React from "react";
import { defaultTestSuite, setStoredTestSuite } from "./Storage";
import { swapPositions } from "./SwapPositions";
import { TestDefinition, TestSuite } from "./TestSuite";


type Action = { type: "updateSuite", payload: TestSuite }
    | { type: "updateTest", payload: { id: string; test: TestDefinition } }
    | { type: "addTest", payload: TestDefinition }
    | { type: "moveTestUp", payload: { id: string } }
    | { type: "moveTestDown", payload: { id: string } };

export type SuiteStateDispatch = (action: Action) => void;

export type SuiteStateProps = {
    suite?: TestSuite;
};

function stateReducer(state: SuiteStateProps, action: Action): SuiteStateProps {
    switch (action.type) {
        case "updateSuite": {
            setStoredTestSuite(action.payload);
            return { ...state, suite: action.payload };
        }
        case "addTest": {
            const update = { ...state.suite, tests: [ ...(state.suite?.tests ?? []), action.payload ]};
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "updateTest": {
            const newTests = [...(state?.suite?.tests ?? [])];
            const position = newTests.findIndex(t => t.id === action.payload.id);
    
            if (action.payload.test) {
                newTests.splice(position, 1, { ...action.payload.test });
            }
            else {   
                newTests.splice(position, 1);
            }
    
            const update = { ...state.suite, tests: newTests };
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "moveTestUp": {
            const index = state.suite.tests.findIndex(t => t.id === action.payload.id);
            
            if (index === 0) {
                return state;
            }

            const destinationIndex = index - 1;
            const newArray = [...state.suite.tests];
            swapPositions(newArray, index, destinationIndex);

            const update = { ...state.suite, tests: newArray };
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "moveTestDown": {
            const index = state.suite.tests.findIndex(t => t.id === action.payload.id);
            
            if (index === state.suite.tests.length - 1) {
                return state;
            }

            const destinationIndex = index + 1;
            const newArray = [...state.suite.tests];
            swapPositions(newArray, index, destinationIndex);

            const update = { ...state.suite, tests: newArray };
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
    }
}

const SuiteState = React.createContext<SuiteStateProps | undefined>({ suite: defaultTestSuite });
const SuiteDispatch = React.createContext<SuiteStateDispatch | undefined>(undefined);

export const SuiteStateProvider: React.FC<SuiteStateProps> = (props) => {
    const [state, dispatch] = React.useReducer(stateReducer, { suite: props.suite ?? defaultTestSuite });

    return (
        <SuiteState.Provider value={state}>
            <SuiteDispatch.Provider value={dispatch}>
                {props.children}
            </SuiteDispatch.Provider>
        </SuiteState.Provider>
    );
};

export const useSuiteState = () => {
    const context = React.useContext(SuiteState);

    if (!context) {
        throw new Error("useSuiteState must be used within a state provider!");
    }

    return context;
};

export const useSuiteDispatch = () => {
    const context = React.useContext(SuiteDispatch);

    if (!context) {
        throw new Error("useConfigDispatch must be used within a state provider!");
    }

    return context;
};

export const useSuiteContext = (): [ SuiteStateProps, SuiteStateDispatch ] => {
    return [ useSuiteState(), useSuiteDispatch() ];
};