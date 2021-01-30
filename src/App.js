import React, { useState, useEffect, useRef, useReducer, useCallback } from "react";
import './App.css';

const storiesReducer = (state, action) => {
  switch (action.type) {
    case "STORIES_FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "STORIES_FETCH_SUCCESS":
      return {
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "STORIES_FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case "REMOVE_STORY":
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID)
      };
    default:
      throw new Error();
  }
}


// using custom hook, name is useSemiPersistentState just because it uses localStorage, and deleting localStorage may change the state
// custom hook name convention: use + UpperCase name
// return values must be an array of values
const useSemiPersistentState = (key, initialState) => {
  const [value, setValue] = useState(
    localStorage.getItem(key) || initialState
  );
  // seperate the side effect(setting a value to localstorage)
  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);
  return [value, setValue];
}

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const App = () => {
  const [searchTerm, setSearchTerm] = useSemiPersistentState("search", "React");

  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  )
  //using memoized handler, this increased performance from %46 to %55, at the lighthouse report
  const handleFetchStories = useCallback(() => {
    if (!searchTerm) return;
    dispatchStories({ type: 'STORIES_FETCH_INIT' });
    fetch(`${API_ENDPOINT}${searchTerm}`)
      .then(response => response.json())
      .then(result => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits,
        });
      })
      .catch(() =>
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [searchTerm]); // E

  useEffect(() => {
    handleFetchStories(); // C
  }, [handleFetchStories]); // D


  const handleRemoveStory = (item) => {
    dispatchStories({
      type: "REMOVE_STORY",
      payload: item,
    })
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  }
  return (
    <div>
      <h1>Hacker Stories</h1>
      {/* using composition inside InputWithLabelComponent (using it like a html element by the help of children prop)*/}
      <InputWithLabel
        id="search"
        value={searchTerm}
        onInputChange={handleSearch}
        isFocused//default to true, isFocused EQUALS isFocused = {true}
      >
        <strong>Search:</strong>
      </InputWithLabel>
      <hr />
      {stories.isError && <p>Something went wrong ...</p>}
      {/* adding coditional rendering */}
      {stories.isLoading ?
        (<p>Loading...</p>) :
        (
          <List
            list={stories.data}
            onRemoveItem={handleRemoveStory}
          />
        )
      }
    </div>
  );
}
const List = ({ list, onRemoveItem }) => {
  //using rest and spread operators together (first 3dots is rest, second 3dots is spread operator)
  //return list.map(({ objectID, ...item }) => <Item key={objectID} {...item} onRemoveItem={onRemoveItem} />);
  return list.map(item => (
    <Item
      key={item.objectID}
      item={item}
      onRemoveItem={onRemoveItem}
    />
  ))
}

const Item = ({ item, onRemoveItem }) => {
  //executing item remove in the classical way
  const handleRemoveItem = () => onRemoveItem(item);

  return (
    <div>
      <span>
        <a href={item.url}>{item.title}</a>
      </span>
      <span>{item.author}</span>
      <span>{item.num_comments}</span>
      <span>{item.points}</span>
      <span>
        {/* executing item remove in the classical way
      <button type="button" onClick={handleRemoveItem}> */}

        {/* using inline handler by the help of arrow functions */}
        {/* avoid complex logic here!, one function to execute is enough */}
        <button type="button" onClick={() => handleRemoveItem(item)}>
          Dismiss
        </button>
      </span>

    </div>
  );
};

const InputWithLabel = ({ id, value, type = 'text', onInputChange, isFocused, children }) => {
  const inputRef = useRef();
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  return (
    <>
      <label htmlFor={id}>{children} </label>
      &nbsp;
      <input
        ref={inputRef}
        value={value}
        id={id}
        type={type}
        onChange={onInputChange}
        autoFocus={isFocused}
      //add auto focus declaretively
      //autoFocus
      />
    </>
  );
}

export default App;
