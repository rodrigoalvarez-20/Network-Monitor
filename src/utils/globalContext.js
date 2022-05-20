import { createContext, useContext, useReducer } from "react";


const globalState = {
    user_logged: {}
}

const globalStateContext = createContext(globalState);

const dispatchStateContext = createContext(undefined);

const GlobalStateProvider = ({ children }) => {
    const [state, dispatch] = useReducer(
        (act_state, newValue) => ({ ...act_state, ...newValue }),
        globalState
    );
    return (
        <globalStateContext.Provider value={state}>
            <dispatchStateContext.Provider value={dispatch}>
                {children}
            </dispatchStateContext.Provider>
        </globalStateContext.Provider>
    );
};

const useGlobalState = () => [
    useContext(globalStateContext), 
    useContext(dispatchStateContext)
]

export {  useGlobalState, GlobalStateProvider }