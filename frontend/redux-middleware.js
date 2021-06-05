const { createStore, applyMiddleware } = require('redux');

function reducer(state, action){
    return {value: action.value};
}

const customMiddleware = store => next => action => {
    if(action.type === 'actionX'){
        next({type: action.type, value: 'test'});
        return;
    }
    console.log(action);
    //assincrona
    next(action);
    console.log('Eich');
};

const store = createStore(
    reducer,
    applyMiddleware(customMiddleware)
);

const action = (type, value) => store.dispatch({type, value});

action('actionX', 'action x value ');

console.log(store.getState());