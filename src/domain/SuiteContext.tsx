import * as React from "react";
import { defaultTestSuite, setStoredTestSuite } from "./Storage";
import { swapPositions } from "./SwapPositions";
import { TestDefinition, TestGroup, TestSuite } from "./TestSuite";


type Action = { type: "updateSuite", payload: { suite: TestSuite; persist: boolean } }
    | { type: "updateTest", payload: { groupId: string; id: string; test: TestDefinition } }
    | { type: "addTest", payload: { groupId: string; test: TestDefinition } }
    | { type: "addTestGroup", payload: { group: TestGroup} }
    | { type: "moveTestUp", payload: { groupId: string; id: string } }
    | { type: "moveTestDown", payload: { groupId: string; id: string } };

export type SuiteStateDispatch = (action: Action) => void;

export type SuiteStateProps = {
    suite?: TestSuite;
};

function stateReducer(state: SuiteStateProps, action: Action): SuiteStateProps {
    switch (action.type) {
        case "updateSuite": {
            if (action.payload.persist) {
                setStoredTestSuite(action.payload.suite);
            }
            return { ...state, suite: action.payload.suite };
        }
        case "addTest": {
            const group = state.suite.groups.find(g => g.id === action.payload.groupId);

            if (!group) {
                return state;
            }

            const groupUpdate: TestGroup = { ...group, tests: [ ...group.tests, action.payload.test ]};

            const update = { ...state.suite, groups: state.suite.groups.map(t => t.id !== action.payload.groupId ? t : groupUpdate)};
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "addTestGroup": {
            const update = { ...state.suite, groups: [ ...(state.suite?.groups ?? []), action.payload.group ]};
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "updateTest": {
            const group = state.suite.groups.find(g => g.id === action.payload.groupId);

            if (!group) {
                return state;
            }

            const newTests = [...(group?.tests ?? [])];
            const position = newTests.findIndex(t => t.id === action.payload.id);
    
            if (action.payload.test) {
                newTests.splice(position, 1, { ...action.payload.test });
            }
            else {   
                newTests.splice(position, 1);
            }

            const groupUpdate: TestGroup = { ...group, tests: newTests };
    
            const update: TestSuite = { ...state.suite, groups: state.suite.groups.map(t => t.id !== action.payload.groupId ? t : groupUpdate) };
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "moveTestUp": {
            const group = state.suite.groups.find(g => g.id === action.payload.groupId);

            if (!group) {
                return state;
            }

            const index = group.tests.findIndex(t => t.id === action.payload.id);
            
            if (index === 0) {
                return state;
            }

            const destinationIndex = index - 1;
            const newArray = [...group.tests];
            swapPositions(newArray, index, destinationIndex);

            const groupUpdate: TestGroup = { ...group, tests: newArray };
            const update: TestSuite = { ...state.suite, groups: state.suite.groups.map(t => t.id !== action.payload.groupId ? t : groupUpdate) };
            setStoredTestSuite(update);

            return { ...state, suite: update };
        }
        case "moveTestDown": {
            const group = state.suite.groups.find(g => g.id === action.payload.groupId);

            if (!group) {
                return state;
            }

            const index = group.tests.findIndex(t => t.id === action.payload.id);
            
            if (index === group.tests.length - 1) {
                return state;
            }

            const destinationIndex = index + 1;
            const newArray = [...group.tests];
            swapPositions(newArray, index, destinationIndex);

            const groupUpdate: TestGroup = { ...group, tests: newArray };
            const update: TestSuite = { ...state.suite, groups: state.suite.groups.map(t => t.id !== action.payload.groupId ? t : groupUpdate) };
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